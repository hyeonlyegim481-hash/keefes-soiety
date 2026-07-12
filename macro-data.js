import { decodeGoogleNewsUrl } from "./news-content.js";

const REQUEST_TIMEOUT_MS = 8_000;
const MACRO_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const OFFICIAL_DATA_HOSTS = new Set([
  "www.bok.or.kr",
  "mods.go.kr",
  "www.customs.go.kr",
  "news.google.com",
  "www.korea.kr"
]);

const BOK_BASE_RATE_URL =
  "https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643";
const CPI_LIST_URL = "https://mods.go.kr/board.es?bid=213&mid=a10301040100";
const CUSTOMS_LIST_URL =
  "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891&searchType=sj&searchValue=%EC%88%98%EC%B6%9C%EC%9E%85%20%ED%98%84%ED%99%A9&aditCol1=%EC%A0%95%EB%B3%B4%EB%8D%B0%EC%9D%B4%ED%84%B0&listCo=50";
const BOK_STATS_RSS_URL =
  "https://www.bok.or.kr/portal/bbs/B0000501/news.rss?menuNo=201264";

const macroDefinitions = [
  {
    id: "base-rate",
    label: "한국 기준금리",
    unit: "%",
    cadence: "금통위",
    source: "한국은행",
    sourceUrl: BOK_BASE_RATE_URL
  },
  {
    id: "cpi",
    label: "소비자물가",
    unit: "% YoY",
    cadence: "월간",
    source: "국가데이터처",
    sourceUrl: CPI_LIST_URL
  },
  {
    id: "exports",
    label: "수출 증가율",
    unit: "% YoY",
    cadence: "월간",
    source: "관세청",
    sourceUrl: CUSTOMS_LIST_URL
  },
  {
    id: "household-credit",
    label: "가계신용",
    unit: "조원",
    cadence: "분기",
    source: "한국은행",
    sourceUrl: BOK_STATS_RSS_URL
  }
];

let macroCache = null;

export async function fetchMacroIndicators() {
  const now = Date.now();
  if (macroCache && now - macroCache.createdAt < MACRO_CACHE_TTL_MS) {
    return macroCache.items.map((item) => ({ ...item }));
  }

  const loaders = [fetchBaseRate, fetchConsumerPrices, fetchExports, fetchHouseholdCredit];
  const results = await Promise.allSettled(loaders.map((loader) => loader()));
  const fetchedAt = new Date().toISOString();
  const items = macroDefinitions.map((definition, index) => {
    const result = results[index];
    return result.status === "fulfilled"
      ? { ...result.value, fetchedAt }
      : makeUnavailableIndicator(definition, fetchedAt);
  });

  macroCache = { createdAt: now, items };
  return items.map((item) => ({ ...item }));
}

