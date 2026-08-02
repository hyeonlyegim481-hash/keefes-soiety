import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KIND_DOWNLOAD_URL =
  "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13&marketType=stockMkt";
const KIND_LIST_URL =
  "https://kind.krx.co.kr/corpgeneral/corpList.do?method=loadInitPage";
const EXPECTED_HEADERS = [
  "회사명",
  "시장구분",
  "종목코드",
  "업종",
  "주요제품",
  "상장일",
  "결산월",
  "대표자명",
  "홈페이지",
  "지역"
];

const response = await fetch(KIND_DOWNLOAD_URL, {
  headers: {
    accept: "application/vnd.ms-excel,text/html;q=0.9,*/*;q=0.8",
    "user-agent": "Mozilla/5.0 keefes-society/0.1"
  },
  signal: AbortSignal.timeout(30_000)
});

if (!response.ok) {
  throw new Error(`KIND company download returned HTTP ${response.status}`);
}

const html = new TextDecoder("euc-kr").decode(await response.arrayBuffer());
const rows = parseTableRows(html);
if (rows.length < 2) throw new Error("KIND company table is empty");

const headers = rows[0];
if (JSON.stringify(headers) !== JSON.stringify(EXPECTED_HEADERS)) {
  throw new Error(`Unexpected KIND headers: ${headers.join(", ")}`);
}

const collectedAt = new Date().toISOString();
const rawCompanies = rows
  .slice(1)
  .map((cells) => buildCompany(
    Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])),
    collectedAt
  ))
  .sort((a, b) => a.ticker.localeCompare(b.ticker, "en"));
const companies = deduplicateCompanies(rawCompanies);

if (companies.length < 750 || companies.length > 950) {
  throw new Error(`Unexpected KOSPI company count: ${companies.length}`);
}
if (companies.some((company) => company.market !== "KOSPI")) {
  throw new Error("The KIND response contains a non-KOSPI company");
}
if (new Set(companies.map((company) => company.ticker)).size !== companies.length) {
  const duplicateTickers = [...new Set(companies.filter((company, index) => companies.findIndex((item) => item.ticker === company.ticker) !== index).map((company) => company.ticker))];
  const duplicateGroups = duplicateTickers.map((ticker) => ({ ticker, rows: companies.filter((company) => company.ticker === ticker).map(({ name, krxIndustry, products, listedAt }) => ({ name, krxIndustry, products, listedAt })) }));
  throw new Error(`The KIND response contains duplicate representative tickers: ${JSON.stringify(duplicateGroups)}`);
}
if (companies.some((company) => !/^[0-9A-Z]{6}$/.test(company.ticker))) {
  throw new Error("The KIND response contains an invalid representative ticker");
}

const metadata = {
  provider: "한국거래소 KIND",
  sourceUrl: KIND_LIST_URL,
  downloadUrl: KIND_DOWNLOAD_URL,
  collectedAt,
  market: "KOSPI",
  count: companies.length,
  rawRowCount: rawCompanies.length,
  duplicateRowsRemoved: rawCompanies.length - companies.length,
  scope: "KIND 상장법인목록에서 시장구분이 유가인 회사별 대표 종목"
};
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "kospi-company-catalog.js"
);

const compactRows = companies.map((company) => [
  company.ticker,
  company.name,
  company.industryId,
  company.krxIndustry,
  company.products,
  company.listedAt,
  company.fiscalMonth,
  company.representative,
  company.homepage,
  company.region,
  company.regions || null
]);
const generatedLines = [
  `export const kospiCatalogMetadata = Object.freeze(${JSON.stringify(metadata, null, 2)});`,
  "",
  `const KOSPI_SOURCE = Object.freeze(${JSON.stringify({ label: "한국거래소 KIND 상장법인 기본정보", url: KIND_LIST_URL }, null, 2)});`,
  "",
  `const kospiCompanyRows = Object.freeze(${JSON.stringify(compactRows, null, 2)});`,
  "",
  "export const kospiCompanyCatalog = Object.freeze(kospiCompanyRows.map(([",
  "  ticker, name, industryId, krxIndustry, products, listedAt, fiscalMonth,",
  "  representative, homepage, region, regions",
  "]) => Object.freeze({",
  "  id: `kospi-${ticker.toLowerCase()}`,",
  "  name, ticker, country: \"한국\", market: \"KOSPI\", sectorId: industryId, industryId,",
  "  role: krxIndustry, snapshotStatus: \"catalog-only\", catalogOnly: true,",
  "  business: products, healthParts: null, watch: [], krxIndustry, products,",
  "  listedAt, fiscalMonth, representative, homepage, region, regions: regions || (region ? [region] : []),",
  "  catalogCollectedAt: kospiCatalogMetadata.collectedAt, source: KOSPI_SOURCE",
  "})));",
  ""
];
await writeFile(outputPath, generatedLines.join("\n"), "utf8");

const industryCountMap = new Map();
for (const company of companies) {
  industryCountMap.set(company.industryId, (industryCountMap.get(company.industryId) || 0) + 1);
}
const industryCounts = [...industryCountMap.entries()]
  .map(([industryId, count]) => `${industryId}=${count}`);
