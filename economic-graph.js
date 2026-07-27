const ENTITY_PREFIXES = Object.freeze({
  market: "market",
  country: "country",
  indicator: "indicator",
  industry: "industry",
  company: "company",
  term: "term",
  newsEvent: "news-event",
  historyEvent: "history-event",
  policy: "policy",
  regime: "regime",
  analysis: "analysis"
});

export const REGIME_CATALOG = Object.freeze([
  { id: "recovery", label: "경기회복" },
  { id: "slowdown", label: "경기둔화" },
  { id: "recession-risk", label: "침체위험" },
  { id: "inflation-pressure", label: "물가압력" },
  { id: "disinflation", label: "디스인플레이션" },
  { id: "stagflation", label: "스태그플레이션" },
  { id: "rate-hike-shock", label: "금리인상 충격" },
  { id: "rate-cut-expectation", label: "금리인하 기대" },
  { id: "financial-stress", label: "금융불안" },
  { id: "export-recovery", label: "수출회복" },
  { id: "domestic-demand-weakness", label: "내수부진" },
  { id: "supply-chain-shock", label: "공급망 충격" }
]);

const COUNTRY_ALIASES = Object.freeze({
  KOR: "KOR",
  KR: "KOR",
  korea: "KOR",
  "south-korea": "KOR",
  한국: "KOR",
  USA: "USA",
  US: "USA",
  us: "USA",
  usa: "USA",
  "united-states": "USA",
  미국: "USA",
  CHN: "CHN",
  CN: "CHN",
  china: "CHN",
  중국: "CHN",
  JPN: "JPN",
  JP: "JPN",
  japan: "JPN",
  일본: "JPN",
  DEU: "DEU",
  DE: "DEU",
  germany: "DEU",
  독일: "DEU",
  FRA: "FRA",
  FR: "FRA",
  france: "FRA",
  프랑스: "FRA",
  GBR: "GBR",
  GB: "GBR",
  UK: "GBR",
  uk: "GBR",
  britain: "GBR",
  영국: "GBR",
  IND: "IND",
  IN: "IND",
  india: "IND",
  인도: "IND",
  RUS: "RUS",
  RU: "RUS",
  russia: "RUS",
  러시아: "RUS",
  EU: "EU",
  eu: "EU",
  europe: "EU",
  유럽연합: "EU",
  WLD: "WLD",
  world: "WLD",
  세계: "WLD"
});

const ref = (id, label) => Object.freeze({ id, label });