async function fetchBaseRate() {
  const html = await fetchOfficialText(BOK_BASE_RATE_URL, "text/html");
  const chart = html.match(/var\s+chartObj2_s\s*=\s*(\[[\s\S]*?\])\s*;/i)?.[1];
  if (!chart) throw new Error("Base-rate series was not found");

  const points = [...chart.matchAll(/\["(\d{4})\/(\d{2})\/(\d{2})\s*",\s*([\d.]+)\]/g)]
    .map((match) => ({
      date: `${match[1]}-${match[2]}-${match[3]}`,
      value: Number(match[4])
    }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!points.length) throw new Error("Base-rate observations were not found");

  const changes = points.filter(
    (point, index) => index === 0 || point.value !== points[index - 1].value
  );
  const latest = changes.at(-1);
  const previous = changes.at(-2);
  assertRange(latest.value, 0, 20, "Base rate");
  const delta = previous ? round(latest.value - previous.value, 2) : 0;
  return {
    ...macroDefinitions[0],
    value: latest.value,
    delta,
    deltaLabel: `직전 변경 ${signed(delta)}%p`,
    mood: "neutral",
    status: "official",
    asOf: latest.date,
    publishedAt: latest.date,
    periodLabel: `${latest.date.replaceAll("-", ".")} 변경`
  };
}

async function fetchConsumerPrices() {
  try {
    return await fetchConsumerPricesFromStatisticsOffice();
  } catch {
    return fetchConsumerPricesFromPolicyBriefing();
  }
}

async function fetchConsumerPricesFromStatisticsOffice() {
  const listHtml = await fetchOfficialText(CPI_LIST_URL, "text/html");
  const entry = extractAnchors(listHtml).find((anchor) =>
    /^\d{4}년\s+\d{1,2}월\s+소비자물가동향$/.test(anchor.text)
  );
  if (!entry?.href) throw new Error("Latest CPI release was not found");

  const embeddedPath = entry.href.match(/addSearchParam\('([^']+)'\)/)?.[1] || entry.href;
  const detailUrl = new URL(embeddedPath, CPI_LIST_URL).href;
  const detailHtml = await fetchOfficialText(detailUrl, "text/html");
  const text = htmlToText(detailHtml);
  return buildCpiIndicator({
    title: entry.text,
    text,
    detailUrl,
    publishedAt: readPublishedDate(text, /게시일\s*(\d{4})-(\d{2})-(\d{2})/)
  });
}

async function fetchConsumerPricesFromPolicyBriefing() {
  const query = encodeURIComponent("site:korea.kr 소비자물가동향 when:45d");
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`;
  const rss = await fetchOfficialText(rssUrl, "application/rss+xml,text/xml");
  const release = readRssItems(rss).find((item) =>
    /^\d{4}년\s+\d{1,2}월\s+소비자물가동향(?:\s+-\s+대한민국 정책브리핑)?$/.test(item.title)
  );
  if (!release?.link) throw new Error("Latest CPI policy briefing was not found");

  const detailUrl = await decodeGoogleNewsUrl(release.link);
  const detailHtml = await fetchOfficialText(detailUrl, "text/html");
  const timestamp = Date.parse(release.publishedAt);
  return buildCpiIndicator({
    title: release.title.replace(/\s+-\s+대한민국 정책브리핑$/, ""),
    text: htmlToText(detailHtml),
    detailUrl,
    publishedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
  });
}

function buildCpiIndicator({ title, text, detailUrl, publishedAt }) {
  const period = title.match(/^(\d{4})년\s+(\d{1,2})월/);
  const commonDirection = text.match(
    /소비자물가지수는[\s\S]{0,100}?전월대비\s*([\d.]+)%\s*,?\s*전년동월대비\s*([\d.]+)%\s*(?:각각\s*)?(상승|하락)/
  );
  const mixedDirection = text.match(
    /소비자물가지수는[\s\S]{0,100}?전월대비\s*([\d.]+)%\s*(상승|하락)(?:하였고|하였으며|했고|하고|,)?\s*,?\s*전년동월대비\s*([\d.]+)%\s*(상승|하락)/
  );
  if (!period || (!commonDirection && !mixedDirection)) {
    throw new Error("CPI values were not found");
  }

  const monthChange = commonDirection
    ? applyDirection(Number(commonDirection[1]), commonDirection[3])
    : applyDirection(Number(mixedDirection[1]), mixedDirection[2]);
  const annualChange = commonDirection
    ? applyDirection(Number(commonDirection[2]), commonDirection[3])
    : applyDirection(Number(mixedDirection[3]), mixedDirection[4]);
  assertRange(monthChange, -20, 20, "Monthly CPI change");
  assertRange(annualChange, -20, 50, "Annual CPI change");
  const year = Number(period[1]);
  const month = Number(period[2]);

  return {
    ...macroDefinitions[1],
    sourceUrl: detailUrl,
    value: annualChange,
    delta: monthChange,
    deltaLabel: `전월비 ${signed(monthChange)}%`,
    mood: annualChange > 3 ? "negative" : annualChange > 2.5 ? "watch" : "positive",
    status: "official",
    asOf: monthEndIso(year, month),
    publishedAt,
    periodLabel: `${year}년 ${month}월`
  };
}

async function fetchExports() {
  const listHtml = await fetchOfficialText(CUSTOMS_LIST_URL, "text/html");
  const entry = extractAnchors(listHtml).find((anchor) =>
    /^\d{4}년\s+\d{1,2}월\s+수출입\s+현황\s*\[잠정치\]$/.test(anchor.text)
  );
  const itemId = readAttribute(entry?.attributes || "", "data-id");
  const itemUrlKey = readAttribute(entry?.attributes || "", "data-url");
  if (!entry || !itemId || !itemUrlKey) throw new Error("Latest export release was not found");

  const detailUrl = `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=${encodeURIComponent(
    itemId
  )}&nttSnUrl=${encodeURIComponent(itemUrlKey)}`;
  const detailHtml = await fetchOfficialText(detailUrl, "text/html");
  const text = htmlToText(detailHtml);
  const period = entry.text.match(/^(\d{4})년\s+(\d{1,2})월/);
  const values = text.match(
    /수출은\s*([\d,.]+)\s*억\s*달러\s*(?:로)?\s*전년동기대비\s*수출?\s*([\d.]+)%\s*(증가|감소)/
  ) || text.match(
    /수출은\s*([\d,.]+)\s*억\s*달러\s*(?:로)?\s*전년동기대비\s*([\d.]+)%\s*(증가|감소)/
  );
  if (!period || !values) throw new Error("Export values were not found");

  const exportAmount = parseNumber(values[1]);
  const annualChange = applyDirection(Number(values[2]), values[3]);
  assertRange(exportAmount, 0, 10_000, "Export amount");
  assertRange(annualChange, -100, 500, "Export growth");
  const publishedAt = readPublishedDate(text, /등록일\s*(\d{4})\.(\d{2})\.(\d{2})/);
  const year = Number(period[1]);
  const month = Number(period[2]);

  return {
    ...macroDefinitions[2],
    sourceUrl: detailUrl,
    value: annualChange,
    delta: annualChange,
    deltaLabel: `수출액 ${formatNumber(exportAmount)}억달러`,
    exportAmount,
    mood: annualChange >= 0 ? "positive" : "negative",
    status: "official",
    asOf: monthEndIso(year, month),
    publishedAt,
    periodLabel: `${year}년 ${month}월 잠정`
  };
}

async function fetchHouseholdCredit() {
  const rss = await fetchOfficialText(BOK_STATS_RSS_URL, "application/rss+xml,text/xml");
  const release = readRssItems(rss).find((item) =>
    /^\d{4}년\s+\d+\/4분기중\s+가계신용\(잠정\)$/.test(item.title)
  );
  if (!release?.link) throw new Error("Latest household-credit release was not found");

  const detailHtml = await fetchOfficialText(release.link, "text/html");
  const text = htmlToText(detailHtml);
  const period = release.title.match(/^(\d{4})년\s+(\d+)\/4분기/);
  const values = text.match(
    /가계신용\s*잔액은\s*([\d,.]+)\s*조원으로\s*전분기말\s*대비\s*([\d,.]+)\s*조원\s*(증가|감소)/
  );
  if (!period || !values) throw new Error("Household-credit values were not found");

  const year = Number(period[1]);
  const quarter = Number(period[2]);
  const balance = parseNumber(values[1]);
  const delta = applyDirection(parseNumber(values[2]), values[3]);
  assertRange(balance, 0, 10_000, "Household credit");
  assertRange(delta, -1_000, 1_000, "Household credit change");
  const publishedTimestamp = Date.parse(release.publishedAt);
  return {
    ...macroDefinitions[3],
    sourceUrl: release.link,
    value: balance,
    delta,
    deltaLabel: `전분기 ${signed(delta)}조원`,
    mood: delta > 0 ? "watch" : "positive",
    status: "official",
    asOf: quarterEndIso(year, quarter),
    publishedAt: Number.isFinite(publishedTimestamp)
      ? new Date(publishedTimestamp).toISOString()
      : null,
    periodLabel: `${year}년 ${quarter}분기 잠정`
  };
}

async function fetchOfficialText(url, accept) {
  const parsedUrl = new URL(url);
  if (!OFFICIAL_DATA_HOSTS.has(parsedUrl.hostname)) {
    throw new Error("Official data URL is not allowed");
  }
  const response = await fetch(parsedUrl, {
    headers: {
      accept,
      "user-agent":
        "Mozilla/5.0 (compatible; KeefesSoiety/1.0; +https://keefes-soiety.vercel.app)"
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Official data request failed: ${response.status}`);
  return (await response.text()).slice(0, 1_500_000);
}