console.log(`Updated ${companies.length} KOSPI companies at ${collectedAt}`);
console.log(industryCounts.join(", "));

function deduplicateCompanies(entries) {
  const byTicker = new Map();
  for (const company of entries) {
    const existing = byTicker.get(company.ticker);
    if (!existing) {
      byTicker.set(company.ticker, company);
      continue;
    }
    const comparableFields = ["name", "krxIndustry", "products", "listedAt", "fiscalMonth", "representative", "homepage"];
    const hasConflict = comparableFields.some((field) => existing[field] !== company[field]);
    if (existing.region !== company.region) {
      const regions = [...new Set([...(existing.regions || [existing.region]), company.region].filter(Boolean))];
      existing.regions = regions;
      existing.region = regions.join(" · ");
    }
    if (hasConflict) {
      const differences = Object.fromEntries(comparableFields.filter((field) => existing[field] !== company[field]).map((field) => [field, [existing[field], company[field]]]));
      throw new Error(`Conflicting KIND rows for ${company.ticker}: ${JSON.stringify(differences)}`);
    }
  }
  return [...byTicker.values()];
}

function parseTableRows(source) {
  return [...source.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => normalizeCell(cell[1])))
    .filter((cells) => cells.length);
}

function normalizeCell(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function buildCompany(row, collectedAt) {
  const ticker = row["종목코드"].toUpperCase();
  const krxIndustry = row["업종"] || "업종 미공표";
  const products = row["주요제품"] || "주요제품 미공표";
  const industryId = classifyIndustry(krxIndustry, products);
  return {
    id: `kospi-${ticker.toLowerCase()}`,
    name: row["회사명"],
    ticker,
    country: "한국",
    market: "KOSPI",
    sectorId: industryId,
    industryId,
    role: krxIndustry,
    snapshotStatus: "catalog-only",
    catalogOnly: true,
    business: products,
    revenue: null,
    revenueGrowth: null,
    margin: null,
    profitability: null,
    cashSignal: null,
    healthParts: null,
    moat: null,
    risk: null,
    watch: [],
    krxIndustry,
    products,
    listedAt: normalizeDate(row["상장일"]),
    fiscalMonth: row["결산월"] || null,
    representative: row["대표자명"] || null,
    homepage: normalizeHomepage(row["홈페이지"]),
    region: row["지역"] || null,
    catalogCollectedAt: collectedAt,
    source: {
      label: "한국거래소 KIND 상장법인 기본정보",
      url: KIND_LIST_URL
    }
  };
}

function classifyIndustry(industry, products) {
  const text = `${industry} ${products}`;
  const rules = [
    ["finance-insurance", /은행|저축기관|금융|보험|증권|신탁|연금|신용조합|투자기관|투자회사/],
    ["biotech-health", /의약|바이오|의료|병원|진단|보건|제약/],
    ["food-beverage", /식품|음료|곡물|낙농|육류|수산물 가공|주정|담배/],
    ["media-games", /게임|영상|오디오|방송|공연|음악|엔터테인먼트|영화|스포츠 서비스/],
    ["telecom", /전기 통신|통신업|무선 및 위성 통신|유선 통신/],
    ["security-it", /컴퓨터 프로그래밍|정보서비스|정보 처리|호스팅|보안시스템|컴퓨터시스템 통합/],
    ["software-platform", /소프트웨어|포털|전자상거래|온라인 정보|자료 처리|데이터베이스/],
    ["semiconductors-electronics", /반도체|전자부품|컴퓨터|광학기기|통신 및 방송 장비|영상 및 음향기기|인쇄회로|디스플레이|전기회로/],
    ["mobility-battery", /자동차|차체|트레일러|운송장비용|축전지|이차전지|타이어/],
    ["shipbuilding-defense", /선박|보트|항공기|우주선|전투용 차량|무기|탄약|방위산업/],
    ["logistics-transport", /항공 운송|수상 운송|육상 운송|창고|운송관련|택배|물류|여객|화물/],
    ["construction-infra", /건설업|건물 건설|토목 건설|전문직별 공사|부동산|건축기술|엔지니어링 서비스/],
    ["power-utilities", /전기업|가스업|증기|공기조절 공급|원유 정제|연료용 가스|발전업|전력|에너지/],
    ["climate-water", /수도업|하수|폐기물|환경 정화|재생용 재료|수처리/],
    ["chemicals-materials", /화학|철강|금속|비금속 광물|플라스틱|고무|펄프|종이|목재|석유|광업|시멘트|유리|섬유제품/],
    ["industrial-automation", /기계|장비|전동기|발전기|변압기|전선|케이블|산업용 로봇|정밀기기|측정|제어|펌프|베어링/],
    ["consumer-retail", /소매|도매|생활용품|화장품|의복|신발|가죽|가구|숙박|여행|개인 서비스|교육 서비스/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "diversified-other";
}

function normalizeDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function normalizeHomepage(value) {
  const compact = String(value || "").trim();
  if (!compact) return null;
  const candidate = /^https?:\/\//i.test(compact) ? compact : `https://${compact}`;
  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
