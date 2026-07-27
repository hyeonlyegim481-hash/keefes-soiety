const POLITICS_PATTERN = /대통령|대통령실|청와대|국회|의회|상원|하원|백악관|내각|총리|정부|국무원|전인대|집행위원회|법안|법률|상법|시행령|예산안|선거|정당|관세|제재|규제/i;
const ECONOMY_PATTERN = /경제|예산|재정|세금|조세|금리|물가|관세|무역|수출|수입|산업|기업|노동|고용|부동산|금융|은행|AI|반도체|에너지|공급망|제재|투자|성장/i;

const COUNTRY_PATTERNS = Object.freeze({
  korea: /한국|국내|대통령실|청와대|대한민국|국회|기획재정부|금융위원회|산업통상부/i,
  us: /미국|백악관|미 의회|상원|하원|트럼프|Congress|U\.S\.|United States/i,
  china: /중국|시진핑|국무원|전인대|인민은행|China|Chinese/i,
  japan: /일본|일본 내각|일본은행|도쿄|Japan|Japanese/i,
  russia: /러시아|푸틴|크렘린|Russia|Russian/i,
  eu: /EU|유럽연합|집행위원회|유럽의회|ECB|European Commission|European Union/i,
  india: /인도|모디|India|Indian/i
});

const LAW_PATTERNS = Object.freeze({
  "kr-commercial-duty": /상법|이사.*충실|주주.*공평|소수주주/i,
  "kr-ai-basic": /인공지능기본법|AI 기본법|고영향 AI|생성형 AI.*투명/i,
  "kr-labor-union": /노동조합법|노란봉투|원청.*하청|교섭.*사용자/i,
  "kr-commercial-governance": /상법|집중투표|감사위원|상장회사.*지배구조/i,
  "us-obbba": /미국.*(?:세제|감세|재정법)|Public Law 119-21|IRS.*2026|세액공제/i,
  "us-genius": /GENIUS|스테이블코인|지급형.*코인|디지털.*달러/i,
  "eu-cbam": /CBAM|탄소국경|탄소.*수입|내재배출/i,
  "eu-ai-act": /EU AI Act|EU.*AI법|유럽.*인공지능법|고위험 AI/i,
  "cn-vat": /중국.*(?:증치세|부가가치세)|VAT.*중국/i,
  "jp-cyber": /일본.*사이버|능동적.*사이버|사이버대처능력/i,
  "jp-ai-promotion": /일본.*AI|AI 추진법|인공지능.*일본/i
});

const FUTURE_INDUSTRY_PATTERNS = Object.freeze({
  "ai-chips": /AI 반도체|HBM|GPU|AI 가속기|파운드리|첨단 패키징|메모리 반도체|엔비디아|TSMC|SK하이닉스/i,
  "ai-platforms": /AI 플랫폼|클라우드|생성형 AI|데이터센터|AI 서비스|AI 에이전트|마이크로소프트|알파벳|아마존/i,
  "battery-mobility": /배터리|전기차|EV|양극재|음극재|리튬|충전 인프라|미래 모빌리티|테슬라|CATL/i,
  "bio-health": /바이오|신약|정밀의료|비만치료제|유전자|세포치료|의약품|임상시험|바이오시밀러/i,
  automation: /로봇|산업자동화|스마트팩토리|휴머노이드|공장 자동화|협동로봇/i,
  "energy-infra": /전력망|원전|SMR|변압기|전력기기|재생에너지|데이터센터 전력|에너지 인프라/i,
  cybersecurity: /사이버보안|사이버 공격|해킹|랜섬웨어|제로트러스트|클라우드 보안|디지털 신뢰/i,
  "quantum-computing": /양자컴퓨팅|양자 컴퓨터|큐비트|양자암호|양자 네트워크/i,
  "autonomous-logistics": /자율주행|스마트 물류|물류 로봇|무인 배송|로보택시|자율 물류/i,
  "climate-resilience": /기후적응|물 인프라|담수화|홍수 방어|폭염 대응|산불 대응|재난 인프라|기후 회복력/i
});

const FUTURE_OUTLOOK_PATTERN = /기후|폭염|온난화|탄소|배출|전력수요|재생에너지|물 부족|가뭄|홍수|산불|식량|농산물|감염병|인구|고령화|해수면|생물다양성|재난/i;