export const MARKET_KNOWLEDGE = Object.freeze({
  kospi: Object.freeze({
    label: "KOSPI",
    definition: "한국 유가증권시장의 대형 상장기업 흐름을 보여주는 지수입니다.",
    up: "대형주 중심의 매수세가 우세했다는 뜻입니다.",
    down: "대형주 중심으로 매도 압력이 더 강했다는 뜻입니다.",
    caution: "KOSPI가 올라도 KOSDAQ이나 다수 종목이 내리면 시장 전체가 좋아진 것은 아닙니다.",
    peers: [
      { id: "kosdaq", question: "상승이 중소형주까지 넓게 퍼졌는가" },
      { id: "usdkrw", question: "환율이 외국인 수급을 돕고 있는가" },
      { id: "sp500", question: "미국 시장과 같은 방향인가" }
    ],
    deepFocus: "한국 증시와 국내 경기 영향",
    transmission: "국내외 경기와 기업 이익 기대 → 외국인·기관 수급 → 대형주 가격 → 설비투자·고용 심리",
    koreaImpact: "반도체와 수출 대형주의 이익 기대가 강하면 지수를 지지할 수 있지만, 내수와 중소형주가 약하면 국내 경기 전반의 회복으로 확대 해석하면 안 됩니다.",
    watch: ["KOSDAQ 동행 여부", "원/달러 환율", "반도체 수출과 기업 이익 전망"],
    indicators: [
      ref("gdp-growth", "실질 GDP 성장률"),
      ref("manufacturing-share", "제조업 비중"),
      ref("exports-share", "수출 비중"),
      ref("market-capitalization", "주식시장 시가총액")
    ],
    terms: [ref("외국인 수급", "외국인 수급"), ref("주가수익비율", "주가수익비율"), ref("수출", "수출"), ref("위험선호", "위험선호")],
    history: [ref("korea-imf-crisis", "한국 외환위기"), ref("korea-2008", "한국과 2008년 금융위기"), ref("global-financial-crisis", "세계 금융위기")],
    industries: [ref("ai-chips", "AI 반도체"), ref("battery-mobility", "배터리·미래 모빌리티")],
    companies: [ref("samsung-electronics", "삼성전자"), ref("sk-hynix", "SK하이닉스"), ref("hyundai-motor", "현대자동차")],
    countries: [ref("KOR", "한국"), ref("USA", "미국"), ref("CHN", "중국")],
    newsPattern: /코스피|KOSPI|한국\s*증시|외국인\s*수급|한국\s*주식/i
  }),
  kosdaq: Object.freeze({
    label: "KOSDAQ",
    definition: "기술·바이오·중소형 성장기업 비중이 높은 한국 시장 지수입니다.",
    up: "성장주와 중소형주를 감수하려는 투자심리가 강해졌다는 뜻입니다.",
    down: "투자자가 변동성이 큰 성장주와 중소형주 위험을 줄였다는 뜻입니다.",
    caution: "KOSDAQ은 업종 쏠림과 수급 영향을 크게 받으므로 하루 등락만으로 경기 전체를 판단하면 안 됩니다.",
    peers: [
      { id: "kospi", question: "대형주와 중소형주의 방향이 같은가" },
      { id: "nasdaq", question: "미국 기술주 약세가 함께 나타나는가" },
      { id: "usdkrw", question: "원화 약세가 성장주 수급을 압박하는가" }
    ],
    deepFocus: "성장주·금리·수급 영향",
    transmission: "시장금리와 위험선호 → 성장기업의 할인율·자금조달 → 개인·기관 수급 → 투자와 고용 여력",
    koreaImpact: "금리 부담이 낮아지고 거래가 넓게 살아나면 성장기업의 자금조달 환경이 개선될 수 있습니다. 일부 바이오·2차전지 종목만 오르면 시장 전체 회복으로 보기 어렵습니다.",
    watch: ["한국 시장금리", "KOSPI와의 등락 폭 차이", "거래대금과 상승 종목 수"],
    indicators: [
      ref("real-interest-rate", "실질금리"),
      ref("private-credit", "민간신용"),
      ref("research-development", "연구개발 지출"),
      ref("market-capitalization", "주식시장 시가총액")
    ],
    terms: [ref("성장주", "성장주"), ref("할인율", "할인율"), ref("변동성", "변동성"), ref("위험선호", "위험선호")],
    history: [ref("dotcom-bubble", "닷컴버블"), ref("global-financial-crisis", "세계 금융위기"), ref("inflation-hiking-cycle", "인플레이션과 금리인상기")],
    industries: [ref("bio-health", "바이오·헬스"), ref("battery-mobility", "배터리·미래 모빌리티"), ref("automation", "로봇·자동화")],
    companies: [ref("samsung-biologics", "삼성바이오로직스"), ref("lg-energy-solution", "LG에너지솔루션"), ref("abb", "ABB")],
    countries: [ref("KOR", "한국"), ref("USA", "미국")],
    newsPattern: /코스닥|KOSDAQ|성장주|중소형주|바이오|2차전지/i
  }),
  usdkrw: Object.freeze({
    label: "USD/KRW",
    definition: "1달러를 사는 데 필요한 원화의 수입니다. 숫자가 오르면 원화 약세, 내리면 원화 강세입니다.",
    up: "달러가 강해지거나 원화 수요가 약해져 원화 가치가 떨어졌다는 뜻입니다.",
    down: "달러 부담이 줄거나 원화 수요가 살아나 원화 가치가 강해졌다는 뜻입니다.",
    caution: "하루 하락만 보고 환율이 안정됐다고 단정하면 안 됩니다. 전일 방향과 절대 수준을 함께 봐야 합니다.",
    peers: [
      { id: "kospi", question: "환율 변화가 국내 주가와 외국인 수급에 반영되는가" },
      { id: "vix", question: "글로벌 위험회피와 같이 움직이는가" },
      { id: "wti", question: "수입 에너지 비용까지 동시에 높아지는가" }
    ],
    deepFocus: "환율·수입물가·수출기업 영향",
    transmission: "달러 수요와 원화 신뢰 → 원/달러 환율 → 원자재·에너지 수입단가와 외국인 수급 → 물가·기업 마진",
    koreaImpact: "원화 약세는 수출기업의 원화 환산 매출에 도움이 될 수 있지만, 에너지·원재료 비용과 외화부채 부담을 높여 가계와 내수기업에는 불리할 수 있습니다.",
    watch: ["미국 금리와 달러 지수", "외국인 국내 주식 수급", "수입물가와 WTI"],
    indicators: [
      ref("current-account", "경상수지"),
      ref("reserve-cover", "외환보유액 수입 커버"),
      ref("consumer-inflation", "소비자물가 상승률"),
      ref("exports-share", "수출 비중")
    ],
    terms: [ref("환율", "환율"), ref("수입물가", "수입물가"), ref("달러인덱스", "달러인덱스"), ref("외국인 수급", "외국인 수급")],
    history: [ref("korea-imf-crisis", "한국 외환위기"), ref("global-financial-crisis", "세계 금융위기"), ref("plaza-accord", "플라자 합의")],
    industries: [ref("ai-chips", "AI 반도체"), ref("energy-infra", "전력·에너지 인프라"), ref("battery-mobility", "배터리·미래 모빌리티")],
    companies: [ref("samsung-electronics", "삼성전자"), ref("sk-hynix", "SK하이닉스"), ref("doosan-enerbility", "두산에너빌리티")],
    countries: [ref("KOR", "한국"), ref("USA", "미국"), ref("CHN", "중국"), ref("JPN", "일본")],
    newsPattern: /원\/달러|원달러|USD\/KRW|원화|환율|달러\s*강세|달러\s*약세/i
  }),
  sp500: Object.freeze({
    label: "S&P 500",
    definition: "미국 대표 대형기업 500개의 주가 흐름을 보여주는 지수입니다.",
    up: "미국 대형주 전반의 이익과 경기 기대가 우세했다는 뜻입니다.",
    down: "미국 대형주 전반에서 위험을 줄이려는 움직임이 강했다는 뜻입니다.",
    caution: "대형 기술주 몇 종목이 지수를 움직일 수 있으므로 NASDAQ과 VIX를 함께 봐야 합니다.",
    peers: [
      { id: "nasdaq", question: "기술주가 시장보다 강한가 약한가" },
      { id: "vix", question: "하락이 공포 확대로 번지고 있는가" },
      { id: "kospi", question: "미국 흐름이 한국으로 전달됐는가" }
    ],
    deepFocus: "미국 경기와 한국 시장 전달 경로",
    transmission: "미국 소비·고용·기업이익 → S&P 500 위험선호 → 글로벌 자금 배분 → 한국 수출주와 외국인 수급",
    koreaImpact: "미국 경기와 대형기업 이익이 버티면 한국 수출 수요와 위험선호에 우호적일 수 있습니다. 대형 기술주 쏠림이면 한국 전체 업종으로의 전달은 제한될 수 있습니다.",
    watch: ["미국 고용과 소비", "S&P 500 시장 폭", "KOSPI·원화 동행 여부"],
    indicators: [
      ref("gdp-growth", "실질 GDP 성장률"),
      ref("unemployment", "실업률"),
      ref("consumer-inflation", "소비자물가 상승률"),
      ref("market-capitalization", "주식시장 시가총액")
    ],
    terms: [ref("위험선호", "위험선호"), ref("주가수익비율", "주가수익비율"), ref("경기침체", "경기침체"), ref("기준금리", "기준금리")],
    history: [ref("great-depression", "대공황"), ref("global-financial-crisis", "세계 금융위기"), ref("covid-shock", "코로나19 충격")],
    industries: [ref("ai-platforms", "AI 플랫폼·클라우드"), ref("ai-chips", "AI 반도체"), ref("bio-health", "바이오·헬스")],
    companies: [ref("microsoft", "Microsoft"), ref("nvidia", "NVIDIA"), ref("eli-lilly", "Eli Lilly")],
    countries: [ref("USA", "미국"), ref("KOR", "한국")],
    newsPattern: /S&P\s*500|S&P500|미국\s*증시|미국\s*대형주|월가/i
  }),
  nasdaq: Object.freeze({
    label: "NASDAQ",
    definition: "미국 기술·성장기업 비중이 높은 주가지수입니다.",
    up: "금리와 미래 성장에 민감한 기술주 선호가 강해졌다는 뜻입니다.",
    down: "기술주 이익 기대나 높은 평가가 조정받고 있다는 뜻입니다.",
    caution: "NASDAQ 하락이 곧 경기침체를 뜻하지는 않습니다. 금리, 실적, 차익실현 중 원인을 나눠 봐야 합니다.",
    peers: [
      { id: "sp500", question: "기술주만의 조정인가 시장 전체 약세인가" },
      { id: "vix", question: "공포성 매도로 확대되고 있는가" },
      { id: "kosdaq", question: "한국 성장주에도 같은 압력이 나타나는가" }
    ],
    deepFocus: "기술주·금리·반도체 영향",
    transmission: "미국 장기금리와 기술기업 이익 기대 → NASDAQ 평가가치 → 반도체 투자 심리 → 한국 반도체 수출·KOSDAQ",
    koreaImpact: "기술주 강세가 실적과 데이터센터 투자에 근거하면 한국 반도체 공급망에 긍정적일 수 있습니다. 금리 하락만으로 오른 경우 실적 확인 전까지 지속성을 단정하기 어렵습니다.",
    watch: ["미국 10년물 금리", "반도체 기업 실적·설비투자", "KOSDAQ과 한국 반도체주"],
    indicators: [
      ref("real-interest-rate", "실질금리"),
      ref("research-development", "연구개발 지출"),
      ref("high-tech-exports", "첨단기술 수출 비중"),
      ref("market-capitalization", "주식시장 시가총액")
    ],
    terms: [ref("성장주", "성장주"), ref("할인율", "할인율"), ref("실질금리", "실질금리"), ref("변동성", "변동성")],
    history: [ref("dotcom-bubble", "닷컴버블"), ref("volcker-shock", "볼커 긴축"), ref("inflation-hiking-cycle", "인플레이션과 금리인상기")],
    industries: [ref("ai-chips", "AI 반도체"), ref("ai-platforms", "AI 플랫폼·클라우드"), ref("quantum-computing", "양자컴퓨팅")],
    companies: [ref("nvidia", "NVIDIA"), ref("microsoft", "Microsoft"), ref("alphabet", "Alphabet"), ref("ibm", "IBM")],
    countries: [ref("USA", "미국"), ref("KOR", "한국")],
    newsPattern: /나스닥|NASDAQ|미국\s*기술주|빅테크|AI\s*주식/i
  }),
  vix: Object.freeze({
    label: "VIX",
    definition: "S&P 500 옵션 가격으로 계산한 향후 약 30일의 예상 변동성 지수입니다.",
    up: "시장 참여자가 주가 급변에 대비한 보험을 더 비싸게 사고 있다는 뜻입니다.",
    down: "단기 충격에 대비하려는 수요가 줄고 있다는 뜻입니다.",
    caution: "VIX가 낮다고 주가가 반드시 오르는 것은 아니며, 20 아래에서는 약세가 있어도 공황으로 보지 않는 경우가 많습니다.",
    peers: [
      { id: "sp500", question: "주가 방향과 공포가 서로 확인되는가" },
      { id: "nasdaq", question: "기술주 조정이 시장 공포로 확대되는가" },
      { id: "usdkrw", question: "위험회피가 달러와 원화에도 전달되는가" }
    ],
    deepFocus: "금융시장 불안과 위험회피",
    transmission: "옵션 보험 수요 → VIX 예상 변동성 → 글로벌 위험자산 축소 → 달러 선호·한국 외국인 수급",
    koreaImpact: "VIX가 높은 상태로 이어지면 원화와 국내 주식의 변동성이 커지고 기업 자금조달 여건이 나빠질 수 있습니다. 하루 급등 뒤 빠르게 정상화되면 충격이 제한적일 수 있습니다.",
    watch: ["VIX 절대 수준과 지속기간", "S&P 500 낙폭", "원/달러와 신용시장"],
    indicators: [
      ref("market-capitalization", "주식시장 시가총액"),
      ref("private-credit", "민간신용"),
      ref("reserve-cover", "외환보유액 수입 커버")
    ],
    terms: [ref("변동성", "변동성"), ref("내재변동성", "내재변동성"), ref("안전자산", "안전자산"), ref("위험선호", "위험선호")],
    history: [ref("black-monday", "블랙 먼데이"), ref("global-financial-crisis", "세계 금융위기"), ref("covid-shock", "코로나19 충격")],
    industries: [ref("cybersecurity", "사이버보안"), ref("ai-platforms", "AI 플랫폼·클라우드")],
    companies: [ref("palo-alto", "Palo Alto Networks"), ref("microsoft", "Microsoft")],
    countries: [ref("USA", "미국"), ref("KOR", "한국")],
    newsPattern: /VIX|공포지수|시장\s*불안|위험회피|변동성\s*급등/i
  }),
  wti: Object.freeze({
    label: "WTI",
    definition: "미국 서부텍사스산 원유 최근월물 연속 선물 가격으로, 세계 에너지 비용을 읽는 대표 기준 중 하나입니다.",
    up: "에너지 수요가 강하거나 공급 차질 우려가 커졌다는 뜻일 수 있습니다.",
    down: "수요 둔화 우려나 공급 여유가 커졌다는 뜻일 수 있습니다.",
    caution: "WTI 선물 상승은 산유국과 에너지기업에는 호재일 수 있지만 에너지 수입국인 한국에는 비용 부담이 될 수 있습니다.",
    peers: [
      { id: "usdkrw", question: "달러와 유가가 한국의 수입비용을 함께 높이는가" },
      { id: "sp500", question: "수요 호조인지 공급 충격인지 구분할 단서가 있는가" },
      { id: "gold", question: "물가·지정학적 위험 신호가 함께 나타나는가" }
    ],
    deepFocus: "유가·물가·운송·화학·항공 영향",
    transmission: "원유 수요·공급과 지정학 → WTI 선물 가격 → 수입 에너지 단가·운송비 → 소비자물가와 업종별 마진",
    koreaImpact: "한국은 원유 순수입국이므로 유가 상승이 길어지면 물가와 무역수지에 부담입니다. 정유는 제품 가격 전가 여부, 화학·항공·운송은 비용 흡수 능력을 따로 봐야 합니다.",
    watch: ["원유 재고와 공급정책", "원/달러 환율", "정제마진·운임·소비자물가"],
    indicators: [
      ref("consumer-inflation", "소비자물가 상승률"),
      ref("trade-share", "무역 비중"),
      ref("imports-share", "수입 비중"),
      ref("energy-use", "1인당 에너지 사용")
    ],
    terms: [ref("국제유가", "국제유가"), ref("인플레이션", "인플레이션"), ref("선물", "선물"), ref("수입물가", "수입물가")],
    history: [ref("oil-shock", "석유파동"), ref("supply-chain-realignment", "공급망 재편"), ref("inflation-hiking-cycle", "인플레이션과 금리인상기")],
    industries: [ref("energy-infra", "전력·에너지 인프라"), ref("climate-resilience", "기후적응 인프라"), ref("autonomous-logistics", "자율물류")],
    companies: [ref("doosan-enerbility", "두산에너빌리티"), ref("ge-vernova", "GE Vernova"), ref("xylem", "Xylem")],
    countries: [ref("USA", "미국"), ref("RUS", "러시아"), ref("CHN", "중국"), ref("KOR", "한국")],
    newsPattern: /WTI|국제유가|원유|OPEC|석유|산유국/i
  }),
  gold: Object.freeze({
    label: "Gold",
    definition: "금 최근월물 연속 선물 가격으로, 안전자산 수요·실질금리·달러·물가 기대에 함께 반응합니다.",
    up: "안전자산 수요나 물가 우려가 커졌거나 실질금리 부담이 줄었다는 뜻일 수 있습니다.",
    down: "안전자산 수요가 약해졌거나 금리·달러 부담이 커졌다는 뜻일 수 있습니다.",
    caution: "금 선물 상승만으로 위험회피라고 단정할 수 없습니다. 달러와 금리 움직임이 같은 결과를 만들 수 있습니다.",
    peers: [
      { id: "vix", question: "안전자산 수요가 시장 공포와 함께 커지는가" },
      { id: "usdkrw", question: "달러 강세 속에서도 금이 오르는가" },
      { id: "wti", question: "원자재 전반의 물가 압력인가" }
    ],
    deepFocus: "안전자산·실질금리·달러 영향",
    transmission: "위험회피·물가 기대·실질금리·달러 → 금 선물 수요 → 자산배분 변화 → 금융시장 불확실성 신호",
    koreaImpact: "금 선물 상승이 VIX와 달러 강세를 동반하면 위험회피 가능성이 커집니다. 실질금리 하락만 반영한 상승이라면 한국 경기 충격으로 바로 연결하면 안 됩니다.",
    watch: ["미국 실질금리", "달러 지수", "VIX와 주식시장 방향"],
    indicators: [
      ref("real-interest-rate", "실질금리"),
      ref("consumer-inflation", "소비자물가 상승률"),
      ref("reserve-cover", "외환보유액 수입 커버"),
      ref("current-account", "경상수지")
    ],
    terms: [ref("안전자산", "안전자산"), ref("실질금리", "실질금리"), ref("달러인덱스", "달러인덱스"), ref("인플레이션", "인플레이션")],
    history: [ref("gold-standard", "금본위제"), ref("nixon-shock", "닉슨 쇼크"), ref("german-hyperinflation", "독일 초인플레이션")],
    industries: [ref("energy-infra", "전력·에너지 인프라"), ref("climate-resilience", "기후적응 인프라")],
    companies: [ref("ge-vernova", "GE Vernova"), ref("xylem", "Xylem")],
    countries: [ref("USA", "미국"), ref("KOR", "한국"), ref("CHN", "중국")],
    newsPattern: /금값|금\s*가격|금\s*선물|Gold|안전자산/i
  })
});