function extractAnchors(html) {
  return [...String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    attributes: match[1],
    href: decodeHtmlEntities(readAttribute(match[1], "href")),
    text: htmlToText(match[2])
  }));
}

function readRssItems(xml) {
  return [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => ({
    title: readXmlTag(match[1], "title"),
    link: readXmlTag(match[1], "link"),
    publishedAt: readXmlTag(match[1], "pubDate")
  }));
}

function readXmlTag(xml, tag) {
  const value = String(xml).match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "";
  return decodeHtmlEntities(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).trim();
}

function readAttribute(attributes, name) {
  return String(attributes).match(new RegExp(`${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"))?.[2] || "";
}

function htmlToText(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(value || "")
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

function makeUnavailableIndicator(definition, fetchedAt) {
  return {
    ...definition,
    value: null,
    delta: null,
    deltaLabel: "공식 자료 확인 실패",
    mood: "neutral",
    status: "unavailable",
    asOf: null,
    publishedAt: null,
    periodLabel: "기준일 확인 불가",
    fetchedAt
  };
}

function readPublishedDate(text, pattern) {
  const match = String(text).match(pattern);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function monthEndIso(year, month) {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function quarterEndIso(year, quarter) {
  return monthEndIso(year, quarter * 3);
}

function applyDirection(value, direction) {
  if (!Number.isFinite(value)) throw new Error("Official data value is invalid");
  return /하락|감소/.test(direction) ? -Math.abs(value) : Math.abs(value);
}

function parseNumber(value) {
  return Number(String(value || "").replaceAll(",", ""));
}

function assertRange(value, minimum, maximum, label) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label} is outside the expected range`);
  }
}

function round(value, digits = 1) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function signed(value) {
  return `${value >= 0 ? "+" : ""}${round(value, 2)}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);
}

export {
  BOK_BASE_RATE_URL,
  BOK_STATS_RSS_URL,
  CPI_LIST_URL,
  CUSTOMS_LIST_URL,
  fetchConsumerPricesFromPolicyBriefing,
  htmlToText
};