export function selectPoliticalHeadlines(headlines = [], limit = 12) {
  return uniqueRecentHeadlines(headlines)
    .filter((headline) => {
      const text = headlineText(headline);
      return headline.section === "politics"
        || (POLITICS_PATTERN.test(text) && ECONOMY_PATTERN.test(text));
    })
    .slice(0, normalizeLimit(limit, 12));
}

export function getPoliticalTransmission(headline = {}) {
  const text = headlineText(headline);
  if (/관세|무역|수출통제|제재|공급망/i.test(text)) {
    return "정책 결정 → 교역 비용·물량 → 수출기업 이익·환율·물가";
  }
  if (/예산|재정|세금|조세|감세|보조금/i.test(text)) {
    return "법안·예산 → 가계 세부담·정부 지출 → 소비·투자·국채금리";
  }
  if (/금융|은행|가상자산|스테이블코인|자본시장|상법/i.test(text)) {
    return "법·감독 기준 → 자금조달·준수 비용 → 금융시장·기업가치";
  }
  if (/노동|고용|임금|노조/i.test(text)) {
    return "노동 제도 → 임금·교섭·고용 비용 → 소비와 기업 마진";
  }
  if (/AI|반도체|기술|에너지|산업/i.test(text)) {
    return "산업정책·규제 → 지원·준수 비용 → 설비투자·생산·경쟁";
  }
  return "정책 발표 → 법안·시행 여부 확인 → 기업·가계 행동 → 시장 가격";
}

export function inferPoliticalJurisdiction(headline = {}) {
  const text = headlineText(headline);
  if (COUNTRY_PATTERNS.korea.test(text)) return "한국";
  if (COUNTRY_PATTERNS.us.test(text)) return "미국";
  if (COUNTRY_PATTERNS.china.test(text)) return "중국";
  if (COUNTRY_PATTERNS.japan.test(text)) return "일본";
  if (COUNTRY_PATTERNS.russia.test(text)) return "러시아";
  if (COUNTRY_PATTERNS.eu.test(text)) return "EU";
  if (COUNTRY_PATTERNS.india.test(text)) return "인도";
  return "세계";
}

export function buildPoliticsLiveBriefs(snapshot, countries = [], laws = []) {
  const politicalHeadlines = selectPoliticalHeadlines(snapshot?.headlines || [], 36);
  const overview = createBrief(snapshot, politicalHeadlines, {
    label: "정치·정책",
    kind: "politics"
  });
  const byCountry = Object.fromEntries(countries.map((country) => {
    const pattern = COUNTRY_PATTERNS[country.id];
    const matched = pattern
      ? politicalHeadlines.filter((headline) => pattern.test(headlineText(headline)))
      : [];
    return [country.id, createBrief(snapshot, matched, {
      label: country.name,
      kind: "politics"
    })];
  }));
  const byLaw = Object.fromEntries(laws.map((law) => {
    const lawPattern = LAW_PATTERNS[law.id];
    const countryPattern = COUNTRY_PATTERNS[law.countryId];
    const matched = lawPattern
      ? politicalHeadlines.filter((headline) => {
          const text = headlineText(headline);
          return lawPattern.test(text) && (!countryPattern || countryPattern.test(text));
        })
      : [];
    return [law.id, createBrief(snapshot, matched, {
      label: law.shortTitle || law.title,
      kind: "law"
    })];
  }));

  return { overview, byCountry, byLaw };
}

export function buildFutureIndustryBrief(snapshot, industry = {}) {
  const pattern = FUTURE_INDUSTRY_PATTERNS[industry.id];
  const candidates = uniqueRecentHeadlines(snapshot?.headlines || [])
    .filter((headline) => pattern?.test(headlineText(headline)));
  return createBrief(snapshot, candidates, {
    label: industry.label || "미래산업",
    kind: "future"
  });
}

export function buildFutureOutlookBrief(snapshot) {
  const candidates = uniqueRecentHeadlines(snapshot?.headlines || [])
    .filter((headline) => (
      FUTURE_OUTLOOK_PATTERN.test(String(headline.title || ""))
      || headline.topic === "기후·에너지"
    ));
  return createBrief(snapshot, candidates, {
    label: "미래 위험·전환",
    kind: "outlook"
  });
}