const RELATION_GROUPS = Object.freeze([
  ["indicators", ENTITY_PREFIXES.indicator],
  ["terms", ENTITY_PREFIXES.term],
  ["history", ENTITY_PREFIXES.historyEvent],
  ["industries", ENTITY_PREFIXES.industry],
  ["companies", ENTITY_PREFIXES.company],
  ["countries", ENTITY_PREFIXES.country]
]);

function normalizeEntityKey(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ko-KR")
    .replace(/[’']/g, "")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function createEntityId(type, rawId) {
  const prefix = ENTITY_PREFIXES[type] || normalizeEntityKey(type);
  const key = normalizeEntityKey(rawId);
  if (!prefix || !key) return null;
  return `${prefix}:${key}`;
}

export function countryEntityId(value) {
  const raw = String(value ?? "").trim();
  const canonical =
    COUNTRY_ALIASES[raw] ||
    COUNTRY_ALIASES[raw.toUpperCase()] ||
    COUNTRY_ALIASES[raw.toLocaleLowerCase("en-US")] ||
    raw.toUpperCase();
  return createEntityId("country", canonical);
}

export function termEntityId(value) {
  return createEntityId("term", value);
}

export function newsEventEntityId(headline = {}) {
  const raw =
    headline.eventKey ||
    headline.id ||
    `${headline.source || "unknown"}|${headline.title || "untitled"}|${String(headline.publishedAt || "").slice(0, 10)}`;
  return createEntityId("newsEvent", stableHash(raw));
}

function stableHash(input) {
  let hash = 2166136261;
  const text = String(input);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function getMarketKnowledge(marketId) {
  return MARKET_KNOWLEDGE[marketId] || null;
}

export function getMarketIdsForIndicator(indicatorId) {
  return Object.entries(MARKET_KNOWLEDGE)
    .filter(([, knowledge]) =>
      knowledge.indicators.some((indicator) => indicator.id === indicatorId)
    )
    .map(([marketId]) => marketId);
}

export function getMarketIdsForHistoryEvent(historyEventId) {
  return Object.entries(MARKET_KNOWLEDGE)
    .filter(([, knowledge]) =>
      knowledge.history.some((event) => event.id === historyEventId)
    )
    .map(([marketId]) => marketId);
}

export function getMarketIdsForTerm(term) {
  const target = termEntityId(term);
  return Object.entries(MARKET_KNOWLEDGE)
    .filter(([, knowledge]) =>
      knowledge.terms.some((item) => termEntityId(item.id) === target)
    )
    .map(([marketId]) => marketId);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function registerEntity(registries, group, entityId, data = {}) {
  if (!entityId) return null;
  const registry = registries[group];
  if (!registry) return null;
  const previous = registry.get(entityId) || {};
  registry.set(entityId, {
    ...previous,
    entityId,
    id: data.id ?? previous.id ?? entityId.split(":").slice(1).join(":"),
    label: data.label || previous.label || data.name || data.term || data.title || entityId,
    ...(data.sourceId ? { sourceId: data.sourceId } : {}),
    ...(data.parentId ? { parentId: data.parentId } : {})
  });
  return entityId;
}

function createRegistries() {
  return {
    markets: new Map(),
    countries: new Map(),
    indicators: new Map(),
    industries: new Map(),
    companies: new Map(),
    terms: new Map(),
    newsEvents: new Map(),
    historyEvents: new Map(),
    policies: new Map(),
    regimes: new Map(),
    analyses: new Map()
  };
}

function registerInputEntities(registries, input) {
  asArray(input.markets).forEach((market) => {
    registerEntity(
      registries,
      "markets",
      createEntityId("market", market.id),
      { id: market.id, label: market.name || MARKET_KNOWLEDGE[market.id]?.label }
    );
  });
  asArray(input.countries).forEach((country) => {
    registerEntity(
      registries,
      "countries",
      countryEntityId(country.id || country.code || country.name),
      { id: country.id, sourceId: country.id, label: country.label || country.name }
    );
  });
  asArray(input.countrySnapshots).forEach((country) => {
    registerEntity(
      registries,
      "countries",
      countryEntityId(country.id || country.code || country.name),
      { id: country.id, sourceId: country.id, label: country.name || country.label }
    );
  });
  asArray(input.indicatorDefinitions).forEach((indicator) => {
    registerEntity(
      registries,
      "indicators",
      createEntityId("indicator", indicator.id),
      { id: indicator.id, label: indicator.name || indicator.shortName }
    );
  });
  asArray(input.industries).forEach((industry) => {
    registerEntity(
      registries,
      "industries",
      createEntityId("industry", industry.id),
      { id: industry.id, label: industry.label || industry.shortLabel }
    );
  });
  asArray(input.companies).forEach((company) => {
    registerEntity(
      registries,
      "companies",
      createEntityId("company", company.id),
      { id: company.id, label: company.name, parentId: company.sectorId }
    );
  });
  asArray(input.glossaryTerms).forEach((term) => {
    registerEntity(
      registries,
      "terms",
      termEntityId(term.term || term.id),
      { id: term.term || term.id, label: term.term || term.label }
    );
  });
  asArray(input.historyEvents).forEach((event) => {
    registerEntity(
      registries,
      "historyEvents",
      createEntityId("historyEvent", event.id),
      { id: event.id, label: event.title, parentId: event.era }
    );
  });
  asArray(input.lawChanges).forEach((policy) => {
    registerEntity(
      registries,
      "policies",
      createEntityId("policy", policy.id),
      { id: policy.id, label: policy.shortTitle || policy.title, parentId: policy.countryId }
    );
  });
  REGIME_CATALOG.forEach((regime) => {
    registerEntity(
      registries,
      "regimes",
      createEntityId("regime", regime.id),
      regime
    );
  });
  if (input.analysis) {
    registerEntity(
      registries,
      "analyses",
      createEntityId("analysis", "market-common"),
      { id: "market-common", label: "공통 시장 분석" }
    );
  }
}

function registerKnowledgeTargets(registries) {
  Object.entries(MARKET_KNOWLEDGE).forEach(([marketId, knowledge]) => {
    registerEntity(
      registries,
      "markets",
      createEntityId("market", marketId),
      { id: marketId, label: knowledge.label }
    );
    RELATION_GROUPS.forEach(([field, prefix]) => {
      const registryGroup = {
        indicator: "indicators",
        term: "terms",
        "history-event": "historyEvents",
        industry: "industries",
        company: "companies",
        country: "countries"
      }[prefix];
      knowledge[field].forEach((item) => {
        const entityId =
          prefix === "country"
            ? countryEntityId(item.id)
            : prefix === "term"
              ? termEntityId(item.id)
              : createEntityId(
                  {
                    indicator: "indicator",
                    "history-event": "historyEvent",
                    industry: "industry",
                    company: "company"
                  }[prefix],
                  item.id
                );
        registerEntity(registries, registryGroup, entityId, {
          id: item.id,
          label: item.label
        });
      });
    });
  });
}

function headlineText(headline) {
  return [
    headline.title,
    headline.topic,
    headline.section,
    headline.summary,
    ...(headline.entities || [])
  ]
    .filter(Boolean)
    .join(" ");
}

export function matchHeadlineMarketIds(headline) {
  const text = headlineText(headline);
  const explicitEntities = new Set(asArray(headline.entities).map(String));
  const matches = Object.entries(MARKET_KNOWLEDGE)
    .filter(([marketId, knowledge]) =>
      explicitEntities.has(marketId) || knowledge.newsPattern.test(text)
    )
    .map(([marketId]) => marketId);

  if (!matches.length && headline.section === "korea") {
    matches.push("kospi", "usdkrw");
  } else if (!matches.length && headline.section === "us") {
    matches.push("sp500", "nasdaq");
  } else if (!matches.length && headline.section === "commodities-fx") {
    matches.push("usdkrw", "wti", "gold");
  }
  return [...new Set(matches)];
}

function relationRefs(knowledge, field, type) {
  return knowledge[field].map((item) =>
    type === "country"
      ? countryEntityId(item.id)
      : type === "term"
        ? termEntityId(item.id)
        : createEntityId(type, item.id)
  );
}

function getRegimeRefs(analysis) {
  const explicit = asArray(analysis?.regimeIds)
    .map((id) => createEntityId("regime", id))
    .filter(Boolean);
  if (explicit.length) return [...new Set(explicit)];
  const riskScore = Number(analysis?.riskScore);
  if (!Number.isFinite(riskScore)) return [];
  if (riskScore >= 66) return [createEntityId("regime", "financial-stress")];
  if (riskScore >= 45) return [createEntityId("regime", "slowdown")];
  return [createEntityId("regime", "recovery")];
}

function mapToObject(registry) {
  return Object.fromEntries(
    [...registry.entries()].sort(([left], [right]) => left.localeCompare(right, "ko"))
  );
}

function buildIntegrity(entities, relations) {
  const known = new Set(
    Object.values(entities).flatMap((group) => Object.keys(group))
  );
  const unresolved = new Set();
  Object.values(relations.markets).forEach((relation) => {
    [
      relation.marketRef,
      relation.analysisRef,
      ...relation.newsRefs,
      ...relation.indicatorRefs,
      ...relation.termRefs,
      ...relation.historyRefs,
      ...relation.industryRefs,
      ...relation.companyRefs,
      ...relation.countryRefs,
      ...relation.policyRefs,
      ...relation.regimeRefs
    ]
      .filter(Boolean)
      .forEach((entityId) => {
        if (!known.has(entityId)) unresolved.add(entityId);
      });
  });
  return {
    valid: unresolved.size === 0,
    unresolvedRefs: [...unresolved].sort(),
    entityCount: known.size,
    marketRelationCount: Object.keys(relations.markets).length
  };
}

export function buildSharedDataGraph(input = {}) {
  const registries = createRegistries();
  registerInputEntities(registries, input);
  registerKnowledgeTargets(registries);

  const uniqueNews = new Map();
  asArray(input.headlines).forEach((headline) => {
    const entityId = newsEventEntityId(headline);
    if (!uniqueNews.has(entityId)) uniqueNews.set(entityId, headline);
    registerEntity(registries, "newsEvents", entityId, {
      id: headline.eventKey || headline.id || entityId,
      label: headline.title || "제목 없음",
      parentId: headline.section || "all"
    });
  });

  const analysisRef = input.analysis
    ? createEntityId("analysis", "market-common")
    : null;
  const marketRelations = {};
  Object.entries(MARKET_KNOWLEDGE).forEach(([marketId, knowledge]) => {
    const marketRef = createEntityId("market", marketId);
    const countryRefs = relationRefs(knowledge, "countries", "country");
    const countryKeys = new Set(countryRefs);
    const policyRefs = asArray(input.lawChanges)
      .filter((policy) =>
        countryKeys.has(
          countryEntityId(policy.countryId || policy.jurisdiction)
        )
      )
      .map((policy) => createEntityId("policy", policy.id));
    const newsRefs = [...uniqueNews.entries()]
      .filter(([, headline]) => matchHeadlineMarketIds(headline).includes(marketId))
      .map(([entityId]) => entityId);

    marketRelations[marketId] = {
      marketRef,
      analysisRef,
      knowledgeRef: `market-knowledge:${marketId}`,
      newsRefs: [...new Set(newsRefs)],
      indicatorRefs: relationRefs(knowledge, "indicators", "indicator"),
      termRefs: relationRefs(knowledge, "terms", "term"),
      historyRefs: relationRefs(knowledge, "history", "historyEvent"),
      industryRefs: relationRefs(knowledge, "industries", "industry"),
      companyRefs: relationRefs(knowledge, "companies", "company"),
      countryRefs,
      policyRefs: [...new Set(policyRefs)],
      regimeRefs: getRegimeRefs(input.analysis)
    };
  });

  const indicatorRelations = {};
  Object.values(marketRelations).forEach((relation) => {
    relation.indicatorRefs.forEach((indicatorRef) => {
      const id = indicatorRef.split(":").slice(1).join(":");
      const current = indicatorRelations[id] || {
        indicatorRef,
        marketRefs: [],
        newsRefs: []
      };
      current.marketRefs.push(relation.marketRef);
      current.newsRefs.push(...relation.newsRefs);
      current.marketRefs = [...new Set(current.marketRefs)];
      current.newsRefs = [...new Set(current.newsRefs)];
      indicatorRelations[id] = current;
    });
  });

  const historyRelations = {};
  Object.values(marketRelations).forEach((relation) => {
    relation.historyRefs.forEach((historyRef) => {
      const id = historyRef.split(":").slice(1).join(":");
      const current = historyRelations[id] || {
        historyRef,
        marketRefs: []
      };
      current.marketRefs.push(relation.marketRef);
      current.marketRefs = [...new Set(current.marketRefs)];
      historyRelations[id] = current;
    });
  });

  const entities = Object.fromEntries(
    Object.entries(registries).map(([group, registry]) => [
      group,
      mapToObject(registry)
    ])
  );
  const relations = {
    markets: marketRelations,
    indicators: indicatorRelations,
    history: historyRelations,
    study: {
      currentMarketRefs: asArray(input.markets)
        .filter((market) => Number.isFinite(Number(market.changePercent)))
        .sort(
          (left, right) =>
            Math.abs(Number(right.changePercent)) -
            Math.abs(Number(left.changePercent))
        )
        .slice(0, 3)
        .map((market) => createEntityId("market", market.id))
    }
  };

  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt || null,
    entities,
    relations,
    integrity: buildIntegrity(entities, relations)
  };
}

export function getGraphEntity(graph, entityId) {
  if (!graph || !entityId) return null;
  for (const group of Object.values(graph.entities || {})) {
    if (group?.[entityId]) return group[entityId];
  }
  return null;
}