function createBrief(snapshot, headlines, { label, kind }) {
  const quality = snapshot?.dataQuality || {};
  const sourceMode = quality.newsSourceMode || (snapshot ? "unknown" : "unavailable");
  const available = Boolean(snapshot) && sourceMode !== "unavailable";
  const selected = uniqueRecentHeadlines(headlines).slice(0, 3).map(compactHeadline);
  const status = !available
    ? "unavailable"
    : sourceMode === "blob-last-known"
      ? "stale"
      : selected.length
        ? "current"
        : "empty";
  const top = selected[0] || null;
  const transmission = top
    ? kind === "politics" || kind === "law"
      ? getPoliticalTransmission(top)
      : getFutureTransmission(top)
    : null;

  return {
    status,
    label,
    count: uniqueRecentHeadlines(headlines).length,
    fetchedAt: quality.newsFetchedAt || null,
    refreshMinutes: Number(quality.newsRefreshMinutes) || 30,
    sourceMode,
    headlines: selected,
    transmission,
    summary: buildSummary({ status, label, top, transmission, kind })
  };
}

function buildSummary({ status, label, top, transmission, kind }) {
  if (status === "unavailable") {
    return `${label} 관련 최신 동향을 수집하지 못했습니다. 기존 검증 자료를 유지하며 임의 내용을 만들지 않습니다.`;
  }
  if (!top) {
    return `${label}과 직접 연결된 새 기사가 현재 선별 목록에 없습니다. 기존 검증 설명과 기준일을 유지합니다.`;
  }
  if (kind === "law") {
    return `최근 기사 「${top.title}」이 ${label}과 연결됐습니다. 기사 동향은 법적 상태 변경이 아니며 공식 원문 확인 전에는 시행 상태를 바꾸지 않습니다.`;
  }
  if (kind === "politics") {
    return `최근 기사 「${top.title}」을 중심으로 ${transmission} 경로를 확인합니다. 기사 제목만으로 정책 확정을 단정하지 않습니다.`;
  }
  return `최근 기사 「${top.title}」이 ${label} 동향으로 선별됐습니다. ${transmission} 신호를 확인하되 장기 전망이나 기업 실적의 확정값으로 보지 않습니다.`;
}

function getFutureTransmission(headline = {}) {
  const text = headlineText(headline);
  if (/규제|법안|관세|보조금|세액공제|정책/i.test(text)) {
    return "정책·규제 → 투자비용과 시장 접근 → 수요·수익성";
  }
  if (/실적|매출|영업이익|수주|가이던스/i.test(text)) {
    return "기업 실적·수주 → 실제 수요 확인 → 투자와 공급 확대 여부";
  }
  if (/공급망|부족|병목|수출통제|가격/i.test(text)) {
    return "공급망 변화 → 가격·납기 → 생산량과 기업 마진";
  }
  if (/기후|폭염|홍수|산불|가뭄|전력수요/i.test(text)) {
    return "물리적 위험 → 인프라 수요·보험 비용 → 적응 투자";
  }
  return "기술·수요 신호 → 설비투자와 채택 속도 → 매출·현금흐름";
}

function uniqueRecentHeadlines(headlines = []) {
  const seenTitles = new Set();
  const seenUrls = new Set();
  return [...headlines]
    .filter((headline) => headline && typeof headline === "object")
    .sort((left, right) => safeTimestamp(right?.publishedAt) - safeTimestamp(left?.publishedAt))
    .filter((headline) => {
      const titleKey = normalizeText(headline.title);
      const urlKey = normalizeText(headline.url);
      if (!titleKey || seenTitles.has(titleKey) || (urlKey && seenUrls.has(urlKey))) return false;
      seenTitles.add(titleKey);
      if (urlKey) seenUrls.add(urlKey);
      return true;
    });
}

function compactHeadline(headline) {
  return {
    id: String(headline.id || headline.eventKey || ""),
    title: String(headline.title || "제목 미확인"),
    url: String(headline.url || ""),
    source: String(headline.source || "출처 미확인"),
    publishedAt: headline.publishedAt || null,
    topic: String(headline.topic || ""),
    section: String(headline.section || "")
  };
}

function headlineText(headline = {}) {
  return [
    headline.title,
    headline.topic,
    headline.impactArea,
    headline.section,
    ...(Array.isArray(headline.entities) ? headline.entities : [])
  ].filter(Boolean).join(" ");
}

function safeTimestamp(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeLimit(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}