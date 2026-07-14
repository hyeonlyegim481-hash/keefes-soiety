import {
  glossaryCategoryOrder as coreGlossaryCategories,
  glossaryTerms as coreGlossaryTerms
} from "./glossary-data.js?v=50";
import {
  glossaryExtraCategories,
  glossaryExtraTerms
} from "./glossary-extra-data.js?v=50";
import {
  glossaryMoreCategories,
  glossaryMoreTerms
} from "./glossary-more-data.js?v=50";
import {
  glossaryProCategories,
  glossaryProTerms
} from "./glossary-pro-data.js?v=50";
import { scenarioQuestions as baseScenarioQuestions } from "./quiz-data.js?v=50";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js?v=50";
import { historyEras, historyEvents, historyPatterns } from "./history-data.js?v=50";
import { indicatorCategories, indicatorCountries, indicatorDefinitions } from "./indicator-data.js?v=50";
import { indicatorSnapshot } from "./indicator-values.js?v=50";

const scenarioQuestions = [...baseScenarioQuestions, ...extraScenarioQuestions];
const glossaryCategoryOrder = [
  ...coreGlossaryCategories,
  ...glossaryExtraCategories,
  ...glossaryMoreCategories,
  ...glossaryProCategories
];
const glossaryTerms = [
  ...coreGlossaryTerms.map((item) => ({ ...item, level: "core" })),
  ...glossaryExtraTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossaryMoreTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossaryProTerms.map((item) => ({ ...item, level: "advanced" }))
];

const GLOSSARY_PAGE_SIZE = 24;

const ECONOMIC_QUOTES = [
  {
    text: "가격은 지불하는 것이고, 가치는 얻는 것이다.",
    author: "워런 버핏",
    lesson: "가격의 하루 움직임과 경제적 가치를 분리해서 봅니다."
  },
  {
    text: "단기적으로 시장은 투표기계지만, 장기적으로는 저울이다.",
    author: "벤저민 그레이엄",
    lesson: "인기보다 이익과 현금흐름이 실제로 변했는지 확인합니다."
  },
  {
    text: "소비는 모든 생산의 유일한 목적이다.",
    author: "애덤 스미스",
    lesson: "생산지표를 볼 때 최종 수요가 함께 살아나는지 확인합니다."
  },
  {
    text: "무엇을 소유했는지, 왜 소유했는지 알아야 한다.",
    author: "피터 린치",
    lesson: "시장 전망보다 판단의 근거와 틀릴 조건을 먼저 적어봅니다."
  },
  {
    text: "투자에서 중요한 것은 무엇을 사느냐뿐 아니라 얼마에 사느냐이다.",
    author: "하워드 막스",
    lesson: "좋은 뉴스와 이미 가격에 반영된 기대를 구분합니다."
  },
  {
    text: "큰돈은 사고파는 데서가 아니라 기다리는 데서 벌린다.",
    author: "찰리 멍거",
    lesson: "한 번의 수치보다 같은 방향의 신호가 이어지는지 봅니다."
  },
  {
    text: "고통과 성찰이 발전을 만든다.",
    author: "레이 달리오",
    lesson: "틀린 판단은 지우지 말고 어떤 신호를 놓쳤는지 복기합니다."
  }
];

const ECONOMIC_RELATIONSHIPS = [
  {
    id: "rate-hike",
    label: "금리 인상",
    category: "통화정책",
    trigger: "중앙은행이 기준금리를 올린다",
    summary: "돈을 빌리는 비용을 높여 과열된 수요와 물가 압력을 낮추려는 흐름입니다.",
    steps: [
      { title: "기준금리 ↑", detail: "중앙은행이 단기 자금의 기준 가격을 높입니다." },
      { title: "예금·대출금리 ↑", detail: "은행 조달비용과 채권금리가 반응하며 가계와 기업의 금리도 오릅니다." },
      { title: "이자 부담 ↑", detail: "기존 변동금리 대출과 새로 빌리는 돈의 비용이 커집니다." },
      { title: "소비·투자 ↓", detail: "가계는 소비를 줄이고 기업은 수익성이 낮은 투자 계획을 미룹니다." },
      { title: "수요·물가 압력 ↓", detail: "경제 전체의 지출이 둔화되며 수요 측 물가 압력이 낮아질 수 있습니다." }
    ],
    effects: ["채권가격 하락 가능", "원화 강세 가능", "성장주 부담", "예금 매력 상승"],
    exception: "물가가 유가·전쟁 같은 공급 충격으로 오르면 금리를 올려도 물가가 천천히 내려갈 수 있습니다. 경기가 매우 강하면 소비와 투자도 예상보다 덜 줄어듭니다.",
    lag: "대출금리는 비교적 빠르게 반응하지만 소비·투자·물가에는 보통 수개월에서 1년 이상 시차가 생깁니다."
  },
  {
    id: "rate-cut",
    label: "금리 인하",
    category: "통화정책",
    trigger: "중앙은행이 기준금리를 내린다",
    summary: "자금조달 부담을 낮춰 소비와 투자를 살리고 경기 둔화를 완화하려는 흐름입니다.",
    steps: [
      { title: "기준금리 ↓", detail: "중앙은행이 단기 자금의 기준 가격을 낮춥니다." },
      { title: "시장·대출금리 ↓", detail: "채권금리와 은행의 신규 대출금리가 내려갈 가능성이 커집니다." },
      { title: "이자 부담 ↓", detail: "가계의 가처분소득과 기업의 자금조달 여건이 나아질 수 있습니다." },
      { title: "소비·투자 ↑", detail: "주택, 설비, 재고처럼 금리에 민감한 지출이 회복될 여지가 생깁니다." },
      { title: "성장·자산가격 ↑", detail: "경기 기대와 미래 이익의 현재가치가 높아져 주식·부동산에 우호적일 수 있습니다." }
    ],
    effects: ["채권가격 상승 가능", "원화 약세 가능", "성장주 우호", "부채 증가 주의"],
    exception: "금리 인하가 심각한 침체 신호로 받아들여지면 주가와 투자가 바로 오르지 않을 수 있습니다. 이미 부채가 많으면 낮은 금리에도 새 대출 수요가 약할 수 있습니다.",
    lag: "금융시장은 발표 전에 움직이기도 하지만 실제 고용과 투자는 여러 분기에 걸쳐 반응합니다."
  },
  {
    id: "oil-up",
    label: "유가 상승",
    category: "물가·원자재",
    trigger: "국제유가가 빠르게 오른다",
    summary: "에너지를 수입하는 한국에는 생산비와 생활비를 동시에 높이는 공급 충격이 될 수 있습니다.",
    steps: [
      { title: "국제유가 ↑", detail: "원유 공급 차질이나 세계 수요 증가로 에너지 가격이 오릅니다." },
      { title: "수입단가 ↑", detail: "달러로 결제하는 원유·가스의 국내 도입 비용이 커집니다." },
      { title: "기업 비용 ↑", detail: "운송, 항공, 화학, 제조업의 연료와 원재료 비용이 늘어납니다." },
      { title: "소비자물가 ↑", detail: "휘발유·전기·운송비를 거쳐 생활물가로 일부 전가될 수 있습니다." },
      { title: "실질소득·성장 ↓", detail: "같은 소득으로 살 수 있는 양이 줄고 기업 마진도 압박받을 수 있습니다." }
    ],
    effects: ["정유업종 혼합", "항공·운송 부담", "물가 기대 상승", "금리 인하 지연 가능"],
    exception: "유가가 세계 경기 회복 때문에 오른다면 수출 증가가 비용 부담을 일부 상쇄할 수 있습니다. 기업이 비용을 흡수하면 소비자물가 전가는 제한됩니다.",
    lag: "주유소 가격은 비교적 빠르지만 전기요금과 제품가격, 중앙은행 판단에는 더 긴 시차가 생깁니다."
  },
  {
    id: "won-weakness",
    label: "원화 약세",
    category: "환율",
    trigger: "원/달러 환율이 오른다",
    summary: "수입품은 비싸지고 수출기업의 원화 환산 매출은 늘 수 있어 한국 경제에 영향이 엇갈립니다.",
    steps: [
      { title: "원/달러 ↑", detail: "달러 한 단위를 사는 데 더 많은 원화가 필요해집니다." },
      { title: "수입물가 ↑", detail: "원유, 곡물, 부품처럼 달러 결제 상품의 원화 가격이 오릅니다." },
      { title: "가계 구매력 ↓", detail: "해외여행과 수입 소비재가 비싸지고 생활물가 부담이 커질 수 있습니다." },
      { title: "수출기업 매출 ↑ 가능", detail: "같은 달러 매출을 원화로 바꿀 때 장부상 매출이 커질 수 있습니다." },
      { title: "금리·외국인 수급 부담", detail: "환율 불안이 길어지면 물가와 외국인 환차손 우려가 함께 커질 수 있습니다." }
    ],
    effects: ["수입기업 부담", "수출기업 일부 수혜", "외국인 수급 경계", "해외소비 비용 상승"],
    exception: "해외 수요가 약하거나 원자재를 많이 수입하는 기업은 원화 약세의 수출 효과가 작을 수 있습니다. 환헤지 비율에 따라서도 실적 영향이 달라집니다.",
    lag: "금융시장은 즉시 반응하지만 수입물가와 기업 실적은 계약 갱신과 재고 소진 뒤 나타날 수 있습니다."
  },
  {
    id: "fiscal-expansion",
    label: "재정 확대",
    category: "정부정책",
    trigger: "정부가 지출이나 지원을 늘린다",
    summary: "정부 수요를 늘려 민간 경기와 고용을 받치지만 재정 부담과 물가도 함께 살펴봐야 합니다.",
    steps: [
      { title: "정부지출 ↑", detail: "인프라, 복지, 보조금, 공공구매에 더 많은 예산이 투입됩니다." },
      { title: "기업 주문·가계소득 ↑", detail: "정부 계약과 이전소득을 통해 민간 부문으로 돈이 이동합니다." },
      { title: "소비·투자 ↑", detail: "소득과 매출 기대가 높아지면서 추가 지출이 만들어질 수 있습니다." },
      { title: "생산·고용 ↑", detail: "남는 생산 여력이 있다면 기업이 생산과 채용을 늘립니다." },
      { title: "물가·국채 부담 ↑ 가능", detail: "경제가 이미 과열됐다면 물가, 국채 발행, 금리 부담이 더 커질 수 있습니다." }
    ],
    effects: ["내수업종 우호", "고용 개선 가능", "국채금리 상승 가능", "재정건전성 점검"],
    exception: "수입품 구매나 저축으로 빠지는 비중이 크면 국내 생산 효과가 작습니다. 경제가 과열된 상태에서는 생산보다 물가가 더 많이 오를 수 있습니다.",
    lag: "현금성 지원은 비교적 빠르지만 인프라 투자와 생산성 효과는 집행 절차 때문에 오래 걸립니다."
  },
  {
    id: "exports-up",
    label: "수출 회복",
    category: "대외경제",
    trigger: "세계 수요와 한국 수출 주문이 늘어난다",
    summary: "수출기업의 생산과 이익이 늘고 고용·투자로 파급되면 한국 경기 전반의 회복 신호가 됩니다.",
    steps: [
      { title: "해외 수요 ↑", detail: "미국·중국 등 주요 시장의 소비와 설비투자가 늘어납니다." },
      { title: "수출 주문 ↑", detail: "반도체, 자동차, 조선 등 한국 기업의 해외 주문이 증가합니다." },
      { title: "생산·가동률 ↑", detail: "재고가 줄고 공장 가동률과 기업 매출이 개선됩니다." },
      { title: "고용·설비투자 ↑", detail: "회복이 지속되면 기업이 인력과 생산능력을 늘립니다." },
      { title: "성장·경상수지 개선", detail: "수출의 국내 부가가치가 늘면 GDP와 외화 수입에 긍정적입니다." }
    ],
    effects: ["KOSPI 대형주 우호", "원화 강세 가능", "설비투자 증가", "지역·업종 격차 가능"],
    exception: "환율 효과나 낮은 전년도 기저 때문에 증가율만 높을 수도 있습니다. 수입 원재료가 함께 급증하면 무역수지 개선은 작을 수 있습니다.",
    lag: "수주와 통관은 먼저 보이지만 고용과 설비투자는 회복 지속 여부를 확인한 뒤 늦게 반응합니다."
  },
  {
    id: "wage-up",
    label: "임금 상승",
    category: "노동·소비",
    trigger: "근로자의 임금이 생산성보다 빠르게 오른다",
    summary: "가계소득과 소비에는 힘이 되지만 기업 비용과 서비스 물가에는 부담이 될 수 있습니다.",
    steps: [
      { title: "명목임금 ↑", detail: "근로자가 받는 급여의 원화 금액이 늘어납니다." },
      { title: "가계소득 ↑", detail: "물가보다 임금이 더 오르면 실제 구매 가능한 양도 늘어납니다." },
      { title: "소비 ↑", detail: "외식, 여행, 내구재 등 선택적 소비가 확대될 수 있습니다." },
      { title: "기업 인건비 ↑", detail: "생산성이 같이 늘지 않으면 기업의 단위당 비용이 상승합니다." },
      { title: "고용·가격 조정", detail: "기업은 가격을 올리거나 자동화, 채용 축소, 마진 감소로 대응할 수 있습니다." }
    ],
    effects: ["내수소비 우호", "서비스물가 압력", "자동화 투자 증가", "기업별 마진 차이"],
    exception: "생산성이 임금만큼 오르면 기업 비용 부담 없이 소득과 소비가 늘 수 있습니다. 경기침체기에는 임금이 올라도 불안 때문에 저축이 증가할 수 있습니다.",
    lag: "소비는 급여 지급 뒤 빠르게 반응할 수 있지만 기업의 가격·고용 조정은 계약과 사업계획에 따라 늦게 나타납니다."
  },
  {
    id: "home-price-down",
    label: "집값 하락",
    category: "부동산·신용",
    trigger: "주택가격이 넓은 지역에서 지속적으로 내린다",
    summary: "가계의 자산가치와 담보 여력이 줄어 소비, 건설, 금융기관 건전성에 영향을 줄 수 있습니다.",
    steps: [
      { title: "주택가격 ↓", detail: "거래가격과 기대가격이 낮아지며 주택 보유자의 자산가치가 줄어듭니다." },
      { title: "담보가치·부의 효과 ↓", detail: "추가 대출 여력과 자산 상승에서 느끼는 소비 자신감이 약해집니다." },
      { title: "소비·주택거래 ↓", detail: "가계가 지출을 줄이고 매수자는 추가 하락을 기다릴 수 있습니다." },
      { title: "건설·관련 고용 ↓", detail: "분양과 착공이 줄면 건설, 자재, 중개업으로 충격이 번집니다." },
      { title: "신용위험 ↑ 가능", detail: "가격 하락과 소득 감소가 겹치면 연체와 금융기관 손실 우려가 커집니다." }
    ],
    effects: ["건설업 부담", "가계소비 둔화", "임차시장 혼합", "금융안정 점검"],
    exception: "소득과 고용이 견조하고 하락폭이 작다면 소비 충격은 제한적일 수 있습니다. 집값 하락은 무주택자의 구매 접근성을 개선하는 효과도 있습니다.",
    lag: "거래량은 먼저 줄고 착공, 고용, 연체율은 여러 분기 뒤에 악화될 수 있습니다."
  }
];

const elements = {
  connectionStatus: document.querySelector("#connectionStatus"),
  refreshButton: document.querySelector("#refreshButton"),
  regimeTitle: document.querySelector("#regimeTitle"),
  pulseText: document.querySelector("#pulseText"),
  watchChips: document.querySelector("#watchChips"),
  riskMeter: document.querySelector("#riskMeter"),
  riskScore: document.querySelector("#riskScore"),
  riskDrivers: document.querySelector("#riskDrivers"),
  riskLegend: document.querySelector("#riskLegend"),
  updatedAt: document.querySelector("#updatedAt"),
  sourceLine: document.querySelector("#sourceLine"),
  briefBoard: document.querySelector("#briefBoard"),
  marketStrip: document.querySelector("#marketStrip"),
  marketBrief: document.querySelector("#marketBrief"),
  marketBoard: document.querySelector("#marketBoard"),
  marketConnections: document.querySelector("#marketConnections"),
  chartTabs: document.querySelector("#chartTabs"),
  chartTitle: document.querySelector("#chartTitle"),
  chartMeta: document.querySelector("#chartMeta"),
  chartFrame: document.querySelector("#chartFrame"),
  chartCanvasWrap: document.querySelector("#chartCanvasWrap"),
  chartCurrentValue: document.querySelector("#chartCurrentValue"),
  chartStatusText: document.querySelector("#chartStatusText"),
  chartPeriodBadge: document.querySelector("#chartPeriodBadge"),
  chartHoverLine: document.querySelector("#chartHoverLine"),
  chartHoverDot: document.querySelector("#chartHoverDot"),
  chartTooltip: document.querySelector("#chartTooltip"),
  marketChart: document.querySelector("#marketChart"),
  analysisList: document.querySelector("#analysisList"),
  analysisBoard: document.querySelector("#analysisBoard"),
  analysisQuote: document.querySelector("#analysisQuote"),
  koreaBrief: document.querySelector("#koreaBrief"),
  macroGrid: document.querySelector("#macroGrid"),
  koreaBoard: document.querySelector("#koreaBoard"),
  koreaImpact: document.querySelector("#koreaImpact"),
  newsBrief: document.querySelector("#newsBrief"),
  newsBoard: document.querySelector("#newsBoard"),
  newsIntelligence: document.querySelector("#newsIntelligence"),
  newsList: document.querySelector("#newsList"),
  scenarioMatrix: document.querySelector("#scenarioMatrix"),
  studyBrief: document.querySelector("#studyBrief"),
  thinkingLab: document.querySelector("#thinkingLab"),
  relationshipLab: document.querySelector("#relationshipLab"),
  dailyTerm: document.querySelector("#dailyTerm"),
  studyQuiz: document.querySelector("#studyQuiz"),
  historyBrief: document.querySelector("#historyBrief"),
  historyEraTabs: document.querySelector("#historyEraTabs"),
  historyOverview: document.querySelector("#historyOverview"),
  historyTimeline: document.querySelector("#historyTimeline"),
  historyPatterns: document.querySelector("#historyPatterns"),
  historyCount: document.querySelector("#historyCount"),
  indicatorUpdate: document.querySelector("#indicatorUpdate"),
  indicatorSummary: document.querySelector("#indicatorSummary"),
  indicatorCategoryTabs: document.querySelector("#indicatorCategoryTabs"),
  indicatorSearch: document.querySelector("#indicatorSearch"),
  indicatorCount: document.querySelector("#indicatorCount"),
  indicatorList: document.querySelector("#indicatorList"),
  indicatorDetail: document.querySelector("#indicatorDetail"),
  glossaryTotal: document.querySelector("#glossaryTotal"),
  glossaryLevels: document.querySelector("#glossaryLevels"),
  glossarySearch: document.querySelector("#glossarySearch"),
  glossaryResultCount: document.querySelector("#glossaryResultCount"),
  glossaryCategories: document.querySelector("#glossaryCategories"),
  glossaryResults: document.querySelector("#glossaryResults"),
  glossaryLoadMore: document.querySelector("#glossaryLoadMore"),
  quizBankSize: document.querySelector("#quizBankSize"),
  quizModes: document.querySelector("#quizModes"),
  quizBody: document.querySelector("#quizBody"),
  chapterTabs: document.querySelectorAll(".chapter-tab"),
  chapterWindow: document.querySelector("#chapterWindow"),
  chapterTrack: document.querySelector("#chapterTrack"),
  chapterPanes: document.querySelectorAll("[data-chapter-panel]"),
  chapterProgress: document.querySelector("#chapterProgress")
};

const formatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2
});
const compactFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1
});
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit"
});
const marketTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const chartAxisTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit"
});
const chartTooltipTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit"
});
const studyDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short"
});
const riskLevels = [
  {
    min: 0,
    max: 30,
    label: "안정",
    detail: "위험선호가 비교적 편한 구간",
    tone: "positive"
  },
  {
    min: 31,
    max: 44,
    label: "낮음",
    detail: "큰 충격은 없지만 관찰 필요",
    tone: "positive"
  },
  {
    min: 45,
    max: 65,
    label: "주의",
    detail: "방향 확인이 필요한 중립 구간",
    tone: "watch"
  },
  {
    min: 66,
    max: 80,
    label: "높음",
    detail: "방어적으로 봐야 하는 구간",
    tone: "negative"
  },
  {
    min: 81,
    max: 100,
    label: "매우 높음",
    detail: "충격과 변동성 확대 경계",
    tone: "negative"
  }
];
const economicTerms = [
  {
    id: "base-rate",
    term: "기준금리",
    category: "통화정책",
    definition: "중앙은행이 경제 전체의 금리 방향을 정하기 위해 사용하는 기준이 되는 금리입니다.",
    easy: "돈을 빌리는 가격의 출발점입니다. 기준금리가 오르면 예금과 대출 금리가 대체로 함께 오릅니다.",
    why: "소비, 부동산, 기업 투자, 환율과 주식의 가치평가에 동시에 영향을 줍니다.",
    mistake: "기준금리가 바뀌었다고 모든 대출금리가 같은 날 같은 폭으로 움직이는 것은 아닙니다.",
    related: ["채권금리", "인플레이션", "유동성"],
    question: "물가가 높은데 중앙은행이 기준금리를 빠르게 내리면 어떤 일이 생길 수 있을까요?",
    answer: "대출 부담은 줄 수 있지만 소비와 자산가격이 다시 강해져 물가가 재상승하거나 통화가 약해질 위험이 있습니다."
  },
  {
    id: "inflation",
    term: "인플레이션",
    category: "물가",
    definition: "상품과 서비스의 전반적인 가격 수준이 지속해서 오르는 현상입니다.",
    easy: "같은 돈으로 살 수 있는 물건의 양이 줄어드는 것입니다.",
    why: "가계 구매력과 기업 비용을 바꾸고 중앙은행의 금리 결정을 좌우합니다.",
    mistake: "일부 품목만 일시적으로 비싸진 것을 경제 전체의 인플레이션과 같다고 볼 수는 없습니다.",
    related: ["소비자물가", "실질금리", "기대인플레이션"],
    question: "물가상승률이 낮아졌다는 말은 물건값이 내려갔다는 뜻일까요?",
    answer: "아닙니다. 가격이 계속 오르되 오르는 속도가 느려졌다는 뜻일 수 있습니다. 가격 자체가 내려가는 디플레이션과 다릅니다."
  },
  {
    id: "real-rate",
    term: "실질금리",
    category: "금리",
    definition: "명목금리에서 물가상승률을 뺀, 구매력 변화를 반영한 금리입니다.",
    easy: "예금 이자가 4%여도 물가가 3% 오르면 실제 구매력 증가는 약 1%라는 뜻입니다.",
    why: "현금과 채권의 매력, 기업 투자와 소비의 부담을 더 정확하게 보여줍니다.",
    mistake: "뉴스에 나오는 기준금리나 대출금리만 보고 실제 금융 여건을 전부 판단하면 안 됩니다.",
    related: ["명목금리", "인플레이션", "채권"],
    question: "명목금리가 그대로인데 물가상승률이 낮아지면 실질금리는 어떻게 될까요?",
    answer: "실질금리는 높아집니다. 그래서 금리를 올리지 않아도 경제가 느끼는 긴축 강도가 커질 수 있습니다."
  },
  {
    id: "exchange-rate",
    term: "원/달러 환율",
    category: "외환",
    definition: "미국 달러 1개를 사는 데 필요한 원화의 가격입니다.",
    easy: "원/달러가 1,400원에서 1,450원으로 오르면 달러가 비싸지고 원화가 약해진 것입니다.",
    why: "수입물가, 수출기업 실적, 외국인 투자자의 환차손과 한국은행의 정책 여력에 영향을 줍니다.",
    mistake: "환율 상승이 모든 수출기업에 무조건 호재인 것은 아닙니다. 원재료 수입 비용과 외화부채도 봐야 합니다.",
    related: ["원화 약세", "달러 인덱스", "외국인 수급"],
    question: "한국 주가가 그대로인데 원/달러 환율이 크게 오르면 외국인 투자자는 무엇을 걱정할까요?",
    answer: "원화 가치 하락에 따른 환차손을 걱정할 수 있습니다. 그래서 주가가 버텨도 자금이 빠질 수 있습니다."
  },
  {
    id: "vix",
    term: "VIX",
    category: "시장 심리",
    definition: "미국 S&P 500 옵션 가격으로 계산한 향후 약 30일의 예상 변동성 지수입니다.",
    easy: "시장이 앞으로 얼마나 크게 흔들릴 것으로 보는지 보여주는 온도계에 가깝습니다.",
    why: "급등하면 위험자산 회피와 현금·달러·안전자산 선호가 강해질 가능성이 큽니다.",
    mistake: "VIX가 올랐다고 주가가 반드시 계속 하락하는 것은 아닙니다. 이미 공포가 크게 반영된 구간일 수도 있습니다.",
    related: ["변동성", "옵션", "위험선호"],
    question: "주가는 하락했는데 VIX가 오르지 않았다면 어떻게 해석할 수 있을까요?",
    answer: "하락이 공포성 충격이라기보다 차익실현이나 특정 업종 조정일 가능성도 생각할 수 있습니다."
  },
  {
    id: "bond-yield",
    term: "국채금리",
    category: "채권",
    definition: "정부가 발행한 채권을 보유할 때 시장이 요구하는 수익률입니다.",
    easy: "국가가 돈을 빌릴 때 시장에서 형성되는 이자율이며 다른 대출과 자산 가격의 기준이 됩니다.",
    why: "기업 자금조달 비용과 주식의 할인율, 환율과 부동산 금융 여건에 영향을 줍니다.",
    mistake: "채권 가격과 채권금리는 반대로 움직입니다. 금리가 오르면 기존 채권 가격은 보통 내려갑니다.",
    related: ["채권 가격", "기준금리", "할인율"],
    question: "미국 장기 국채금리가 급등하면 성장주가 부담을 받을 수 있는 이유는 무엇일까요?",
    answer: "미래 이익을 현재 가치로 계산할 때 쓰는 할인율이 높아지고, 안전한 채권의 매력도 커지기 때문입니다."
  },
  {
    id: "liquidity",
    term: "유동성",
    category: "금융환경",
    definition: "돈이 필요할 때 자산을 큰 손실 없이 현금으로 바꾸거나 자금을 조달할 수 있는 정도입니다.",
    easy: "시장에 돈이 얼마나 원활하게 돌고 있는지를 뜻합니다.",
    why: "유동성이 풍부하면 투자와 자산 거래가 쉬워지고, 부족하면 작은 충격도 큰 가격 변동으로 이어질 수 있습니다.",
    mistake: "시중에 돈이 많다는 것과 모든 자산 가격이 반드시 오른다는 것은 같은 말이 아닙니다.",
    related: ["통화량", "신용", "금융시장"],
    question: "거래량이 적은 시장에서 큰 매도 주문이 나오면 가격이 더 크게 흔들리는 이유는 무엇일까요?",
    answer: "받아줄 매수 주문이 부족해 더 낮은 가격까지 내려가야 거래가 성사되기 때문입니다."
  },
  {
    id: "base-effect",
    term: "기저효과",
    category: "경제지표",
    definition: "비교 기준이 된 과거 수치가 너무 높거나 낮아 현재 증가율이 실제 체감보다 크게 달라 보이는 현상입니다.",
    easy: "작년에 매우 나빴다면 올해 조금만 좋아져도 증가율이 크게 보일 수 있습니다.",
    why: "물가, 수출, 성장률처럼 전년 대비로 발표되는 숫자를 올바르게 해석하는 데 필요합니다.",
    mistake: "증가율이 높다는 사실만으로 경제의 절대 수준도 높다고 단정하면 안 됩니다.",
    related: ["전년 동월 대비", "전월 대비", "증가율"],
    question: "수출 증가율이 20%인데 수출액은 과거 최고치보다 낮을 수 있을까요?",
    answer: "그럴 수 있습니다. 비교 대상인 전년 수출액이 매우 낮았다면 증가율만 크게 보일 수 있습니다."
  },
  {
    id: "current-account",
    term: "경상수지",
    category: "대외경제",
    definition: "상품·서비스 거래와 소득 이전을 포함해 한 나라가 해외와 주고받은 돈의 종합 성적표입니다.",
    easy: "나라 전체가 해외에서 번 돈과 쓴 돈을 넓게 비교한 값입니다.",
    why: "통화 가치와 외화 유동성, 국가의 대외 건전성을 판단하는 데 사용됩니다.",
    mistake: "무역수지는 상품 거래만 보지만 경상수지는 서비스와 배당·이자까지 포함합니다.",
    related: ["무역수지", "서비스수지", "환율"],
    question: "상품 수출이 좋아도 경상수지가 나빠질 수 있을까요?",
    answer: "가능합니다. 해외여행이나 운송 등 서비스수지 적자, 해외 배당 지급이 더 크게 늘 수 있기 때문입니다."
  },
  {
    id: "valuation",
    term: "밸류에이션",
    category: "주식",
    definition: "기업의 이익·자산·현금흐름에 비해 현재 주가가 어느 수준인지 평가하는 과정입니다.",
    easy: "좋은 회사인지와 별개로 지금 가격이 비싼지 싼지를 따져보는 것입니다.",
    why: "금리와 이익 전망이 변할 때 같은 기업도 시장에서 받을 수 있는 가격이 달라집니다.",
    mistake: "PER이 낮다고 무조건 저평가된 것은 아닙니다. 이익이 앞으로 급감할 것으로 예상될 수도 있습니다.",
    related: ["PER", "PBR", "할인율"],
    question: "기업 이익은 그대로인데 시장금리가 오르면 밸류에이션은 어떻게 변하기 쉬울까요?",
    answer: "미래 이익의 현재 가치가 낮아져 시장이 인정하는 배수가 축소될 가능성이 큽니다."
  },
  {
    id: "risk-on",
    term: "위험선호",
    category: "자금 흐름",
    definition: "투자자가 변동성을 감수하고 주식·회사채·신흥국 자산처럼 기대수익이 높은 자산을 사려는 태도입니다.",
    easy: "안전보다 수익 기회를 더 적극적으로 찾는 시장 분위기입니다.",
    why: "글로벌 주식, 원화, 원자재와 외국인 수급이 같은 방향으로 움직이는 이유를 설명해줍니다.",
    mistake: "주가지수 하나가 올랐다는 이유만으로 시장 전체가 위험선호라고 단정하면 안 됩니다.",
    related: ["위험회피", "VIX", "신흥국 자금"],
    question: "S&P 500은 올랐는데 원화와 KOSPI가 약하다면 완전한 위험선호라고 볼 수 있을까요?",
    answer: "어렵습니다. 미국 내부의 상승일 수 있으므로 달러, 신흥국 통화와 한국 외국인 수급을 함께 봐야 합니다."
  },
  {
    id: "credit-spread",
    term: "신용스프레드",
    category: "신용시장",
    definition: "회사채 금리와 안전한 국채 금리 사이의 차이로, 기업 부도 위험에 대한 추가 보상입니다.",
    easy: "기업에 돈을 빌려줄 때 국채보다 얼마나 더 높은 이자를 요구하는지 보여줍니다.",
    why: "넓어지면 금융시장이 기업 위험을 더 크게 걱정한다는 뜻이며 경기 둔화의 신호가 될 수 있습니다.",
    mistake: "회사채 금리만 올라갔다고 신용위험이 커졌다고 단정하면 안 됩니다. 국채금리와의 차이를 봐야 합니다.",
    related: ["회사채", "국채", "부도 위험"],
    question: "국채금리와 회사채 금리가 모두 올랐지만 신용스프레드는 그대로라면 무엇을 뜻할까요?",
    answer: "기업 고유의 위험이 커졌다기보다 시장 전체 금리 수준이 오른 영향일 가능성이 큽니다."
  }
];
const initialChapter = new URLSearchParams(window.location.search).get("chapter") || "brief";
let swipeStart = null;
let chartRenderState = null;

let state = {
  snapshot: null,
  selectedMarket: "kospi",
  isRefreshing: false,
  activeChapter: initialChapter,
  historyEra: "overview",
  indicatorCategory: "all",
  indicatorQuery: "",
  selectedIndicatorId: "fertility",
  relationshipScenario: "rate-hike",
  relationshipStep: 0,
  glossaryQuery: "",
  glossaryLevel: "all",
  glossaryCategory: "전체",
  glossaryLimit: GLOSSARY_PAGE_SIZE,
  quizMode: "mixed",
  quizQuestions: [],
  quizIndex: 0,
  quizScore: 0,
  quizAnswered: false,
  quizSelected: null,
  quizComplete: false,
  quizMistakes: [],
  openNewsSummaryIds: new Set(),
  newsSummaryResults: new Map()
};

if (elements.chapterProgress && elements.chapterTabs.length) {
  elements.chapterProgress.style.width = `${100 / elements.chapterTabs.length}%`;
}

elements.refreshButton.addEventListener("click", () => refreshSnapshot({ force: true }));
elements.chapterTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveChapter(tab.dataset.chapter));
});
elements.chartCanvasWrap.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
  handleChartPointer(event);
});
elements.chartCanvasWrap.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || event.buttons === 1) {
    handleChartPointer(event);
  }
});
elements.chartCanvasWrap.addEventListener("pointerup", (event) => {
  event.stopPropagation();
});
elements.chartCanvasWrap.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") hideChartTooltip();
});
elements.chartCanvasWrap.addEventListener("pointercancel", (event) => {
  if (event.pointerType === "mouse") hideChartTooltip();
});
document.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" && !elements.chartCanvasWrap.contains(event.target)) {
    hideChartTooltip();
  }
});
elements.historyEraTabs.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-history-era]");
  if (!button) return;
  state.historyEra = button.dataset.historyEra;
  renderHistory(state.snapshot);
  requestAnimationFrame(updateChapterHeight);
});
elements.indicatorCategoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-indicator-category]");
  if (!button) return;
  state.indicatorCategory = button.dataset.indicatorCategory;
  state.indicatorQuery = "";
  elements.indicatorSearch.value = "";
  renderIndicators();
});
elements.indicatorSearch.addEventListener("input", () => {
  state.indicatorQuery = elements.indicatorSearch.value;
  state.indicatorCategory = "all";
  renderIndicators();
});
elements.indicatorList.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-indicator-id]");
  if (!button) return;
  state.selectedIndicatorId = button.dataset.indicatorId;
  renderIndicators();
});
elements.relationshipLab.addEventListener("click", (event) => {
  const scenarioButton = event.target.closest?.("[data-relationship-scenario]");
  if (scenarioButton) {
    state.relationshipScenario = scenarioButton.dataset.relationshipScenario;
    state.relationshipStep = 0;
    renderRelationshipLab(state.snapshot);
    requestAnimationFrame(updateChapterHeight);
    return;
  }
  const stepButton = event.target.closest?.("[data-relationship-step]");
  if (!stepButton) return;
  state.relationshipStep = Number(stepButton.dataset.relationshipStep);
  renderRelationshipLab(state.snapshot);
  requestAnimationFrame(updateChapterHeight);
});
elements.glossarySearch.addEventListener("input", () => {
  state.glossaryQuery = elements.glossarySearch.value;
  state.glossaryLevel = "all";
  state.glossaryCategory = "전체";
  state.glossaryLimit = GLOSSARY_PAGE_SIZE;
  renderGlossary();
});
elements.glossaryLevels.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-glossary-level]");
  if (!button) return;
  state.glossaryLevel = button.dataset.glossaryLevel;
  state.glossaryCategory = "전체";
  state.glossaryLimit = GLOSSARY_PAGE_SIZE;
  renderGlossary();
});
elements.glossaryCategories.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-glossary-category]");
  if (!button) return;
  state.glossaryCategory = button.dataset.glossaryCategory;
  state.glossaryLimit = GLOSSARY_PAGE_SIZE;
  renderGlossary();
});
elements.glossaryLoadMore.addEventListener("click", () => {
  state.glossaryLimit += GLOSSARY_PAGE_SIZE;
  renderGlossary();
});

elements.quizModes.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-quiz-mode]");
  if (!button) return;
  resetQuizSession(button.dataset.quizMode);
});
elements.quizBody.addEventListener("click", (event) => {
  const answerButton = event.target.closest?.("[data-quiz-answer]");
  if (answerButton) {
    handleQuizAnswer(Number(answerButton.dataset.quizAnswer));
    return;
  }
  if (event.target.closest?.("[data-quiz-next]")) {
    advanceQuiz();
    return;
  }
  if (event.target.closest?.("[data-quiz-retry-mistakes]")) {
    retryQuizMistakes();
    return;
  }
  if (event.target.closest?.("[data-quiz-restart]")) {
    resetQuizSession(state.quizMode);
  }
});

document.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  const target = event.target;
  if (
    target instanceof Element &&
    (target.matches("input, textarea, select, [contenteditable='true']") ||
      target.closest(".glossary-categories, .segmented, details"))
  ) {
    return;
  }

  event.preventDefault();
  moveChapter(event.key === "ArrowRight" ? 1 : -1);
});

elements.chapterWindow.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") {
    swipeStart = null;
    return;
  }
  swipeStart = {
    x: event.clientX,
    y: event.clientY
  };
});
elements.chapterWindow.addEventListener("pointerup", (event) => {
  if (!swipeStart) return;
  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
  moveChapter(deltaX < 0 ? 1 : -1);
});
elements.chapterWindow.addEventListener("pointercancel", () => {
  swipeStart = null;
});
window.addEventListener("resize", () => {
  drawChart();
  drawIndicatorTrend();
  updateChapterHeight();
});
document.addEventListener(
  "toggle",
  (event) => {
    if (event.target.closest?.("[data-chapter-panel]")) {
      requestAnimationFrame(updateChapterHeight);
    }
  },
  true
);

if ("ResizeObserver" in window) {
  const chapterResizeObserver = new ResizeObserver((entries) => {
    if (
      entries.some(
        (entry) => entry.target.dataset.chapterPanel === state.activeChapter
      )
    ) {
      requestAnimationFrame(updateChapterHeight);
    }
  });
  elements.chapterPanes.forEach((pane) => chapterResizeObserver.observe(pane));
}

if ("serviceWorker" in navigator) {
  const hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);
  let reloadingForServiceWorker = false;
  navigator.serviceWorker
    .register("/sw.js?v=50")
    .then((registration) => {
      registration.update().catch(() => {});
      setInterval(() => registration.update().catch(() => {}), 5 * 60_000);
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadServiceWorkerController || reloadingForServiceWorker) return;
        reloadingForServiceWorker = true;
        window.location.reload();
      });
    })
    .catch(() => {});
}

renderIndicators();
setActiveChapter(state.activeChapter, { skipAnimation: true });
refreshSnapshot();
setInterval(() => refreshSnapshot(), 60_000);

async function refreshSnapshot({ force = false } = {}) {
  if (state.isRefreshing && !force) return;
  state.isRefreshing = true;
  setConnection("loading", "업데이트");

  try {
    const snapshot = await fetchSnapshotWithRetry({ attempts: state.snapshot ? 1 : 2 });
    state.snapshot = snapshot;
    if (!snapshot.markets.some((market) => market.id === state.selectedMarket)) {
      state.selectedMarket = snapshot.markets[0]?.id || "kospi";
    }
    render(snapshot);
    updateConnectionStatus(snapshot);
  } catch {
    if (state.snapshot) {
      const snapshot = {
        ...state.snapshot,
        markets: state.snapshot.markets.map((market) => ({
          ...market,
          live: false,
          status: "stale"
        }))
      };
      state.snapshot = snapshot;
      render(snapshot);
      setConnection("stale", "이전 데이터");
    } else {
      renderDataUnavailable();
      setConnection("error", "데이터 없음");
    }
  } finally {
    state.isRefreshing = false;
  }
}

async function fetchSnapshotWithRetry({ attempts = 1 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`/api/snapshot?ts=${Date.now()}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(22_000)
      });
      if (!response.ok) throw new Error(`Snapshot failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        setConnection("loading", "서버 준비 중");
        await new Promise((resolve) => setTimeout(resolve, 1_500));
      }
    }
  }

  throw lastError;
}

function render(snapshot) {
  renderSummary(snapshot);
  renderBriefBoard(snapshot);
  renderMarkets(snapshot.markets);
  renderTabs(snapshot.markets);
  renderMarketBrief(snapshot.markets);
  renderMarketBoard(snapshot.markets);
  renderMarketConnections(snapshot.markets, snapshot.analysis);
  renderAnalysis(snapshot.analysis);
  renderMacro(snapshot.macro, snapshot.analysis);
  renderIndicators();
  renderStudy(snapshot);
  renderHistory(snapshot);
  renderGlossary();
  renderQuiz();
  renderNews(snapshot.headlines, snapshot.analysis, snapshot.dataQuality);
  drawChart();
  setActiveChapter(state.activeChapter, { skipAnimation: true });
}

function renderSummary(snapshot) {
  const { analysis } = snapshot;
  elements.regimeTitle.textContent = analysis.regime;
  elements.pulseText.textContent = analysis.pulse;
  const latestMarketAt = getLatestMarketTimestamp(snapshot);
  elements.updatedAt.textContent = latestMarketAt
    ? marketTimeFormatter.format(latestMarketAt)
    : "기준시각 없음";
  elements.updatedAt.dateTime = latestMarketAt ? latestMarketAt.toISOString() : "";
  const quality = snapshot.dataQuality;
  const marketCount = quality
    ? `${quality.availableMarketCount}/${quality.requestedMarketCount}개 시장지표`
    : `${snapshot.markets.length}개 시장지표`;
  elements.sourceLine.textContent = `${marketCount} 기준 · 확인 ${timeFormatter.format(new Date(snapshot.generatedAt))}`;
  elements.riskScore.textContent = analysis.riskScore;
  const summaryTone = analysis.riskScore >= 66 ? "negative" : analysis.riskScore >= 45 ? "watch" : "positive";
  elements.regimeTitle.closest(".signal-panel").dataset.tone = summaryTone;
  elements.riskScore.closest(".risk-panel").dataset.tone = summaryTone;
  elements.riskScore.classList.remove("is-updated");
  void elements.riskScore.offsetWidth;
  elements.riskScore.classList.add("is-updated");

  const circumference = 314;
  const offset = circumference - (circumference * analysis.riskScore) / 100;
  elements.riskMeter.style.strokeDashoffset = offset;
  elements.riskMeter.style.stroke = riskColor(analysis.riskScore);

  elements.watchChips.replaceChildren(
    ...analysis.koreaWatch.map((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.dataset.mood = item.mood;
      chip.textContent = `${item.label}: ${item.state}`;
      return chip;
    })
  );

  elements.riskDrivers.replaceChildren(
    ...(analysis.riskDrivers || []).map((driver) => {
      const item = document.createElement("span");
      item.className = "risk-driver";
      item.textContent = `${driver.label}: ${driver.impact}`;
      item.title = driver.detail;
      return item;
    })
  );

  const activeRiskLevel =
    riskLevels.find((level) => analysis.riskScore >= level.min && analysis.riskScore <= level.max) ||
    riskLevels[0];
  const activeRiskNote = document.createElement("div");
  activeRiskNote.className = "risk-active-note";
  activeRiskNote.innerHTML = `
    <strong>${activeRiskLevel.min}~${activeRiskLevel.max} · ${activeRiskLevel.label}</strong>
    <span>${activeRiskLevel.detail}</span>
  `;

  elements.riskLegend.replaceChildren(
    activeRiskNote,
    ...riskLevels.map((level) => {
      const item = document.createElement("div");
      const isActive = analysis.riskScore >= level.min && analysis.riskScore <= level.max;
      item.className = "risk-level";
      item.dataset.tone = level.tone;
      item.dataset.active = String(isActive);
      item.innerHTML = `
        <strong>${level.min}~${level.max}</strong>
        <span>${level.label}</span>
        <em>${level.detail}</em>
      `;
      return item;
    })
  );
}

function renderBriefBoard(snapshot) {
  const { analysis, markets } = snapshot;
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const selected = markets.find((market) => market.id === state.selectedMarket) || markets[0];
  const globalLeaders = [...markets]
    .filter((market) => market.group !== "korea")
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 2);
  const koreaWatch = analysis.koreaWatch || [];
  const bullets = analysis.bullets || [];
  const risingCount = markets.filter((market) => market.changePercent > 0).length;
  const fallingCount = markets.length - risingCount;
  const vix = byId.vix;
  const usdkrw = byId.usdkrw;
  const wti = byId.wti;
  const tone = analysis.riskScore >= 66 ? "negative" : analysis.riskScore >= 45 ? "watch" : "positive";
  const decisionMode = analysis.riskScore >= 66 ? "방어 먼저" : analysis.riskScore >= 45 ? "확인 먼저" : "회복 확인";
  const selectedTone = selected?.changePercent >= 0 ? "positive" : "negative";
  const globalCopy = globalLeaders.map((market) => `${market.name} ${signed(market.changePercent)}%`).join(" · ");
  const koreaCopy = koreaWatch.map((item) => `${item.label} ${item.state}`).slice(0, 3).join(" · ");

  elements.briefBoard.innerHTML = `
    <div class="brief-command-grid">
      <article class="brief-thesis" data-tone="${tone}">
        <header>
          <span>오늘의 경제 판단</span>
          <em>위험 온도 <strong>${analysis.riskScore}</strong>/100</em>
        </header>
        <h3>${escapeHtml(analysis.regime)}</h3>
        <p>${escapeHtml(analysis.pulse)}</p>
        <footer>
          <div>
            <span>지금의 우선순위</span>
            <strong>${decisionMode}</strong>
          </div>
          <button type="button" data-open-chapter="analysis">심층 분석 <span aria-hidden="true">→</span></button>
        </footer>
      </article>
      <div class="brief-metric-stack">
        <article class="brief-metric" data-tone="${selectedTone}">
          <span>핵심 가격</span>
          <div>
            <strong>${selected ? `${escapeHtml(selected.name)} ${formatMarketValue(selected)}` : "--"}</strong>
            <em>${selected ? `${signed(selected.changePercent)}%` : "확인 중"}</em>
          </div>
          <p>현재 시장 차트의 기준 지표</p>
        </article>
        <article class="brief-metric" data-tone="neutral">
          <span>글로벌 움직임</span>
          <strong>${escapeHtml(globalLeaders.map((market) => market.name).join(" · ") || "확인 중")}</strong>
          <p>${escapeHtml(globalCopy || "글로벌 가격 신호를 정리하고 있습니다.")}</p>
        </article>
        <article class="brief-metric" data-tone="watch">
          <span>한국 체크</span>
          <strong>${escapeHtml(koreaWatch.map((item) => item.state).slice(0, 3).join(" · ") || "확인 중")}</strong>
          <p>${escapeHtml(koreaCopy || "환율, 수출, 중국 변수를 같이 봅니다.")}</p>
        </article>
      </div>
    </div>
    <section class="decision-ribbon" aria-label="오늘의 판단 순서">
      <div>
        <p class="section-kicker">판단 순서</p>
        <strong>${decisionMode}</strong>
      </div>
      <ol>
        ${(bullets.length ? bullets : ["시장 가격 방향 확인", "한국 변수 교차 확인", "뉴스 원문으로 이유 확인"])
          .slice(0, 3)
          .map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`)
          .join("")}
      </ol>
    </section>
    <div class="board-heading board-heading-spaced">
      <div>
        <p class="section-kicker">빠른 판단표</p>
        <h3>숫자를 읽는 순서</h3>
      </div>
      <span>상승 ${risingCount} · 하락 ${fallingCount}</span>
    </div>
    <div class="signal-table" role="table" aria-label="오늘의 핵심 신호">
      ${renderSignalRow("시장 폭", `${risingCount}/${markets.length} 상승`, risingCount >= fallingCount ? "위험선호 우세" : "방어 우세", risingCount >= fallingCount ? "positive" : "negative")}
      ${renderSignalRow("원/달러", usdkrw ? `${formatMarketValue(usdkrw)} · ${signed(usdkrw.changePercent)}%` : "--", usdkrw?.value > 1380 ? "한국 자산 부담" : "부담 제한", usdkrw?.value > 1380 ? "negative" : "neutral")}
      ${renderSignalRow("변동성", vix ? `${formatMarketValue(vix)} · ${signed(vix.changePercent)}%` : "--", vix?.value > 20 ? "경계 확대" : "극단 공포 아님", vix?.value > 20 ? "negative" : "positive")}
      ${renderSignalRow("에너지", wti ? `${formatMarketValue(wti)} · ${signed(wti.changePercent)}%` : "--", Math.abs(wti?.changePercent || 0) > 2 ? "물가·비용 민감" : "영향 제한", Math.abs(wti?.changePercent || 0) > 2 ? "watch" : "neutral")}
      ${renderSignalRow("종합", `${analysis.riskScore}/100`, decisionMode, tone)}
    </div>
  `;

  elements.briefBoard.querySelector("[data-open-chapter='analysis']")?.addEventListener("click", () => {
    setActiveChapter("analysis");
  });
}

function renderMarkets(markets) {
  elements.marketStrip.replaceChildren(
    ...markets.map((market) => {
      const button = document.createElement("button");
      const reason = getMarketReason(market);
      const directionLabel = market.direction === "up" ? "상승" : "하락";
      const statusLabel = getMarketStatusLabel(market);
      const basisLabel = market.asOf ? marketTimeFormatter.format(new Date(market.asOf)) : "기준시각 없음";
      button.type = "button";
      button.className = "ticker-item";
      button.dataset.direction = market.direction === "up" ? "up" : "down";
      button.dataset.live = String(Boolean(market.live));
      button.dataset.status = market.status || (market.live ? "live" : "closed");
      button.title = `${statusLabel} · ${basisLabel} · ${reason.title}: ${reason.detail}`;
      button.setAttribute(
        "aria-label",
        `${market.name} ${formatMarketValue(market)}, ${directionLabel} ${signed(
          market.changePercent
        )}퍼센트, ${statusLabel}, ${basisLabel} 기준. 자세한 시장 차트로 이동`
      );
      button.innerHTML = `
        <span class="ticker-name">${market.name}<em>${statusLabel}</em></span>
        <strong class="ticker-value">${formatMarketValue(market)}</strong>
        <canvas class="ticker-sparkline" width="76" height="30" aria-hidden="true"></canvas>
        <span class="ticker-change">
          <span aria-hidden="true">${market.direction === "up" ? "▲" : "▼"}</span>
          ${signed(market.changePercent)}%
        </span>
        <span class="ticker-live">${statusLabel}</span>
      `;
      drawTickerSparkline(button.querySelector(".ticker-sparkline"), market);
      button.addEventListener("click", () => {
        state.selectedMarket = market.id;
        renderTabs(state.snapshot.markets);
        renderMarketBrief(state.snapshot.markets);
        renderMarketBoard(state.snapshot.markets);
        renderMarketConnections(state.snapshot.markets, state.snapshot.analysis);
        drawChart();
        setActiveChapter("markets");
      });
      return button;
    })
  );
}

function drawTickerSparkline(canvas, market) {
  const values = (market?.series || [])
    .slice(-20)
    .map((point) => Number(point.value))
    .filter(Number.isFinite);
  if (!canvas || values.length < 2) return;

  const width = 76;
  const height = 30;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = values.map((value, index) => ({
    x: 2 + (index / (values.length - 1)) * (width - 4),
    y: 3 + ((maximum - value) / range) * (height - 7)
  }));
  const color = market.direction === "up" ? "#65d777" : "#fb7185";

  context.beginPath();
  context.moveTo(points[0].x, height - 2);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.lineTo(points.at(-1).x, height - 2);
  context.closePath();
  context.fillStyle = market.direction === "up" ? "rgba(101, 215, 119, 0.10)" : "rgba(251, 113, 133, 0.10)";
  context.fill();

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.strokeStyle = color;
  context.lineWidth = 1.6;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();

  const last = points.at(-1);
  context.beginPath();
  context.arc(last.x, last.y, 2.2, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

function setActiveChapter(chapter, { skipAnimation = false } = {}) {
  const chapters = getChapterOrder();
  const nextChapter = chapters.includes(chapter) ? chapter : "brief";
  const index = Math.max(0, chapters.indexOf(nextChapter));
  state.activeChapter = nextChapter;

  elements.chapterTabs.forEach((tab) => {
    const isSelected = tab.dataset.chapter === nextChapter;
    tab.setAttribute("aria-selected", String(isSelected));
  });

  elements.chapterPanes.forEach((pane) => {
    const isActive = pane.dataset.chapterPanel === nextChapter;
    pane.setAttribute("aria-hidden", String(!isActive));
    pane.inert = !isActive;
  });

  if (skipAnimation) {
    elements.chapterTrack.style.transition = "none";
    elements.chapterTrack.style.transform = `translateX(-${index * 100}%)`;
    requestAnimationFrame(() => {
      elements.chapterTrack.style.transition = "";
      updateChapterHeight();
    });
  } else {
    elements.chapterTrack.style.transform = `translateX(-${index * 100}%)`;
    requestAnimationFrame(updateChapterHeight);
  }

  if (elements.chapterProgress) {
    elements.chapterProgress.style.transform = `translateX(${index * 100}%)`;
  }

  if (!skipAnimation) {
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", nextChapter);
    history.replaceState(null, "", url);
  }

  if (nextChapter === "markets") {
    requestAnimationFrame(drawChart);
  }
  if (nextChapter === "indicators") {
    requestAnimationFrame(drawIndicatorTrend);
  }
}

function moveChapter(direction) {
  const chapters = getChapterOrder();
  const currentIndex = Math.max(0, chapters.indexOf(state.activeChapter));
  const nextIndex = Math.min(chapters.length - 1, Math.max(0, currentIndex + direction));
  if (nextIndex === currentIndex) return;
  setActiveChapter(chapters[nextIndex]);
}

function getChapterOrder() {
  return [...elements.chapterTabs].map((tab) => tab.dataset.chapter);
}

function updateChapterHeight() {
  const activePane = [...elements.chapterPanes].find(
    (pane) => pane.dataset.chapterPanel === state.activeChapter
  );
  if (!activePane || !elements.chapterWindow) return;
  elements.chapterWindow.style.height = `${Math.ceil(activePane.getBoundingClientRect().height)}px`;
}

function renderTabs(markets) {
  elements.chartTabs.replaceChildren(
    ...markets.slice(0, 6).map((market) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "segment-button";
      button.role = "tab";
      button.textContent = market.name;
      button.setAttribute("aria-selected", String(market.id === state.selectedMarket));
      button.addEventListener("click", () => {
        state.selectedMarket = market.id;
        renderTabs(state.snapshot.markets);
        renderMarketBrief(state.snapshot.markets);
        renderMarketBoard(state.snapshot.markets);
        renderMarketConnections(state.snapshot.markets, state.snapshot.analysis);
        drawChart();
      });
      return button;
    })
  );
}

function renderMarketBrief(markets) {
  const selected =
    markets.find((item) => item.id === state.selectedMarket) ||
    markets[0];
  if (!selected) {
    elements.marketBrief.replaceChildren();
    return;
  }

  const sorted = [...markets].sort((a, b) => b.changePercent - a.changePercent);
  const strongest = sorted[0];
  const weakest = sorted.at(-1);
  const reason = getMarketReason(selected);

  elements.marketBrief.innerHTML = `
    <article class="brief-card brief-card-main">
      <span>선택 지표</span>
      <strong>${selected.name} ${formatMarketValue(selected)}</strong>
      <p>${reason.detail}</p>
    </article>
    <article class="brief-card">
      <span>강한 쪽</span>
      <strong>${strongest.name}</strong>
      <p class="${strongest.direction === "up" ? "up" : "down"}">${signed(strongest.changePercent)}% 움직임</p>
    </article>
    <article class="brief-card">
      <span>약한 쪽</span>
      <strong>${weakest.name}</strong>
      <p class="${weakest.direction === "up" ? "up" : "down"}">${signed(weakest.changePercent)}% 움직임</p>
    </article>
    <article class="brief-card">
      <span>시장 해석</span>
      <strong>${reason.title}</strong>
      <p>${selected.group === "korea" ? "한국 시장 민감도를 먼저 봅니다." : "글로벌 자금 흐름과 연결해 봅니다."}</p>
    </article>
  `;
}

function renderMarketBoard(markets) {
  elements.marketBoard.innerHTML = `
    <div class="board-heading">
      <div>
        <p class="section-kicker">시장 전체</p>
        <h3>지표별 의미</h3>
      </div>
      <span>${markets.length}개 지표</span>
    </div>
    <div class="market-card-grid">
      ${markets
        .map((market) => {
          const reason = getMarketReason(market);
          const isSelected = market.id === state.selectedMarket;
          return `
            <button class="market-mini-card" type="button" data-market-id="${market.id}" aria-pressed="${isSelected}">
              <span>${market.group === "korea" ? "한국" : "글로벌"}</span>
              <strong>${market.name}</strong>
              <em class="${market.direction === "up" ? "up" : "down"}">${formatMarketValue(market)} · ${signed(market.changePercent)}%</em>
              <p>${reason.title}</p>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  elements.marketBoard.querySelectorAll("[data-market-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMarket = button.dataset.marketId;
      renderTabs(state.snapshot.markets);
      renderMarketBrief(state.snapshot.markets);
      renderMarketBoard(state.snapshot.markets);
      renderMarketConnections(state.snapshot.markets, state.snapshot.analysis);
      drawChart();
      updateChapterHeight();
    });
  });
}

function renderMarketConnections(markets, analysis) {
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const selected = byId[state.selectedMarket] || markets[0];
  const kospi = byId.kospi;
  const sp500 = byId.sp500;
  const nasdaq = byId.nasdaq;
  const usdkrw = byId.usdkrw;
  const vix = byId.vix;
  const wti = byId.wti;
  const sorted = [...markets].sort((a, b) => b.changePercent - a.changePercent);
  const koreaGap = (kospi?.changePercent || 0) - (sp500?.changePercent || 0);
  const techTone = ((nasdaq?.changePercent || 0) + (sp500?.changePercent || 0)) / 2;

  elements.marketConnections.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">교차 시장 분석</p>
          <h3>숫자들이 서로 말해주는 것</h3>
        </div>
        <span>${selected?.name || "시장"} 기준</span>
      </div>
      <div class="relationship-grid">
        <article class="relationship-card">
          <span>미국 위험선호</span>
          <strong>${techTone >= 0 ? "주식 선호" : "방어 선호"}</strong>
          <p>S&amp;P 500 ${signed(sp500?.changePercent || 0)}%, NASDAQ ${signed(nasdaq?.changePercent || 0)}%를 함께 본 결과입니다.</p>
        </article>
        <article class="relationship-card">
          <span>한국 상대 흐름</span>
          <strong>${koreaGap >= 0 ? "미국 대비 강함" : "미국 대비 약함"}</strong>
          <p>KOSPI와 S&amp;P 500의 등락률 차이는 ${signed(koreaGap)}%p입니다. 환율과 외국인 수급이 차이를 만들 수 있습니다.</p>
        </article>
        <article class="relationship-card">
          <span>환율·변동성</span>
          <strong>${usdkrw?.value > 1380 || vix?.value > 20 ? "경계 조합" : "혼합 신호"}</strong>
          <p>원/달러 ${formatMarketValue(usdkrw)}, VIX ${formatMarketValue(vix)}입니다. 둘이 함께 오르면 한국 시장 부담이 커집니다.</p>
        </article>
        <article class="relationship-card">
          <span>원가 압력</span>
          <strong>${Math.abs(wti?.changePercent || 0) > 2 ? "민감도 높음" : "제한적"}</strong>
          <p>WTI ${signed(wti?.changePercent || 0)}%는 운송·화학·항공과 물가 기대에 먼저 반영될 수 있습니다.</p>
        </article>
      </div>
      <div class="ranking-panel">
        <div>
          <span>상승 순위</span>
          <strong>${sorted.slice(0, 3).map((market) => `${market.name} ${signed(market.changePercent)}%`).join(" · ")}</strong>
        </div>
        <div>
          <span>위험 해석</span>
          <strong>${analysis.riskScore}/100 · ${analysis.regime}</strong>
        </div>
      </div>
    </section>
  `;
}

function renderEconomicQuote(analysis) {
  if (!elements.analysisQuote) return;

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const quoteIndex = dateKey.split("-").reduce((total, value) => total + Number(value), 0) % ECONOMIC_QUOTES.length;
  const quote = ECONOMIC_QUOTES[quoteIndex];
  const marketApplication =
    analysis.riskScore >= 66
      ? "지금은 기대수익보다 손실을 키울 수 있는 환율과 변동성부터 확인할 구간입니다."
      : analysis.riskScore >= 45
        ? "지금은 방향을 예측하기보다 판단을 바꿀 확인 신호를 기다릴 구간입니다."
        : "지금은 회복 신호를 보되 가격 상승과 실제 가치 개선을 구분할 구간입니다.";

  elements.analysisQuote.innerHTML = `
    <span class="quote-label">오늘의 경제 명언</span>
    <blockquote>${quote.text}</blockquote>
    <div class="quote-meta">
      <cite>${quote.author}</cite>
      <p><strong>오늘의 적용</strong> ${quote.lesson} ${marketApplication}</p>
    </div>
  `;
}

function renderAnalysis(analysis) {
  const dailyFlow = analysis.dailyFlow || buildDailyFlowFallback(analysis);
  const chapters = dailyFlow.chapters || buildChapterFallback(analysis, dailyFlow);
  const detailedSections = dailyFlow.detailedSections || buildDetailedFallback(dailyFlow);
  const reasonCards = analysis.reasonCards || [];
  const transmissionPath = dailyFlow.transmissionPath || [
    { label: "01 글로벌", title: "주가와 변동성", body: "미국 주가와 VIX가 같은 방향인지 확인합니다." },
    { label: "02 환율", title: "달러와 원화", body: "달러 움직임이 원/달러 환율에 전달되는지 봅니다." },
    { label: "03 수급", title: "외국인과 KOSPI", body: "환율 부담이 국내 수급을 흔드는지 확인합니다." },
    { label: "04 실물", title: "수출과 기업 이익", body: "가격 신호가 수출과 이익 전망까지 이어지는지 봅니다." }
  ];
  const counterSignals = dailyFlow.counterSignals || [
    "주가와 환율이 서로 다른 방향이면 한쪽 신호만으로 결론을 내리지 않습니다.",
    "하루 반등보다 환율·변동성·수급이 며칠 같은 방향으로 이어지는지 확인합니다."
  ];
  const verdictTone = analysis.riskScore >= 66 ? "negative" : analysis.riskScore >= 45 ? "watch" : "positive";

  renderEconomicQuote(analysis);

  const chapterItem = document.createElement("li");
  chapterItem.className = "chapter-summary";
  chapterItem.innerHTML = `
    <section>
      <div class="analysis-part-heading">
        <p class="article-label">Part 1</p>
        <h3>챕터 요약</h3>
        <span>결론과 근거를 먼저 확인</span>
      </div>
      <div class="chapter-grid">
        ${chapters
          .map(
            (chapter) => `
              <article class="chapter-card">
                <span>${chapter.label}</span>
                <strong>${chapter.title}</strong>
                <p>${chapter.summary}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;

  const articleItem = document.createElement("li");
  articleItem.className = "analysis-article";
  articleItem.innerHTML = `
    <section>
      <div class="analysis-part-heading">
        <p class="article-label">Part 2</p>
        <h3>심층 분석</h3>
        <span>가격 신호가 한국 경제로 전달되는 과정</span>
      </div>
      <article class="deep-analysis">
        <div class="analysis-verdict" data-tone="${verdictTone}">
          <span>오늘의 판단</span>
          <strong>${dailyFlow.verdict || dailyFlow.title}</strong>
          <em>위험 온도 ${analysis.riskScore}/100</em>
        </div>
        <h4>${dailyFlow.title}</h4>
        <p class="article-lead">${dailyFlow.lead}</p>
        <section class="transmission-block" aria-label="경제 전파 경로">
          <div class="transmission-heading">
            <span>경제 전파 경로</span>
            <p>각 신호가 다음 단계로 실제 이어지는지 확인합니다.</p>
          </div>
          <ol class="transmission-path">
            ${transmissionPath
              .map(
                (item) => `
                  <li>
                    <span>${item.label}</span>
                    <strong>${item.title}</strong>
                    <p>${item.body}</p>
                  </li>
                `
              )
              .join("")}
          </ol>
        </section>
        <details class="daily-brief">
          <summary>세부 근거와 반대 신호 보기</summary>
          <div class="daily-brief-body">
            <div class="deep-section-list">
              ${detailedSections
                .map(
                  (section) => `
                    <section class="deep-section">
                      <h5>${section.title}</h5>
                      <p>${section.body}</p>
                    </section>
                  `
                )
                .join("")}
            </div>
            <aside class="counter-signal-block">
              <strong>이 해석과 반대되는 신호</strong>
              ${counterSignals.map((item) => `<p>${item}</p>`).join("")}
            </aside>
            <p class="article-conclusion">${dailyFlow.conclusion}</p>
          </div>
        </details>
      </article>
    </section>
  `;

  const reasonItem = document.createElement("li");
  reasonItem.className = "analysis-reasons";
  reasonItem.innerHTML = `
    <section>
      <div class="analysis-part-heading">
        <p class="article-label">Part 3</p>
        <h3>분석 축</h3>
        <span>결론을 만든 변수와 실제 수치</span>
      </div>
      <div class="reason-grid">
        ${reasonCards
          .map(
            (card) => `
              <details class="reason-card">
                <summary>
                  <span>${card.title}</span>
                  <strong>${card.summary}</strong>
                </summary>
                <p>${card.detail}</p>
                <div class="evidence-row">
                  ${(card.evidence || []).map((item) => `<span>${item}</span>`).join("")}
                </div>
              </details>
            `
          )
          .join("")}
      </div>
    </section>
  `;

  const watchItem = document.createElement("li");
  watchItem.className = "watch-note";
  watchItem.innerHTML = `
    <strong>판단이 바뀌는지 확인할 흐름</strong>
    <div class="watch-note-list">
      ${analysis.watchlist.map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;

  elements.analysisList.replaceChildren(chapterItem, articleItem, reasonItem, watchItem);
  renderAnalysisBoard(analysis, dailyFlow, reasonCards);
  renderScenarioMatrix(analysis, dailyFlow);
}
function renderAnalysisBoard(analysis, dailyFlow, reasonCards) {
  const riskMode =
    analysis.riskScore >= 66 ? "방어 시나리오" : analysis.riskScore >= 45 ? "확인 시나리오" : "회복 시나리오";
  const paragraphs = dailyFlow.paragraphs || [];
  const keyNumbers = dailyFlow.keyNumbers || (reasonCards || [])
    .flatMap((card) => card.evidence || [])
    .slice(0, 4)
    .map((value, index) => ({ label: `핵심 근거 ${index + 1}`, value, context: "현재 판단에 반영된 수치" }));
  const upside = dailyFlow.upsideCondition || {
    title: "환율 안정 + 변동성 완화",
    body: "원/달러와 VIX가 함께 낮아지면 한국 시장의 외국인 수급 부담이 줄어듭니다."
  };
  const downside = dailyFlow.downsideCondition || {
    title: "달러 강세 + 유가 상승",
    body: "달러와 에너지 가격이 함께 오르면 물가와 기업 비용 부담이 커질 수 있습니다."
  };
  const invalidation = dailyFlow.invalidation || {
    title: (analysis.watchlist || []).slice(0, 2).join(" · ") || "환율 · 변동성 · 수급",
    body: paragraphs[0] || "가격과 뉴스 신호가 같은 방향으로 이어지는지 확인합니다."
  };

  elements.analysisBoard.innerHTML = `
    <div class="board-heading">
      <div>
        <p class="section-kicker">심층 브리핑</p>
        <h3>결론을 만든 핵심 수치</h3>
      </div>
      <span>${riskMode}</span>
    </div>
    <div class="analysis-evidence-strip">
      ${keyNumbers
        .map(
          (item) => `
            <div class="analysis-evidence-item">
              <span>${item.label}</span>
              <strong>${item.value}</strong>
              <p>${item.context}</p>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="chapter-board-grid">
      <article class="board-card board-card-main">
        <span>기본 판단</span>
        <strong>${dailyFlow.verdict || dailyFlow.title}</strong>
        <p>${dailyFlow.lead}</p>
      </article>
      <article class="board-card">
        <span>좋아지는 조건</span>
        <strong>${upside.title}</strong>
        <p>${upside.body}</p>
      </article>
      <article class="board-card">
        <span>나빠지는 조건</span>
        <strong>${downside.title}</strong>
        <p>${downside.body}</p>
      </article>
      <article class="board-card">
        <span>현재 판단을 바꿀 증거</span>
        <strong>${invalidation.title}</strong>
        <p>${invalidation.body}</p>
      </article>
    </div>
  `;
}
function renderScenarioMatrix(analysis, dailyFlow) {
  const weights =
    analysis.riskScore >= 66
      ? { defense: 55, base: 30, recovery: 15 }
      : analysis.riskScore >= 45
        ? { defense: 25, base: 50, recovery: 25 }
        : { defense: 15, base: 35, recovery: 50 };
  const checkpoints = analysis.watchlist || [];

  elements.scenarioMatrix.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">시나리오 지도</p>
          <h3>어떤 조건에서 해석이 바뀌는가</h3>
        </div>
        <span>예측 아닌 해석 비중</span>
      </div>
      <div class="scenario-grid">
        ${renderScenarioCard("방어", weights.defense, "환율·유가·변동성이 함께 상승", "현금흐름이 안정적인 업종과 방어자산 선호가 강해질 수 있습니다.", "negative")}
        ${renderScenarioCard("기본", weights.base, dailyFlow.title, dailyFlow.lead, "watch")}
        ${renderScenarioCard("회복", weights.recovery, "환율 안정·VIX 하락·주가 반등", "한국 증시에서는 외국인 수급과 반도체 대형주가 회복을 확인해줄 가능성이 큽니다.", "positive")}
      </div>
      <div class="checkpoint-grid">
        ${checkpoints
          .slice(0, 4)
          .map(
            (item, index) => `
              <article>
                <span>체크 ${index + 1}</span>
                <strong>${item}</strong>
              </article>
            `
          )
          .join("")}
      </div>
      <p class="data-caveat">시나리오 비중은 현재 가격 신호를 정리하기 위한 설명값이며 투자 확률이나 수익률 예측이 아닙니다.</p>
    </section>
  `;
}

function renderIndicators() {
  const query = state.indicatorQuery.trim().toLocaleLowerCase("ko-KR");
  const filtered = indicatorDefinitions.filter((indicator) => {
    const categoryMatch = state.indicatorCategory === "all" || indicator.category === state.indicatorCategory;
    const searchable = `${indicator.name} ${indicator.shortName} ${indicator.description} ${getIndicatorCategoryLabel(indicator.category)}`.toLocaleLowerCase("ko-KR");
    return categoryMatch && (!query || searchable.includes(query));
  });

  if (!filtered.some((indicator) => indicator.id === state.selectedIndicatorId)) {
    state.selectedIndicatorId = filtered[0]?.id || state.selectedIndicatorId;
  }

  const fertility = indicatorSnapshot.indicators.fertility?.countries?.KOR;
  const latestYear = Math.max(
    ...indicatorDefinitions.flatMap((indicator) => {
      const countries = indicatorSnapshot.indicators[indicator.id]?.countries || {};
      return Object.values(countries).filter(Boolean).map((item) => item.year);
    })
  );
  const datedCount = indicatorDefinitions.filter((indicator) =>
    indicatorSnapshot.indicators[indicator.id]?.countries?.KOR
  ).length;

  elements.indicatorUpdate.textContent = `WDI ${indicatorSnapshot.dataUpdatedAt.replaceAll("-", ".")} 갱신`;
  elements.indicatorSummary.innerHTML = `
    <div>
      <span>수록 범위</span>
      <strong>${indicatorDefinitions.length}개 지표 · ${indicatorCategories.length - 1}개 분야</strong>
      <p>인구부터 기술, 환경, 분배까지 같은 기준으로 비교합니다.</p>
    </div>
    <div>
      <span>한국 합계출산율</span>
      <strong>${fertility ? formatIndicatorValue(indicatorDefinitions[0], fertility) : "--"}</strong>
      <p>${fertility ? `${fertility.year}년 기준 · 세계 ${formatIndicatorValue(indicatorDefinitions[0], indicatorSnapshot.indicators.fertility.countries.WLD)}` : "기준값 없음"}</p>
    </div>
    <div>
      <span>데이터 기준</span>
      <strong>최신 ${latestYear}년 · 한국 ${datedCount}/${indicatorDefinitions.length}</strong>
      <p>지표마다 공표 시차가 달라 카드에 실제 기준연도를 따로 표시합니다.</p>
    </div>
  `;

  elements.indicatorCategoryTabs.innerHTML = indicatorCategories
    .map((category) => {
      const count = category.id === "all"
        ? indicatorDefinitions.length
        : indicatorDefinitions.filter((indicator) => indicator.category === category.id).length;
      return `
        <button type="button" role="tab" data-indicator-category="${category.id}" aria-selected="${state.indicatorCategory === category.id}">
          ${escapeHtml(category.label)} <span>${count}</span>
        </button>
      `;
    })
    .join("");

  elements.indicatorCount.textContent = `${filtered.length}개 표시`;
  elements.indicatorList.innerHTML = filtered.length
    ? filtered.map(renderIndicatorListItem).join("")
    : `
      <div class="indicator-empty">
        <strong>검색 결과가 없습니다.</strong>
        <p>출산, 고용, 의료, 인터넷처럼 더 짧은 단어로 찾아보세요.</p>
      </div>
    `;

  const selected = indicatorDefinitions.find((indicator) => indicator.id === state.selectedIndicatorId);
  if (!filtered.length || !selected) {
    elements.indicatorDetail.innerHTML = `
      <div class="indicator-detail-empty">
        <span>지표 선택</span>
        <strong>왼쪽 목록에서 확인할 지표를 선택하세요.</strong>
      </div>
    `;
    return;
  }

  renderIndicatorDetail(selected);
  requestAnimationFrame(() => {
    drawIndicatorTrend();
    updateChapterHeight();
  });
}

function renderIndicatorListItem(indicator) {
  const data = indicatorSnapshot.indicators[indicator.id];
  const korea = data?.countries?.KOR;
  const delta = korea?.previous ? korea.value - korea.previous.value : null;
  const isSelected = indicator.id === state.selectedIndicatorId;
  return `
    <button class="indicator-list-item" type="button" data-indicator-id="${indicator.id}" aria-pressed="${isSelected}">
      <span class="indicator-list-meta">
        <em>${escapeHtml(getIndicatorCategoryLabel(indicator.category))}</em>
        <i>${korea ? `${korea.year}년` : "자료 없음"}</i>
      </span>
      <strong>${escapeHtml(indicator.name)}</strong>
      <span class="indicator-list-value">
        <b>${korea ? formatIndicatorValue(indicator, korea) : "--"}</b>
        <small>${delta == null ? "직전값 없음" : `직전 ${formatIndicatorDelta(indicator, delta)}`}</small>
      </span>
      <p>${escapeHtml(indicator.description)}</p>
    </button>
  `;
}

function renderIndicatorDetail(indicator) {
  const data = indicatorSnapshot.indicators[indicator.id];
  const countryData = indicatorCountries
    .map((country) => ({ ...country, observation: data?.countries?.[country.id] }))
    .filter((country) => country.observation);
  const korea = data?.countries?.KOR;
  const world = data?.countries?.WLD;
  const values = countryData.map((country) => country.observation.value);
  const scaleMin = Math.min(0, ...values);
  const scaleMax = Math.max(0, ...values);
  const range = scaleMax - scaleMin || 1;
  const zeroPosition = ((0 - scaleMin) / range) * 100;
  const comparison = buildIndicatorComparison(indicator, korea, world);
  const trend = data?.koreaTrend || [];
  const first = trend[0];
  const last = trend.at(-1);
  const trendDelta = first && last ? last.value - first.value : null;

  elements.indicatorDetail.innerHTML = `
    <header class="indicator-detail-head">
      <div>
        <p class="section-kicker">${escapeHtml(getIndicatorCategoryLabel(indicator.category))} · ${escapeHtml(indicator.code)}</p>
        <h3>${escapeHtml(indicator.name)}</h3>
        <p>${escapeHtml(indicator.description)}</p>
      </div>
      <div class="indicator-primary-value">
        <span>한국 ${korea ? `${korea.year}년` : "기준 없음"}</span>
        <strong>${korea ? formatIndicatorValue(indicator, korea) : "--"}</strong>
        <em>${korea?.previous ? `직전 공표 ${formatIndicatorDelta(indicator, korea.value - korea.previous.value)}` : "직전 공표 없음"}</em>
      </div>
    </header>
    <div class="indicator-comparison-note">
      <span>세계와 비교</span>
      <strong>${escapeHtml(comparison.title)}</strong>
      <p>${escapeHtml(comparison.detail)}</p>
    </div>
    <section class="indicator-country-section">
      <div class="indicator-section-title">
        <div>
          <span>국가 비교</span>
          <strong>같은 지표, 각국 최신 공표값</strong>
        </div>
        <em>연도는 행별 표시</em>
      </div>
      <div class="indicator-country-list">
        ${countryData.map((country) => {
          const valuePosition = ((country.observation.value - scaleMin) / range) * 100;
          const left = Math.min(zeroPosition, valuePosition);
          const width = Math.max(2, Math.abs(valuePosition - zeroPosition));
          return `
            <div class="indicator-country-row" data-country="${country.id}">
              <span>${escapeHtml(country.label)}</span>
              <div class="indicator-country-track" ${scaleMin < 0 ? `data-has-zero="true" style="--zero:${zeroPosition}%"` : ""}>
                <i style="left:${left}%;width:${width}%"></i>
              </div>
              <strong>${formatIndicatorValue(indicator, country.observation)}</strong>
              <em>${country.observation.year}</em>
            </div>
          `;
        }).join("")}
      </div>
    </section>
    <section class="indicator-trend-section">
      <div class="indicator-section-title">
        <div>
          <span>한국 추세</span>
          <strong>${first && last ? `${first.year}~${last.year}년` : "자료 없음"}</strong>
        </div>
        <em>${trendDelta == null ? "변화 계산 불가" : `기간 변화 ${formatIndicatorDelta(indicator, trendDelta)}`}</em>
      </div>
      <div class="indicator-trend-frame">
        <canvas id="indicatorTrendCanvas" width="760" height="220" aria-label="${escapeHtml(indicator.name)} 한국 추세 차트"></canvas>
      </div>
    </section>
    <div class="indicator-reading-grid">
      <section>
        <span>이렇게 읽기</span>
        <p>${escapeHtml(indicator.reading)}</p>
      </section>
      <section>
        <span>주의할 점</span>
        <p>${escapeHtml(indicator.caution)}</p>
      </section>
    </div>
    <footer class="indicator-source-row">
      <div>
        <span>출처</span>
        <strong>${escapeHtml(indicator.source)}</strong>
        <em>데이터셋 갱신 ${indicatorSnapshot.dataUpdatedAt.replaceAll("-", ".")}</em>
      </div>
      <a href="${safeNewsUrl(indicator.sourceUrl)}" target="_blank" rel="noopener noreferrer">원자료 보기 <span aria-hidden="true">↗</span></a>
    </footer>
  `;
}

function drawIndicatorTrend() {
  const canvas = document.querySelector("#indicatorTrendCanvas");
  if (!canvas) return;
  const indicator = indicatorDefinitions.find((item) => item.id === state.selectedIndicatorId);
  const series = indicatorSnapshot.indicators[state.selectedIndicatorId]?.koreaTrend || [];
  if (!indicator || series.length < 2) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width || 760);
  const height = Math.max(190, rect.height || 220);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const context = canvas.getContext("2d");
  context.scale(dpr, dpr);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const padding = { top: 24, right: 18, bottom: 34, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = series.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const margin = (rawMax - rawMin || Math.max(1, Math.abs(rawMax))) * 0.12;
  const min = rawMin - margin;
  const max = rawMax + margin;
  const range = max - min || 1;

  context.strokeStyle = "#e2e8eb";
  context.lineWidth = 1;
  context.fillStyle = "#6b7780";
  context.font = "11px Inter, system-ui, sans-serif";
  context.textAlign = "right";
  for (let index = 0; index < 4; index += 1) {
    const y = padding.top + (plotHeight / 3) * index;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    const label = max - (range / 3) * index;
    context.fillText(formatIndicatorNumber(indicator, label), padding.left - 8, y + 4);
  }

  const points = series.map((point, index) => ({
    x: padding.left + (index / (series.length - 1)) * plotWidth,
    y: padding.top + plotHeight - ((point.value - min) / range) * plotHeight
  }));
  const area = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  area.addColorStop(0, "rgba(15, 118, 110, 0.17)");
  area.addColorStop(1, "rgba(15, 118, 110, 0)");
  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.lineTo(points.at(-1).x, height - padding.bottom);
  context.lineTo(points[0].x, height - padding.bottom);
  context.closePath();
  context.fillStyle = area;
  context.fill();

  context.beginPath();
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  context.strokeStyle = "#0f766e";
  context.lineWidth = 2.5;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();
  const lastPoint = points.at(-1);
  context.beginPath();
  context.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
  context.fillStyle = "#c28b24";
  context.fill();

  context.fillStyle = "#65717d";
  context.font = "11px Inter, system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText(String(series[0].year), padding.left, height - 11);
  context.textAlign = "right";
  context.fillText(String(series.at(-1).year), width - padding.right, height - 11);
}

function buildIndicatorComparison(indicator, korea, world) {
  if (!korea || !world) {
    return {
      title: "비교 가능한 세계 집계값이 없습니다.",
      detail: "국가마다 조사 시점이 다른 지표는 각 행의 기준연도를 먼저 확인하세요."
    };
  }
  const difference = korea.value - world.value;
  const direction = Math.abs(difference) < 10 ** -indicator.precision ? "비슷함" : difference > 0 ? "높음" : "낮음";
  return {
    title: `한국이 세계보다 ${formatIndicatorMagnitude(indicator, Math.abs(difference))} ${direction}`,
    detail: `한국 ${korea.year}년 ${formatIndicatorValue(indicator, korea)}, 세계 ${world.year}년 ${formatIndicatorValue(indicator, world)}입니다. 기준연도가 다르면 방향만 참고하세요.`
  };
}

function formatIndicatorValue(indicator, observation) {
  const value = typeof observation === "number" ? observation : observation?.value;
  if (!Number.isFinite(value)) return "--";
  const formatted = formatIndicatorNumber(indicator, value);
  if (indicator.format === "currency") return `$${formatted}`;
  if (indicator.unit === "%") return `${formatted}%`;
  return `${formatted} ${indicator.unit}`;
}

function formatIndicatorNumber(indicator, value) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: indicator.precision,
    maximumFractionDigits: indicator.precision
  }).format(value);
}

function formatIndicatorDelta(indicator, value) {
  const sign = value > 0 ? "+" : "";
  if (indicator.format === "currency") return `${sign}$${formatIndicatorNumber(indicator, value)}`;
  const suffix = indicator.unit === "%" ? "%p" : indicator.unit;
  return `${sign}${formatIndicatorNumber(indicator, value)} ${suffix}`;
}

function formatIndicatorMagnitude(indicator, value) {
  if (indicator.format === "currency") return `$${formatIndicatorNumber(indicator, value)}`;
  const suffix = indicator.unit === "%" ? "%p" : indicator.unit;
  return `${formatIndicatorNumber(indicator, value)} ${suffix}`;
}

function getIndicatorCategoryLabel(categoryId) {
  return indicatorCategories.find((category) => category.id === categoryId)?.label || "기타";
}

function renderHistory(snapshot) {
  const overviewView = {
    id: "overview",
    label: "큰 흐름",
    period: "1760s-2020s",
    title: "경제사는 충격보다 전달 경로와 정책 대응의 기록입니다",
    summary: "산업혁명부터 팬데믹 이후까지 생산성, 신용, 물가, 환율과 정책이 어떻게 경제 질서를 바꿨는지 핵심 전환점으로 봅니다.",
    question: "사건의 이름보다 충격이 신용·고용·물가·환율로 전달된 순서를 비교합니다."
  };
  const views = [overviewView, ...historyEras];
  const selectedView = views.find((era) => era.id === state.historyEra) || overviewView;
  const visibleEvents = state.historyEra === "overview"
    ? historyEvents.filter((event) => event.featured)
    : historyEvents.filter((event) => event.era === state.historyEra);
  const currentLink = getHistoryCurrentLink(snapshot);

  elements.historyCount.textContent = `${historyEvents.length}개 사건 · ${historyEras.length}개 시대`;
  elements.historyBrief.innerHTML = `
    <article class="history-brief-card">
      <span>기록 범위</span>
      <strong>1760s-2020s</strong>
      <p>산업혁명부터 공급망 재편까지 약 260년의 변화입니다.</p>
    </article>
    <article class="history-brief-card">
      <span>현재 선택</span>
      <strong>${escapeHtml(selectedView.label)} · ${escapeHtml(selectedView.period)}</strong>
      <p>${visibleEvents.length}개 핵심 사건을 시간순으로 봅니다.</p>
    </article>
    <article class="history-brief-card history-brief-current" data-tone="${currentLink.tone}">
      <span>오늘과 연결</span>
      <strong>${escapeHtml(currentLink.title)}</strong>
      <p>${escapeHtml(currentLink.body)}</p>
    </article>
  `;

  elements.historyEraTabs.innerHTML = views
    .map((era) => {
      const count = era.id === "overview"
        ? historyEvents.filter((event) => event.featured).length
        : historyEvents.filter((event) => event.era === era.id).length;
      const isSelected = era.id === selectedView.id;
      return `
        <button
          class="history-era-button"
          type="button"
          role="tab"
          data-history-era="${era.id}"
          aria-selected="${isSelected}"
        >
          <strong>${escapeHtml(era.label)}</strong>
          <span>${escapeHtml(era.period)} · ${count}</span>
        </button>
      `;
    })
    .join("");

  elements.historyOverview.innerHTML = `
    <div>
      <p class="section-kicker">${escapeHtml(selectedView.period)}</p>
      <h3>${escapeHtml(selectedView.title)}</h3>
      <p>${escapeHtml(selectedView.summary)}</p>
    </div>
    <aside>
      <span>핵심 질문</span>
      <strong>${escapeHtml(selectedView.question)}</strong>
    </aside>
  `;

  elements.historyTimeline.innerHTML = `
    <div class="history-section-heading">
      <div>
        <p class="section-kicker">시간의 흐름</p>
        <h3>${escapeHtml(selectedView.label)}의 전환점</h3>
      </div>
      <span>${visibleEvents.length}개 사건</span>
    </div>
    <div class="history-event-list">
      ${visibleEvents.map(renderHistoryEvent).join("")}
    </div>
  `;

  elements.historyPatterns.innerHTML = `
    <div class="history-section-heading history-pattern-heading">
      <div>
        <p class="section-kicker">반복되는 구조</p>
        <h3>경제사의 다섯 패턴</h3>
      </div>
    </div>
    <div class="history-pattern-list">
      ${historyPatterns
        .map(
          (pattern) => `
            <article class="history-pattern-card">
              <span>${escapeHtml(pattern.label)}</span>
              <strong>${escapeHtml(pattern.title)}</strong>
              <div class="history-pattern-steps">
                ${pattern.steps.map((step) => `<em>${escapeHtml(step)}</em>`).join('<i aria-hidden="true">→</i>')}
              </div>
              <p>${escapeHtml(pattern.lesson)}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderHistoryEvent(event) {
  return `
    <details class="history-event">
      <summary>
        <time>${escapeHtml(event.year)}</time>
        <div class="history-event-summary">
          <div class="history-event-tags">
            <span>${escapeHtml(event.region)}</span>
            <em>${escapeHtml(event.category)}</em>
          </div>
          <h4>${escapeHtml(event.title)}</h4>
          <p>${escapeHtml(event.summary)}</p>
        </div>
        <span class="history-event-toggle" aria-hidden="true"></span>
      </summary>
      <div class="history-event-body">
        <section>
          <span>원인</span>
          <p>${escapeHtml(event.cause)}</p>
        </section>
        <section>
          <span>결과</span>
          <p>${escapeHtml(event.result)}</p>
        </section>
        <section>
          <span>오늘의 의미</span>
          <p>${escapeHtml(event.today)}</p>
        </section>
        <div class="history-term-row">
          ${(event.terms || []).map((term) => `<span>${escapeHtml(term)}</span>`).join("")}
        </div>
      </div>
    </details>
  `;
}

function getHistoryCurrentLink(snapshot) {
  const riskScore = snapshot?.analysis?.riskScore ?? 50;
  const usdkrw = snapshot?.markets?.find((market) => market.id === "usdkrw");
  const vix = snapshot?.markets?.find((market) => market.id === "vix");

  if (riskScore >= 66) {
    return {
      tone: "negative",
      title: "위기와 같은지보다 연결 고리를 확인",
      body: `위험 온도 ${riskScore}/100입니다. 과거 위기와 같다고 단정하지 말고 환율·신용·유동성이 함께 악화되는지 비교합니다.`
    };
  }
  if (riskScore >= 45) {
    return {
      tone: "watch",
      title: "엇갈린 신호는 전환기의 특징",
      body: `원/달러 ${usdkrw ? formatMarketValue(usdkrw) : "확인 중"}, VIX ${vix ? formatMarketValue(vix) : "확인 중"}가 같은 방향으로 모이는지 경제사의 전환기와 비교합니다.`
    };
  }
  return {
    tone: "positive",
    title: "회복과 과열을 구분",
    body: `위험 온도 ${riskScore}/100입니다. 생산성과 이익 개선이 자산가격 상승을 실제로 뒷받침하는지 과거 회복기와 비교합니다.`
  };
}
function renderRelationshipLab(snapshot) {
  const scenario = ECONOMIC_RELATIONSHIPS.find((item) => item.id === state.relationshipScenario) || ECONOMIC_RELATIONSHIPS[0];
  const selectedIndex = Math.min(scenario.steps.length - 1, Math.max(0, state.relationshipStep));
  const selectedStep = scenario.steps[selectedIndex];
  const previousStep = selectedIndex > 0 ? scenario.steps[selectedIndex - 1] : null;
  const currentSignal = getRelationshipCurrentSignal(scenario.id, snapshot);
  const stepLabels = ["정책·충격", "1차 반응", "자금·소득", "실물경제", "최종 파급"];

  elements.relationshipLab.innerHTML = `
    <section class="expansion-section relationship-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">경제 연결 지도</p>
          <h3>한 변화가 다른 숫자로 이어지는 과정</h3>
        </div>
        <span>상황과 단계를 눌러보기</span>
      </div>
      <div class="relationship-tabs" role="tablist" aria-label="경제 변화 선택">
        ${ECONOMIC_RELATIONSHIPS.map((item) => `
          <button type="button" role="tab" data-relationship-scenario="${item.id}" aria-selected="${item.id === scenario.id}">
            <span>${escapeHtml(item.category)}</span>
            <strong>${escapeHtml(item.label)}</strong>
          </button>
        `).join("")}
      </div>
      <header class="relationship-intro">
        <div>
          <span>${escapeHtml(scenario.category)}</span>
          <h4>${escapeHtml(scenario.trigger)}</h4>
        </div>
        <p>${escapeHtml(scenario.summary)}</p>
      </header>
      <div class="relationship-chain" aria-label="${escapeHtml(scenario.label)} 전달 경로">
        ${scenario.steps.map((step, index) => `
          <button type="button" class="relationship-step" data-relationship-step="${index}" aria-pressed="${index === selectedIndex}">
            <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(stepLabels[index] || "파급")}</span>
            <strong>${escapeHtml(step.title)}</strong>
          </button>
        `).join("")}
      </div>
      <div class="relationship-step-explainer">
        <div>
          <span>선택한 단계 ${String(selectedIndex + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(selectedStep.title)}</strong>
        </div>
        <p>${escapeHtml(selectedStep.detail)}</p>
        <em>${previousStep ? `${escapeHtml(previousStep.title)}에서 ${escapeHtml(selectedStep.title)}로 전달` : "변화의 출발점"}</em>
      </div>
      <div class="relationship-effects" aria-label="함께 볼 영향">
        <strong>함께 움직일 수 있는 것</strong>
        <div>${scenario.effects.map((effect) => `<span>${escapeHtml(effect)}</span>`).join("")}</div>
      </div>
      <div class="relationship-learning-grid">
        <section class="relationship-current">
          <span>${escapeHtml(currentSignal.label)}</span>
          <strong>${escapeHtml(currentSignal.value)}</strong>
          <p>${escapeHtml(currentSignal.detail)}</p>
        </section>
        <section>
          <span>항상 이렇게 되지는 않음</span>
          <p>${escapeHtml(scenario.exception)}</p>
        </section>
        <section>
          <span>시차</span>
          <p>${escapeHtml(scenario.lag)}</p>
        </section>
      </div>
    </section>
  `;
}

function getRelationshipCurrentSignal(scenarioId, snapshot) {
  const markets = snapshot?.markets || [];
  const macro = snapshot?.macro || [];
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const rate = macro.find((item) => /금리/.test(item.label));
  const cpi = macro.find((item) => /물가/.test(item.label));
  const exports = macro.find((item) => /수출/.test(item.label));
  const credit = macro.find((item) => /신용/.test(item.label));
  const usdkrw = byId.usdkrw;
  const wti = byId.wti;

  const signals = {
    "rate-hike": {
      label: "현재 숫자에 대입",
      value: `기준금리 ${macroValueText(rate)} · 물가 ${macroValueText(cpi)}`,
      detail: "금리가 높아도 물가가 충분히 낮아졌는지, 가계대출과 투자가 실제로 둔화되는지 확인합니다."
    },
    "rate-cut": {
      label: "현재 숫자에 대입",
      value: `기준금리 ${macroValueText(rate)} · 위험 ${snapshot?.analysis?.riskScore ?? "--"}/100`,
      detail: "금리 인하 기대만 보지 말고 인하 이유가 물가 안정인지 경기 급랭인지 구분합니다."
    },
    "oil-up": {
      label: "현재 시장 신호",
      value: wti ? `WTI ${formatMarketValue(wti)} · ${signed(wti.changePercent)}%` : "WTI 확인 중",
      detail: "하루 상승보다 몇 주간 높은 가격이 이어지는지 봐야 기업 비용과 물가 파급을 판단할 수 있습니다."
    },
    "won-weakness": {
      label: "현재 시장 신호",
      value: usdkrw ? `원/달러 ${formatMarketValue(usdkrw)} · ${signed(usdkrw.changePercent)}%` : "환율 확인 중",
      detail: "환율 상승과 외국인 매도, 수입물가 상승이 동시에 나타나는지 교차 확인합니다."
    },
    "fiscal-expansion": {
      label: "현재 판단에 대입",
      value: `위험 온도 ${snapshot?.analysis?.riskScore ?? "--"}/100`,
      detail: "경기가 약할 때의 재정 확대와 이미 물가가 높은 상태의 재정 확대는 결과가 다릅니다."
    },
    "exports-up": {
      label: "현재 한국 지표",
      value: `수출 ${macroValueText(exports)}`,
      detail: "증가율뿐 아니라 수출액, 반도체 비중, 환율 효과와 전년도 기저를 함께 확인합니다."
    },
    "wage-up": {
      label: "현재 판단에 대입",
      value: `물가 ${macroValueText(cpi)}`,
      detail: "명목임금보다 임금상승률에서 물가상승률을 뺀 실질임금이 소비 여력을 더 잘 보여줍니다."
    },
    "home-price-down": {
      label: "현재 한국 지표",
      value: `가계신용 ${macroValueText(credit)}`,
      detail: "가격만 보지 말고 거래량, 연체율, 건설 착공과 가계부채가 함께 악화되는지 확인합니다."
    }
  };
  return signals[scenarioId] || {
    label: "현재 숫자와 연결",
    value: "시장 지표 확인",
    detail: "한 숫자보다 여러 경로가 같은 방향인지 확인합니다."
  };
}

function renderStudy(snapshot) {
  const { analysis, markets } = snapshot;
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const sorted = [...markets].sort((a, b) => b.changePercent - a.changePercent);
  const strongest = sorted[0];
  const weakest = sorted.at(-1);
  const kospi = byId.kospi;
  const sp500 = byId.sp500;
  const usdkrw = byId.usdkrw;
  const vix = byId.vix;
  const koreaGap = (kospi?.changePercent || 0) - (sp500?.changePercent || 0);
  const todayTerm = getDailyEconomicTerm();
  const changeCondition =
    analysis.riskScore >= 66
      ? "원/달러 안정, VIX 하락, KOSPI 낙폭 축소가 함께 나타나는지"
      : analysis.riskScore >= 45
        ? "환율과 미국 증시가 같은 방향으로 안정되는지"
        : "환율 안정과 한국 수출주 강세가 며칠 이어지는지";

  elements.studyBrief.innerHTML = `
    <article class="brief-card brief-card-main">
      <span>오늘 경제를 한 문장으로</span>
      <strong>${analysis.regime} · 위험 온도 ${analysis.riskScore}/100</strong>
      <p>${analysis.pulse} 경제적으로 사고한다는 것은 이 결론을 외우는 것이 아니라 어떤 숫자가 결론을 만들었는지 확인하는 것입니다.</p>
    </article>
    <article class="brief-card">
      <span>가장 강한 가격</span>
      <strong>${strongest.name} ${signed(strongest.changePercent)}%</strong>
      <p>강한 자산이 무엇인지 보면 지금 돈이 향하는 곳을 추정할 수 있습니다.</p>
    </article>
    <article class="brief-card">
      <span>가장 약한 가격</span>
      <strong>${weakest.name} ${signed(weakest.changePercent)}%</strong>
      <p>약한 자산은 시장이 가장 걱정하는 변수와 연결해 해석합니다.</p>
    </article>
    <article class="brief-card">
      <span>한국의 차이</span>
      <strong>미국 대비 ${signed(koreaGap)}%p</strong>
      <p>KOSPI와 S&amp;P 500의 차이가 크면 환율, 외국인 수급과 국내 요인을 따로 봐야 합니다.</p>
    </article>
  `;

  elements.thinkingLab.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">경제적 사고법</p>
          <h3>가격 → 원인 → 파급 → 반증</h3>
        </div>
        <span>4단계 사고 훈련</span>
      </div>
      <div class="thinking-flow">
        ${renderThinkingStep("01", "무엇이 움직였나", `${strongest.name} ${signed(strongest.changePercent)}%, ${weakest.name} ${signed(weakest.changePercent)}%입니다. 먼저 사실과 의견을 분리합니다.`)}
        ${renderThinkingStep("02", "왜 움직였나", `원/달러 ${usdkrw ? formatMarketValue(usdkrw) : "--"}, VIX ${vix ? formatMarketValue(vix) : "--"}와 주요 뉴스를 교차 확인합니다. 한 기사만으로 원인을 단정하지 않습니다.`)}
        ${renderThinkingStep("03", "한국에는 어떻게 오나", `미국 증시 변화가 환율과 외국인 수급을 거쳐 KOSPI에 전달됩니다. 현재 한미 지수 차이는 ${signed(koreaGap)}%p입니다.`)}
        ${renderThinkingStep("04", "무엇이면 생각을 바꾸나", `${changeCondition} 확인합니다. 반대 증거가 나오면 기존 결론을 고칩니다.`)}
      </div>
      <div class="thinking-rule">
        <strong>오늘의 사고 규칙</strong>
        <p>좋은 뉴스인지 나쁜 뉴스인지 먼저 판단하지 말고, 그 뉴스 뒤에 환율·금리·주가가 실제로 같은 방향으로 움직였는지 확인하세요.</p>
      </div>
    </section>
  `;

  renderRelationshipLab(snapshot);

  elements.dailyTerm.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">오늘의 경제용어</p>
          <h3>${todayTerm.term}</h3>
        </div>
        <span>${studyDateFormatter.format(new Date())}</span>
      </div>
      <article class="daily-term-feature">
        <div class="term-title-row">
          <span>${todayTerm.category}</span>
          <strong>${todayTerm.term}</strong>
        </div>
        <p class="term-definition">${todayTerm.definition}</p>
        <div class="term-current-link">
          <span>오늘 숫자와 연결</span>
          <p>${getStudyTermConnection(todayTerm.id, snapshot)}</p>
        </div>
      </article>
      <div class="term-detail-grid">
        ${renderTermDetail("쉽게 말하면", todayTerm.easy)}
        ${renderTermDetail("왜 중요한가", todayTerm.why)}
        ${renderTermDetail("자주 하는 착각", todayTerm.mistake)}
        ${renderTermDetail("같이 알아둘 말", todayTerm.related.join(" · "))}
      </div>
      <p class="data-caveat">오늘의 용어는 날짜가 바뀌면 자동으로 다음 용어로 교체됩니다. 같은 용어도 그날 시장 숫자와 연결해 설명합니다.</p>
    </section>
  `;

  elements.studyQuiz.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">30초 확인</p>
          <h3>오늘의 생각 문제</h3>
        </div>
        <span>${todayTerm.term} 복습</span>
      </div>
      <article class="study-quiz-card">
        <span>질문</span>
        <strong>${todayTerm.question}</strong>
        <details>
          <summary>정답과 해설 보기</summary>
          <p>${todayTerm.answer}</p>
        </details>
      </article>
      <div class="study-habit-grid">
        <article><span>1</span><strong>숫자를 확인했는가</strong><p>기사 제목보다 가격과 변화율을 먼저 봅니다.</p></article>
        <article><span>2</span><strong>전달 경로를 찾았는가</strong><p>금리·환율·기업이익 중 어디를 거치는지 생각합니다.</p></article>
        <article><span>3</span><strong>반대 증거를 정했는가</strong><p>무엇이 나오면 내 판단을 바꿀지 미리 적어둡니다.</p></article>
      </div>
    </section>
  `;
}

function renderThinkingStep(number, title, body) {
  return `
    <article class="thinking-step">
      <span>${number}</span>
      <strong>${title}</strong>
      <p>${body}</p>
    </article>
  `;
}

function renderTermDetail(label, body) {
  return `
    <article>
      <span>${label}</span>
      <p>${body}</p>
    </article>
  `;
}

function getDailyEconomicTerm(date = new Date()) {
  const localDay = Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000
  );
  return economicTerms[Math.abs(localDay) % economicTerms.length];
}

function getStudyTermConnection(termId, snapshot) {
  const byId = Object.fromEntries(snapshot.markets.map((market) => [market.id, market]));
  const macro = snapshot.macro || [];
  const rate = macro.find((item) => /금리/.test(item.label));
  const cpi = macro.find((item) => /물가/.test(item.label));
  const exports = macro.find((item) => /수출/.test(item.label));
  const usdkrw = byId.usdkrw;
  const vix = byId.vix;
  const wti = byId.wti;
  const kospi = byId.kospi;
  const sp500 = byId.sp500;
  const connections = {
    "base-rate": `한국 기준금리는 ${macroValueText(rate)}입니다. 물가 ${macroValueText(cpi)}와 원/달러 ${usdkrw ? formatMarketValue(usdkrw) : "--"}를 함께 봐야 금리 여력을 판단할 수 있습니다.`,
    inflation: `소비자물가는 ${macroValueText(cpi)}이고 WTI는 ${wti ? `${signed(wti.changePercent)}%` : "--"} 움직였습니다. 유가는 시차를 두고 물가와 기업 비용에 영향을 줍니다.`,
    "real-rate": `기준금리 ${macroValueText(rate)}에서 물가상승률 ${macroValueText(cpi)}를 단순 차감하면 현재 실질금리 방향을 대략 가늠할 수 있습니다.`,
    "exchange-rate": `원/달러는 ${usdkrw ? `${formatMarketValue(usdkrw)}이며 ${signed(usdkrw.changePercent)}%` : "확인 중"} 움직였습니다. KOSPI ${signed(kospi?.changePercent || 0)}%와 함께 보면 외국인 수급 압력을 읽기 쉽습니다.`,
    vix: `VIX는 ${vix ? `${formatMarketValue(vix)}이며 ${signed(vix.changePercent)}%` : "확인 중"} 움직였습니다. 지수 수준과 하루 변화율을 함께 봐야 공포의 크기와 방향을 구분할 수 있습니다.`,
    "bond-yield": `현재 화면의 위험 온도는 ${snapshot.analysis.riskScore}/100입니다. 장기금리 상승이 NASDAQ 약세와 달러 강세로 이어지는지 확인하면 채권금리 충격을 판단할 수 있습니다.`,
    liquidity: `KOSPI ${signed(kospi?.changePercent || 0)}%, S&P 500 ${signed(sp500?.changePercent || 0)}%처럼 시장별 반응이 크게 다르면 자금이 모든 자산에 고르게 흐르는지 의심해봐야 합니다.`,
    "base-effect": `수출 증가율 ${macroValueText(exports)}만 보지 말고 전년의 수출액이 높았는지 낮았는지 함께 확인해야 실제 수출 체력을 알 수 있습니다.`,
    "current-account": `수출 증가율은 ${macroValueText(exports)}입니다. 하지만 경상수지는 상품 외에도 서비스와 배당·이자를 포함하므로 수출 하나만으로 결론 내리면 안 됩니다.`,
    valuation: `시장금리와 위험 온도 ${snapshot.analysis.riskScore}/100이 높을수록 같은 이익에도 주식이 받을 수 있는 평가 배수가 낮아질 수 있습니다.`,
    "risk-on": `S&P 500 ${signed(sp500?.changePercent || 0)}%, KOSPI ${signed(kospi?.changePercent || 0)}%, 원/달러 ${usdkrw ? signed(usdkrw.changePercent) : "--"}%가 같은 방향인지 보면 위험선호가 글로벌한지 판단할 수 있습니다.`,
    "credit-spread": `현재 위험 온도 ${snapshot.analysis.riskScore}/100이 높아도 국채금리만 오른 것인지, 기업 신용 위험까지 커진 것인지 신용스프레드로 구분해야 합니다.`
  };
  return connections[termId] || "오늘의 시장 가격과 함께 보면 용어가 실제 경제에서 어떻게 작동하는지 이해하기 쉽습니다.";
}

function hasMacroValue(item) {
  return item?.value !== null && item?.value !== undefined && Number.isFinite(Number(item.value));
}

function macroValueText(item, spaced = false) {
  if (!hasMacroValue(item)) return "확인 불가";
  const formattedValue = formatter.format(Number(item.value));
  if (/^%\s*YoY$/i.test(String(item.unit || ""))) {
    return `전년 대비 ${formattedValue}${spaced ? " %" : "%"}`;
  }
  const separator = spaced ? " " : "";
  return `${formattedValue}${separator}${item.unit || ""}`;
}

function exportChangeText(item) {
  if (!hasMacroValue(item)) return "수출 변화 확인 불가";
  const value = Number(item.value);
  if (value === 0) return "작년 같은 달과 비슷한 수준";
  return `작년 같은 달보다 ${formatter.format(Math.abs(value))}% ${value > 0 ? "증가" : "감소"}`;
}

function macroDeltaText(item) {
  if (item?.status !== "official") return "확인 실패";
  if (item.deltaLabel) return item.deltaLabel;
  return Number.isFinite(Number(item.delta)) ? signed(Number(item.delta)) : "변화 확인 중";
}

function macroDeltaClass(item) {
  const delta = Number(item?.delta);
  if (!Number.isFinite(delta) || delta === 0) return "";
  return delta > 0 ? "up" : "down";
}

function macroBasisText(item) {
  if (item?.status !== "official") return "공식 자료를 불러오지 못했습니다.";
  const basis = item.periodLabel || "최근 공표";
  return item.stale ? `${basis} 기준 · 마지막 정상 공식값` : `${basis} 기준 · 공식 최신 발표`;
}
function renderMacro(macro, analysis) {
  const watchItems = analysis?.koreaWatch || [];
  const inflation = macro.find((item) => /소비자|물가/.test(item.label));
  const policyRate = macro.find((item) => /금리/.test(item.label));
  const exports = macro.find((item) => /수출/.test(item.label));
  const credit = macro.find((item) => /신용/.test(item.label));

  elements.koreaBrief.innerHTML = `
    <article class="brief-card brief-card-main">
      <span>한국 체크</span>
      <strong>${watchItems.map((item) => `${item.label} ${item.state}`).join(" · ") || "환율과 수출 확인"}</strong>
      <p>한국 챕터는 글로벌 가격이 국내 환율, 물가, 수출, 가계 부담으로 어떻게 이어지는지 보는 곳입니다.</p>
    </article>
    <article class="brief-card">
      <span>금리/물가</span>
      <strong>${macroValueText(policyRate)} · ${macroValueText(inflation)}</strong>
      <p>소비와 성장주 밸류에이션에 직접 연결됩니다.</p>
    </article>
    <article class="brief-card">
      <span>수출 변화</span>
      <strong>${exportChangeText(exports)}</strong>
      <p>한국이 해외에 판 상품 금액이 1년 전보다 달라졌다는 뜻입니다. 반도체 판매, 환율 효과, 중국 주문 중 무엇이 변화를 만들었는지 나눠 봅니다.</p>
    </article>
    <article class="brief-card">
      <span>가계 부담</span>
      <strong>${macroValueText(credit)}</strong>
      <p>내수와 금융 안정성을 보는 보조 지표입니다.</p>
    </article>
  `;

  elements.macroGrid.replaceChildren(
    ...macro.map((item) => {
      const node = document.createElement("article");
      const sourceUrl = safeNewsUrl(item.sourceUrl);
      node.className = "macro-item";
      node.dataset.status = item.status || "unavailable";
      node.innerHTML = `
        <header>
          <span class="macro-label">${escapeHtml(item.label)}</span>
          <span class="state-badge" data-mood="${escapeHtml(item.mood || "neutral")}">${escapeHtml(item.cadence)}</span>
        </header>
        <strong class="macro-value">${escapeHtml(macroValueText(item, true))}</strong>
        <div class="macro-meta">
          <a href="${escapeHtml(sourceUrl)}" target="${sourceUrl.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">${escapeHtml(item.source)}</a>
          <span class="${macroDeltaClass(item)}">${escapeHtml(macroDeltaText(item))}</span>
        </div>
        <p class="macro-basis">${escapeHtml(macroBasisText(item))}</p>
        <details class="macro-detail">
          <summary>용어 설명</summary>
          <p>${getMacroReason(item)}</p>
        </details>
      `;
      return node;
    })
  );
  renderKoreaBoard(macro, analysis);
  renderKoreaImpact(macro, analysis, state.snapshot?.markets || []);
}

function renderKoreaBoard(macro, analysis) {
  const watchItems = analysis?.koreaWatch || [];
  const itemByLabel = (pattern) => macro.find((item) => pattern.test(item.label));
  const rate = itemByLabel(/금리/);
  const cpi = itemByLabel(/물가/);
  const exports = itemByLabel(/수출/);
  const credit = itemByLabel(/신용/);

  elements.koreaBoard.innerHTML = `
    <div class="board-heading">
      <div>
        <p class="section-kicker">한국 영향 경로</p>
        <h3>글로벌 흐름이 한국으로 오는 길</h3>
      </div>
      <span>${watchItems.length}개 체크</span>
    </div>
    <div class="chapter-board-grid">
      <article class="board-card board-card-main">
        <span>오늘 한국 포인트</span>
        <strong>${watchItems.map((item) => `${item.label} ${item.state}`).join(" · ") || "환율과 수출"}</strong>
        <p>한국은 글로벌 가격을 그대로 따라가기보다 환율, 반도체 수출, 가계 부담을 거쳐 반응합니다.</p>
      </article>
      <article class="board-card">
        <span>금리와 물가</span>
        <strong>${macroValueText(rate)} · ${macroValueText(cpi)}</strong>
        <p>금리와 물가는 소비, 부동산, 성장주 할인율에 바로 연결됩니다.</p>
      </article>
      <article class="board-card">
        <span>수출 체력</span>
        <strong>${macroValueText(exports)}</strong>
        <p>반도체와 중국 수요가 같이 좋아야 한국 증시의 상승 신뢰도가 높아집니다.</p>
      </article>
      <article class="board-card">
        <span>내수 부담</span>
        <strong>${macroValueText(credit)}</strong>
        <p>가계신용은 소비 여력과 금융 안정성을 동시에 보는 보조 신호입니다.</p>
      </article>
    </div>
  `;
}

function renderKoreaImpact(macro, analysis, markets) {
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const findMacro = (pattern) => macro.find((item) => pattern.test(item.label));
  const rate = findMacro(/금리/);
  const cpi = findMacro(/물가/);
  const exports = findMacro(/수출/);
  const credit = findMacro(/신용/);
  const usdkrw = byId.usdkrw;
  const kospi = byId.kospi;
  const wti = byId.wti;

  elements.koreaImpact.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">한국 체감 영향</p>
          <h3>산업과 생활로 번지는 경로</h3>
        </div>
        <span>${analysis.regime}</span>
      </div>
      <div class="impact-grid">
        ${renderImpactCard("반도체·수출", macroValueText(exports), usdkrw?.value > 1380 ? "원화 약세는 매출 환산에 도움이 될 수 있지만 외국인 수급 부담도 같이 커집니다." : "환율 부담이 크지 않으면 수출 실적 자체의 힘이 더 중요해집니다.", "positive")}
        ${renderImpactCard("내수·소비", macroValueText(cpi), `물가와 가계신용 ${macroValueText(credit)}이 소비 여력을 결정합니다.`, (cpi?.value || 0) > 3 ? "negative" : "watch")}
        ${renderImpactCard("부동산·금융", macroValueText(rate), "기준금리가 오래 높게 유지되면 대출 이자와 부동산 거래 회복 속도가 느려질 수 있습니다.", (rate?.value || 0) >= 3.5 ? "watch" : "neutral")}
        ${renderImpactCard("운송·화학", wti ? `${formatMarketValue(wti)} · ${signed(wti.changePercent)}%` : "--", "유가 급등은 항공·운송·화학의 비용 부담으로 이어지고 소비자물가에도 시차를 두고 반영됩니다.", Math.abs(wti?.changePercent || 0) > 2 ? "negative" : "neutral")}
        ${renderImpactCard("외국인 수급", kospi ? `${signed(kospi.changePercent)}%` : "--", `KOSPI와 원/달러 ${usdkrw ? formatMarketValue(usdkrw) : "--"}가 같은 방향으로 악화되는지 확인합니다.`, usdkrw?.value > 1380 && (kospi?.changePercent || 0) < 0 ? "negative" : "watch")}
        ${renderImpactCard("정책 여력", `${analysis.riskScore}/100`, "물가가 안정돼도 환율이 높으면 한국은행이 빠르게 완화적으로 움직이기 어려울 수 있습니다.", analysis.riskScore >= 66 ? "negative" : "watch")}
      </div>
      <p class="data-caveat">한국 공표지표는 실시간 시세가 아니라 발표 주기별 최신 스냅샷입니다. 발표일과 기준월을 함께 확인해야 합니다.</p>
    </section>
  `;
}

function renderGlossary() {
  const query = normalizeGlossaryText(state.glossaryQuery);
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const level = state.glossaryLevel;
  const category = state.glossaryCategory;
  const levelTerms = level === "all"
    ? glossaryTerms
    : glossaryTerms.filter((item) => item.level === level);
  const filtered = levelTerms.filter((item) => {
    if (category !== "전체" && item.category !== category) return false;
    if (!queryTokens.length) return true;
    const searchText = normalizeGlossaryText(
      [item.term, item.english, item.category, item.definition, ...(item.related || [])].join(" ")
    );
    return queryTokens.every((token) => matchesGlossaryToken(item, searchText, token));
  });
  const visible = filtered.slice(0, state.glossaryLimit);
  const allCategories = [
    "전체",
    ...glossaryCategoryOrder.filter((name) =>
      levelTerms.some((item) => item.category === name)
    )
  ];
  const levels = [
    { id: "all", label: "통합", detail: "핵심·심화 전체 용어" },
    { id: "core", label: "핵심", detail: "경제 흐름을 읽는 기본어" },
    { id: "advanced", label: "심화", detail: "금융·정책·위기 확장어" }
  ];

  elements.glossaryTotal.textContent = `전체 ${glossaryTerms.length} · 핵심 ${coreGlossaryTerms.length} · 심화 ${glossaryExtraTerms.length + glossaryMoreTerms.length + glossaryProTerms.length}`;
  elements.glossaryLevels.replaceChildren(
    ...levels.map((item) => {
      const count = item.id === "all"
        ? glossaryTerms.length
        : glossaryTerms.filter((term) => term.level === item.id).length;
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.className = "glossary-level-button";
      button.dataset.glossaryLevel = item.id;
      button.setAttribute("aria-selected", String(item.id === level));
      button.innerHTML = `<span><strong>${item.label}</strong><em>${item.detail}</em></span><b>${count}개</b>`;
      return button;
    })
  );
  elements.glossaryResultCount.innerHTML = `
    <strong>${filtered.length}</strong>
    <span>${query ? `"${escapeHtml(state.glossaryQuery.trim())}" 통합 검색 결과` : category === "전체" ? `${level === "all" ? "전체" : level === "core" ? "핵심" : "심화"} 용어` : category}</span>
  `;

  elements.glossaryCategories.replaceChildren(
    ...allCategories.map((name) => {
      const count =
        name === "전체"
          ? levelTerms.length
          : levelTerms.filter((item) => item.category === name).length;
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.className = "glossary-category-button";
      button.dataset.glossaryCategory = name;
      button.setAttribute("aria-selected", String(name === category));
      button.innerHTML = `<span>${name}</span><em>${count}</em>`;
      return button;
    })
  );

  if (!visible.length) {
    elements.glossaryResults.innerHTML = `
      <div class="glossary-empty">
        <strong>일치하는 용어가 없습니다.</strong>
        <p>검색어를 줄이거나 다른 분야를 선택해보세요.</p>
      </div>
    `;
  } else {
    elements.glossaryResults.replaceChildren(
      ...visible.map((item) => createGlossaryCard(item))
    );
  }

  const remaining = Math.max(0, filtered.length - visible.length);
  elements.glossaryLoadMore.hidden = remaining === 0;
  elements.glossaryLoadMore.textContent = remaining
    ? `용어 더 보기 · ${remaining}개 남음`
    : "모든 용어 표시 중";
  requestAnimationFrame(updateChapterHeight);
}

function createGlossaryCard(item) {
  const card = document.createElement("details");
  card.className = "glossary-card";
  card.innerHTML = `
    <summary>
      <span class="glossary-card-copy">
        <span class="glossary-card-topline">
          <strong>${escapeHtml(item.term)}</strong>
          <em>${escapeHtml(item.english)}</em>
          <b class="glossary-level-badge" data-level="${item.level}">${item.level === "core" ? "핵심" : "심화"}</b>
        </span>
        <span class="glossary-card-definition">${escapeHtml(item.definition)}</span>
      </span>
      <span class="glossary-card-side">
        <span>${escapeHtml(item.category)}</span>
        <i aria-hidden="true">+</i>
      </span>
    </summary>
    <div class="glossary-card-body">
      <article>
        <span>핵심 뜻</span>
        <p>${escapeHtml(item.definition)}</p>
      </article>
      <article>
        <span>읽는 포인트</span>
        <p>${escapeHtml(getGlossaryReadingPoint(item.category))}</p>
      </article>
      <div class="glossary-related">
        <strong>관련 용어</strong>
        ${(item.related || []).map((term) => `<span>${escapeHtml(term)}</span>`).join("")}
      </div>
    </div>
  `;
  return card;
}

function normalizeGlossaryText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesGlossaryToken(item, searchText, token) {
  if (/^[a-z0-9]+$/i.test(token)) {
    const latinTokens = normalizeGlossaryText(
      [item.term, item.english, ...(item.related || [])].join(" ")
    )
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    return latinTokens.includes(token);
  }
  return searchText.includes(token);
}

function getGlossaryReadingPoint(category) {
  const points = {
    "거시경제": "한 번의 수치보다 전기·전년 대비 방향과 몇 분기 동안 이어지는 추세를 함께 봅니다.",
    "물가·고용": "전체 지표와 세부 항목, 전월 대비와 전년 대비를 나눠 봐야 기조와 일시적 변화를 구분할 수 있습니다.",
    "금리·통화": "금리 수준뿐 아니라 변화 방향, 시장 예상과의 차이, 단기·장기금리의 움직임을 같이 확인합니다.",
    "외환·국제": "환율 숫자 하나보다 달러 방향, 금리차, 무역과 외국인 자금 흐름을 함께 연결합니다.",
    "주식·투자": "높고 낮은 숫자만으로 판단하지 말고 이익 성장, 업종 특성, 과거 평균과 비교합니다.",
    "채권·신용": "채권 가격과 금리는 반대로 움직이며 국채금리와 신용스프레드를 분리해 읽습니다.",
    "파생·위험": "수익 확대 가능성과 같은 크기의 손실 확대 가능성을 함께 보고 만기와 증거금 조건을 확인합니다.",
    "기업·회계": "회계상 이익과 실제 현금흐름을 구분하고 일회성 항목이 포함됐는지 확인합니다.",
    "무역·산업": "증가율만 보지 말고 금액, 물량, 가격, 비교 기준의 기저효과를 함께 살펴봅니다.",
    "부동산·가계": "가격뿐 아니라 소득 대비 원리금 부담, 금리 조건, 보증금과 담보가치를 같이 봅니다.",
    "원자재·에너지": "가격 변화가 공급 문제인지 수요 변화인지 구분하고 달러와 재고, 지정학 변수를 함께 확인합니다.",
    "정책·제도": "정책 발표보다 시행 시점과 규모, 재원, 시장 예상에 이미 반영됐는지를 확인합니다.",
    "시장심리·자금": "하루의 매매보다 여러 자산에서 같은 자금 방향이 반복되는지 확인해야 신호의 강도를 알 수 있습니다.",
    "은행·금융": "수익성 지표와 함께 자본비율, 연체율, 유동성을 확인해 이익과 건전성을 분리해서 봅니다.",
    "행동경제": "내 판단을 설명하는 정보뿐 아니라 반대 증거도 찾아보고 가격 변화 뒤 감정이 개입했는지 확인합니다.",
    "세금·연금": "세율 하나보다 과세표준, 공제, 납부 시점과 노후 현금흐름을 함께 봅니다.",
    "경제위기·역사": "위기의 이름보다 부채, 유동성, 자산가격과 정책 대응이 어떤 순서로 연결됐는지 봅니다.",
    "디지털경제": "기술의 가능성과 실제 매출·비용·규제·현금흐름을 분리해 평가합니다.",
    "데이터·통계": "단위와 표본, 비교 기준을 먼저 확인하고 상관관계를 곧바로 인과관계로 해석하지 않습니다.",
    "보험·위험관리": "보험료 성장만 보지 말고 손해율, 준비금, 지급여력과 재보험 조건을 함께 확인합니다.",
    "지급결제·핀테크": "사용 편의성과 별개로 실제 결제·정산 구조, 신용위험과 개인정보 보호 수준을 살펴봅니다.",
    "ESG·기후경제": "친환경이라는 이름보다 실제 배출량 목표, 전환 비용, 공시 범위와 검증 여부를 확인합니다.",
    "경제학파·이론": "이론을 만능 답으로 쓰기보다 어떤 가정과 경제 상황에서 설명력이 커지는지 구분합니다.",
    "기업금융·M&A": "거래 가격과 함께 현금흐름, 조달 비용, 주주가치 희석과 인수 후 통합 가능성을 봅니다.",
    "국제개발·무역제도": "협정의 이름보다 적용 범위, 시행 일정, 국가별 노출도와 실제 이행 조건을 확인합니다."
  };
  return points[category] || "용어의 정의와 함께 실제 숫자가 어떤 방향으로 움직이는지 확인합니다.";
}

function renderQuiz() {
  const modes = [
    { id: "mixed", label: "혼합", detail: "용어 5 + 상황 5", count: glossaryTerms.length + scenarioQuestions.length },
    { id: "term", label: "용어", detail: "뜻 맞히기", count: glossaryTerms.length },
    { id: "scenario", label: "상황판단", detail: "경제 흐름 판단", count: scenarioQuestions.length }
  ];
  elements.quizBankSize.textContent = `${glossaryTerms.length + scenarioQuestions.length}개 문제은행`;
  elements.quizModes.replaceChildren(
    ...modes.map((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.className = "quiz-mode-button";
      button.dataset.quizMode = mode.id;
      button.setAttribute("aria-selected", String(state.quizMode === mode.id));
      button.innerHTML = `<strong>${mode.label}</strong><b>${mode.count}개</b><span>${mode.detail}</span>`;
      return button;
    })
  );

  if (!state.quizQuestions.length) {
    state.quizQuestions = createQuizSession(state.quizMode);
  }

  if (state.quizComplete) {
    renderQuizResult();
    requestAnimationFrame(updateChapterHeight);
    return;
  }

  const question = state.quizQuestions[state.quizIndex];
  if (!question) return;
  const progress =
    ((state.quizIndex + (state.quizAnswered ? 1 : 0)) / state.quizQuestions.length) * 100;
  const answers = question.choices
    .map((choice, index) => {
      let answerState = "idle";
      if (state.quizAnswered && index === question.answerIndex) answerState = "correct";
      else if (state.quizAnswered && index === state.quizSelected) answerState = "wrong";
      else if (state.quizSelected === index) answerState = "selected";
      return `
        <button
          class="quiz-answer-button"
          type="button"
          data-quiz-answer="${index}"
          data-state="${answerState}"
          aria-pressed="${state.quizSelected === index}"
          ${state.quizAnswered ? "disabled" : ""}
        >
          <span>${String.fromCharCode(65 + index)}</span>
          <strong>${escapeHtml(choice)}</strong>
        </button>
      `;
    })
    .join("");
  const isCorrect = state.quizSelected === question.answerIndex;

  elements.quizBody.innerHTML = `
    <div class="quiz-status-row">
      <span>문제 ${state.quizIndex + 1} / ${state.quizQuestions.length}</span>
      <strong>현재 점수 ${state.quizScore}</strong>
    </div>
    <div class="quiz-progress" aria-label="퀴즈 진행률 ${Math.round(progress)}%">
      <span style="width: ${progress}%"></span>
    </div>
    <article class="quiz-question-card">
      <div class="quiz-question-meta">
        <span>${question.type === "term" ? "용어" : "상황판단"}</span>
        <em>${escapeHtml(question.category)}</em>
        ${question.type === "scenario" ? `<b>${escapeHtml(question.difficulty || "기본")}</b>` : ""}
      </div>
      <h3>${escapeHtml(question.prompt)}</h3>
      <p>${escapeHtml(question.context)}</p>
      <div class="quiz-answers">${answers}</div>
      ${
        state.quizAnswered
          ? `
            <div class="quiz-feedback" data-correct="${isCorrect}">
              <strong>${isCorrect ? "정답입니다" : `정답은 ${String.fromCharCode(65 + question.answerIndex)}입니다`}</strong>
              <p>${escapeHtml(question.explanation)}</p>
              ${question.rule ? `
                <div class="quiz-judgment-rule">
                  <span>판단 기준</span>
                  <p>${escapeHtml(question.rule)}</p>
                </div>
              ` : ""}
            </div>
            <button class="quiz-next-button" type="button" data-quiz-next>
              ${state.quizIndex === state.quizQuestions.length - 1 ? "결과 보기" : "다음 문제"}
            </button>
          `
          : ""
      }
    </article>
  `;
  requestAnimationFrame(updateChapterHeight);
}

function resetQuizSession(mode = "mixed") {
  state.quizMode = ["mixed", "term", "scenario"].includes(mode) ? mode : "mixed";
  state.quizQuestions = createQuizSession(state.quizMode);
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswered = false;
  state.quizSelected = null;
  state.quizComplete = false;
  state.quizMistakes = [];
  renderQuiz();
}

function createQuizSession(mode) {
  const termPool = shuffleQuizItems(buildTermQuizPool());
  const scenarioPool = shuffleQuizItems(scenarioQuestions.map(shuffleScenarioChoices));
  if (mode === "term") return termPool.slice(0, 10);
  if (mode === "scenario") return scenarioPool.slice(0, 10);
  return shuffleQuizItems([...termPool.slice(0, 5), ...scenarioPool.slice(0, 5)]);
}

function shuffleScenarioChoices(question) {
  const shuffledChoices = shuffleQuizItems(
    question.choices.map((choice, index) => ({
      choice,
      isCorrect: index === question.answerIndex
    }))
  );
  return {
    ...question,
    choices: shuffledChoices.map((item) => item.choice),
    answerIndex: shuffledChoices.findIndex((item) => item.isCorrect)
  };
}

function buildTermQuizPool() {
  return glossaryTerms.map((term, termIndex) => {
    const sameCategory = glossaryTerms.filter(
      (candidate) => candidate.category === term.category && candidate.term !== term.term
    );
    const distractors = [];
    let cursor = Math.abs(quizHash(`${term.term}-${termIndex}`)) % sameCategory.length;
    while (distractors.length < 3 && sameCategory.length) {
      const candidate = sameCategory[cursor % sameCategory.length].term;
      if (!distractors.includes(candidate)) distractors.push(candidate);
      cursor += 1;
    }
    const choices = [term.term, ...distractors].sort(
      (a, b) => quizHash(`${term.term}-${a}`) - quizHash(`${term.term}-${b}`)
    );
    return {
      id: `term-${termIndex}`,
      type: "term",
      category: term.category,
      prompt: "다음 설명에 해당하는 경제용어는 무엇일까요?",
      context: term.definition,
      choices,
      answerIndex: choices.indexOf(term.term),
      explanation: `${term.term}: ${term.definition}`
    };
  });
}

function handleQuizAnswer(answerIndex) {
  if (state.quizAnswered || !Number.isInteger(answerIndex)) return;
  const question = state.quizQuestions[state.quizIndex];
  if (!question || answerIndex < 0 || answerIndex >= question.choices.length) return;
  state.quizSelected = answerIndex;
  state.quizAnswered = true;
  if (answerIndex === question.answerIndex) {
    state.quizScore += 1;
  } else {
    state.quizMistakes.push({
      question: {
        ...question,
        choices: [...question.choices]
      },
      selectedIndex: answerIndex
    });
  }
  renderQuiz();
}

function advanceQuiz() {
  if (!state.quizAnswered) return;
  if (state.quizIndex >= state.quizQuestions.length - 1) {
    state.quizComplete = true;
  } else {
    state.quizIndex += 1;
    state.quizAnswered = false;
    state.quizSelected = null;
  }
  renderQuiz();
}

function renderQuizResult() {
  const total = state.quizQuestions.length;
  const scoreRate = total ? Math.round((state.quizScore / total) * 100) : 0;
  const message =
    scoreRate >= 90
      ? "경제 흐름을 아주 정확하게 읽고 있습니다."
      : scoreRate >= 70
        ? "핵심은 잘 잡았습니다. 틀린 분야만 다시 보면 됩니다."
        : scoreRate >= 50
          ? "기본기는 있습니다. 해설을 용어 사전과 연결해보세요."
          : "지금부터 익히면 됩니다. 정답보다 이유를 이해하는 것이 중요합니다.";
  const mistakeCounts = state.quizMistakes.reduce((counts, mistake) => {
    const category = mistake.question.category;
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const weakAreas = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]);
  const reviewMarkup = state.quizMistakes.length
    ? `
      <section class="quiz-review-section">
        <div class="quiz-review-heading">
          <div>
            <span>오답 복습</span>
            <h3>틀린 문제 ${state.quizMistakes.length}개 다시 보기</h3>
          </div>
          <p>내 답과 정답을 비교하고 해설의 판단 기준을 확인하세요.</p>
        </div>
        <div class="quiz-review-list">
          ${state.quizMistakes.map(renderQuizReviewItem).join("")}
        </div>
      </section>
    `
    : "";

  elements.quizBody.innerHTML = `
    <article class="quiz-result-card">
      <span>퀴즈 완료</span>
      <div class="quiz-score">
        <strong>${state.quizScore}</strong>
        <em>${total}</em>
      </div>
      <h3>${scoreRate}점</h3>
      <p>${message}</p>
      <div class="quiz-weak-areas">
        <strong>${weakAreas.length ? "다시 볼 분야" : "모든 문제 정답"}</strong>
        ${
          weakAreas.length
            ? weakAreas.map(([category, count]) => `<span>${escapeHtml(category)} ${count}문제</span>`).join("")
            : "<span>훌륭합니다</span>"
        }
      </div>
      <div class="quiz-result-actions">
        ${state.quizMistakes.length ? `<button class="quiz-review-retry-button" type="button" data-quiz-retry-mistakes>틀린 문제만 다시 풀기</button>` : ""}
        <button class="quiz-restart-button" type="button" data-quiz-restart>새 문제로 다시 풀기</button>
      </div>
    </article>
    ${reviewMarkup}
  `;
}

function renderQuizReviewItem(mistake, index) {
  const question = mistake.question;
  const selectedChoice = question.choices[mistake.selectedIndex] || "선택한 답을 찾을 수 없습니다.";
  const correctChoice = question.choices[question.answerIndex] || "정답을 찾을 수 없습니다.";
  const typeLabel = question.type === "scenario" ? "상황판단" : "용어";
  return `
    <details class="quiz-review-item" ${index === 0 ? "open" : ""}>
      <summary>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <span class="quiz-review-summary-copy">
          <strong>${escapeHtml(question.prompt)}</strong>
          <em>${typeLabel} · ${escapeHtml(question.category)}</em>
        </span>
        <i aria-hidden="true">+</i>
      </summary>
      <div class="quiz-review-body">
        <p class="quiz-review-context">${escapeHtml(question.context)}</p>
        <div class="quiz-review-answers">
          <article data-answer="wrong">
            <span>내 답</span>
            <p>${escapeHtml(selectedChoice)}</p>
          </article>
          <article data-answer="correct">
            <span>정답</span>
            <p>${escapeHtml(correctChoice)}</p>
          </article>
        </div>
        <article class="quiz-review-explanation">
          <span>해설</span>
          <p>${escapeHtml(question.explanation)}</p>
        </article>
        ${question.rule ? `
          <article class="quiz-review-rule">
            <span>판단 기준</span>
            <p>${escapeHtml(question.rule)}</p>
          </article>
        ` : ""}
      </div>
    </details>
  `;
}

function retryQuizMistakes() {
  if (!state.quizMistakes.length) return;
  const missedQuestions = state.quizMistakes.map((mistake) => {
    const question = {
      ...mistake.question,
      choices: [...mistake.question.choices]
    };
    return question.type === "scenario" ? shuffleScenarioChoices(question) : question;
  });
  state.quizQuestions = shuffleQuizItems(missedQuestions);
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswered = false;
  state.quizSelected = null;
  state.quizComplete = false;
  state.quizMistakes = [];
  renderQuiz();
}

function shuffleQuizItems(items) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function quizHash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }
  return output;
}

function getNewsSummaryKey(headline) {
  return String(headline?.id || `${headline?.source || "news"}|${headline?.title || "untitled"}`);
}

function cacheNewsSummary(summaryKey, result) {
  state.newsSummaryResults.set(summaryKey, result);
  if (state.newsSummaryResults.size <= 48) return;

  for (const cachedKey of state.newsSummaryResults.keys()) {
    if (!state.openNewsSummaryIds.has(cachedKey)) {
      state.newsSummaryResults.delete(cachedKey);
    }
    if (state.newsSummaryResults.size <= 48) break;
  }
}

const NEWS_SECTION_DEFINITIONS = [
  { id: "korea", label: "한국", description: "환율·정책·수출·가계 흐름" },
  { id: "us", label: "미국", description: "연준·물가·고용·미국 시장" },
  { id: "china-asia", label: "중국·아시아", description: "중국 수요·위안·일본은행·엔화" },
  { id: "europe-global", label: "유럽·글로벌", description: "ECB·유로존·세계 성장과 무역" },
  { id: "commodities-fx", label: "원자재·환율", description: "유가·금·달러·운임과 지정학" }
];

function renderNews(headlines = [], analysis, dataQuality = {}) {
  const lookbackDays = Number(dataQuality?.newsLookbackDays) || 7;
  const topicCounts = headlines.reduce((acc, headline) => {
    acc[headline.topic] = (acc[headline.topic] || 0) + 1;
    return acc;
  }, {});
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const firstTopic = topTopics[0]?.[0] || "선별 기사 없음";
  const koreaHeadlineCount = headlines.filter((headline) => headline.section === "korea").length;
  const globalHeadlineCount = headlines.filter((headline) => headline.section !== "korea").length;
  const riskText =
    headlines.length === 0
      ? `최근 ${lookbackDays}일 안에 경제 관련성과 최신성 기준을 통과한 새 기사가 없습니다.`
      : analysis?.riskScore >= 66
      ? "뉴스는 방어적인 가격 흐름을 확인하는 재료로 봅니다."
      : analysis?.riskScore >= 45
        ? "뉴스는 방향을 정하기보다 변동 요인을 걸러내는 용도입니다."
        : "뉴스는 위험선호 회복이 이어질 수 있는지 확인하는 재료입니다.";

  elements.newsBrief.innerHTML = `
    <article class="brief-card brief-card-main">
      <span>뉴스 초점</span>
      <strong>한국 ${koreaHeadlineCount}건 · 해외 핵심 ${globalHeadlineCount}건</strong>
      <p>${firstTopic} 중심 · ${riskText}</p>
    </article>
    ${topTopics
      .map(
        ([topic, count]) => `
          <article class="brief-card">
            <span>${topic}</span>
            <strong>${count}건</strong>
            <p>${getTopicMeaning(topic)}</p>
          </article>
        `
      )
      .join("")}
  `;

  if (headlines.length === 0) {
    elements.newsList.innerHTML = `
      <article class="news-empty-state">
        <strong>현재 표시할 새 경제 기사가 없습니다.</strong>
        <p>최근 ${lookbackDays}일 기사만 사용하며, 오래되거나 경제 관련성이 낮은 기사를 대신 채우지 않습니다.</p>
      </article>
    `;
  } else {
    let visibleIndex = 0;
    const sections = NEWS_SECTION_DEFINITIONS.map((section) => {
      const sectionHeadlines = headlines.filter((headline) => headline.section === section.id);
      const group = document.createElement("section");
      group.className = "news-section-group";
      group.dataset.newsSection = section.id;
      group.innerHTML = `
        <header class="news-section-heading">
          <div>
            <span>${escapeHtml(section.label)}</span>
            <strong>${escapeHtml(section.description)}</strong>
          </div>
          <em>${sectionHeadlines.length}건</em>
        </header>
        <div class="news-section-items"></div>
      `;
      const items = sectionHeadlines.map((headline) => {
        visibleIndex += 1;
        return createNewsItem(headline, visibleIndex, analysis);
      });
      const sectionItems = group.querySelector(".news-section-items");
      if (items.length) {
        sectionItems.replaceChildren(...items);
      } else {
        sectionItems.innerHTML = `
          <div class="news-section-empty">
            <strong>현재 중요도 기준을 통과한 새 기사가 없습니다.</strong>
            <span>수를 맞추기 위해 오래되거나 영향이 작은 기사를 대신 넣지 않습니다.</span>
          </div>
        `;
      }
      return group;
    });
    elements.newsList.replaceChildren(...sections);
  }
  renderNewsBoard(headlines, topTopics, analysis);
  renderNewsIntelligence(headlines, topTopics, analysis, dataQuality);
}

function createNewsItem(headline, index, analysis) {
  const item = document.createElement("article");
  const newsUrl = safeNewsUrl(headline.url);
  const summaryKey = getNewsSummaryKey(headline);
  const sectionLabel = NEWS_SECTION_DEFINITIONS.find((section) => section.id === headline.section)?.label || headline.topic;
  const isGlobal = headline.section && headline.section !== "korea";
  item.className = "news-item";
  item.innerHTML = `
    <div class="news-item-head">
      <span class="news-index">${String(index).padStart(2, "0")}</span>
      <a class="news-link" href="${escapeHtml(newsUrl)}" target="${newsUrl.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">
        <span class="news-title">${escapeHtml(headline.title)}</span>
        <span class="news-meta">
          <span>${escapeHtml(sectionLabel)}</span>
          <span>${escapeHtml(headline.impactArea || headline.topic)}</span>
          <span class="news-importance" data-importance="${escapeHtml(headline.importanceLabel || "선별")}">${escapeHtml(headline.importanceLabel || "선별")}</span>
          ${isGlobal ? `<span class="news-korea-impact">한국 영향 · ${escapeHtml(headline.koreaImpactLabel || "경기 심리")}</span>` : ""}
          <span data-source-tier="${escapeHtml(headline.sourceTier || "other")}">${escapeHtml(headline.source)}</span>
          ${headline.relatedSourceCount > 1 ? `<span class="news-corroboration">교차 ${headline.relatedSourceCount}곳</span>` : ""}
          <span>${relativeTime(headline.publishedAt)}</span>
        </span>
      </a>
    </div>
    <details class="news-ai-detail">
      <summary>
        <span class="ai-label">요약</span>
        <strong>기사 요약 보기</strong>
        <em>핵심 사실 · 시장 영향 · 한국 영향 · 다음 확인</em>
      </summary>
      <div class="news-ai-output" data-news-analysis>
        <p>분석을 준비하고 있습니다.</p>
      </div>
    </details>
  `;
  const details = item.querySelector(".news-ai-detail");
  const cachedSummary = state.newsSummaryResults.get(summaryKey);
  details.dataset.summaryKey = summaryKey;
  if (cachedSummary) {
    renderNewsAnalysisResult(details.querySelector("[data-news-analysis]"), cachedSummary);
    details.dataset.loaded = "true";
  }
  if (state.openNewsSummaryIds.has(summaryKey)) details.open = true;
  details.addEventListener("toggle", () => {
    if (details.open) {
      state.openNewsSummaryIds.add(summaryKey);
      if (details.dataset.loaded !== "true" && details.dataset.loaded !== "loading") {
        loadNewsAnalysis(details, headline, analysis);
      }
    } else {
      state.openNewsSummaryIds.delete(summaryKey);
    }
  });
  if (details.open && !cachedSummary) {
    requestAnimationFrame(() => {
      if (details.isConnected && details.open && details.dataset.loaded !== "loading") {
        loadNewsAnalysis(details, headline, analysis);
      }
    });
  }
  return item;
}

function renderNewsBoard(headlines, topTopics, analysis) {
  const newest = [...headlines].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  const koreaCount = headlines.filter((headline) => headline.section === "korea").length;
  const globalCount = headlines.filter((headline) => headline.section !== "korea").length;
  const readingMode = headlines.length === 0
    ? "새 기사 대기"
    : analysis?.riskScore >= 66
      ? "악재 확인"
      : analysis?.riskScore >= 45
        ? "방향 필터링"
        : "호재 지속 확인";

  elements.newsBoard.innerHTML = `
    <div class="board-heading">
      <div>
        <p class="section-kicker">뉴스 해석</p>
        <h3>읽는 순서</h3>
      </div>
      <span>${readingMode}</span>
    </div>
    <div class="chapter-board-grid">
      <article class="board-card board-card-main">
        <span>첫 번째로 볼 기사</span>
        <strong>${escapeHtml(newest?.title || "최근 기준을 통과한 기사 없음")}</strong>
        <p>${newest ? `${escapeHtml(newest.topic)} · ${escapeHtml(newest.source)} · ${relativeTime(newest.publishedAt)}` : "오래된 기사를 가져와 빈자리를 채우지 않습니다."}</p>
      </article>
      <article class="board-card">
        <span>한국 뉴스</span>
        <strong>${koreaCount}건</strong>
        <p>환율, 수출, 외국인 수급으로 이어지는지 먼저 봅니다.</p>
      </article>
      <article class="board-card">
        <span>해외 중요 뉴스</span>
        <strong>${globalCount}건</strong>
        <p>미국·중국·유럽·원자재 중 한국 시장으로 번질 기사만 선별합니다.</p>
      </article>
      <article class="board-card">
        <span>주요 토픽</span>
        <strong>${topTopics.map(([topic]) => topic).join(" · ") || "분류 중"}</strong>
        <p>${topTopics.map(([topic, count]) => `${topic} ${count}건`).join(", ") || "뉴스 토픽을 분류하고 있습니다."}</p>
      </article>
    </div>
  `;
}

function renderNewsIntelligence(headlines, topTopics, analysis, dataQuality = {}) {
  const lookbackDays = Number(dataQuality?.newsLookbackDays) || 7;
  const fetchedCount = Number(dataQuality?.fetchedHeadlineCount) || headlines.length;
  const combined = headlines.map((headline) => headline.title).join(" ");
  const themes = [
    [/금리|연준|Fed|채권|물가|inflation|CPI/i, "금리·물가"],
    [/환율|달러|원화|위안|엔화|dollar/i, "환율·통화"],
    [/반도체|chip|AI|기술주|테크/i, "반도체·기술"],
    [/유가|원유|OPEC|중동|전쟁|oil/i, "에너지·지정학"],
    [/중국|China|수출|무역|export/i, "중국·수출"]
  ]
    .filter(([pattern]) => pattern.test(combined))
    .map(([, label]) => label)
    .slice(0, 4);
  const freshCount = headlines.filter(
    (headline) => Date.now() - new Date(headline.publishedAt).getTime() < 24 * 60 * 60 * 1000
  ).length;
  const sourceCount = Number(dataQuality?.uniqueNewsSourceCount) || new Set(headlines.map((headline) => headline.source)).size;
  const corroboratedCount = Number(dataQuality?.corroboratedHeadlineCount) || 0;
  const primaryCount = Number(dataQuality?.primarySourceHeadlineCount) || 0;
  const establishedCount = Number(dataQuality?.establishedSourceHeadlineCount) || 0;

  elements.newsIntelligence.innerHTML = `
    <section class="expansion-section">
      <div class="board-heading">
        <div>
          <p class="section-kicker">뉴스 인텔리전스</p>
          <h3>헤드라인을 가격 신호와 연결하기</h3>
        </div>
        <span>최근 ${lookbackDays}일 · ${headlines.length}/${fetchedCount}건 선정</span>
      </div>
      <div class="intelligence-grid">
        <article>
          <span>주요 서사</span>
          <strong>${themes.join(" · ") || "시장 방향 탐색"}</strong>
          <p>같은 주제를 다룬 기사가 반복되는지 확인하면 일회성 소음과 지속되는 흐름을 구분하기 쉽습니다.</p>
        </article>
        <article>
          <span>최신성</span>
          <strong>24시간 이내 ${freshCount}건</strong>
          <p>최근 ${lookbackDays}일 범위 안에서도 새 기사를 우선하며, 오래된 기사는 자동으로 제외합니다.</p>
        </article>
        <article>
          <span>출처 구성</span>
          <strong>${sourceCount}곳 · 주요 ${primaryCount + establishedCount}건</strong>
          <p>같은 매체의 반복 노출을 제한하고 공식·주요 출처를 우선합니다.</p>
        </article>
        <article>
          <span>사건 교차확인</span>
          <strong>복수 출처 ${corroboratedCount}건</strong>
          <p>유사한 사건은 최신 기사 하나로 묶고 함께 확인된 출처 수를 표시합니다.</p>
        </article>
      </div>
      <p class="data-caveat">최근 ${lookbackDays}일 기사 중 경제 관련성이 높은 내용을 선별하고 같은 사건은 최신 기사로 묶었습니다. 해외 뉴스는 중앙은행·물가·고용·GDP·관세·에너지·주요 시장 충격처럼 한국 자산에 전달 경로가 있는 기사만 포함합니다. 상세 요약은 기사 시점 가격을 우선 사용하며, 원문·출처 수·신뢰도를 함께 표시합니다.</p>
    </section>
  `;
}

async function loadNewsAnalysis(details, headline, marketAnalysis) {
  const output = details.querySelector("[data-news-analysis]");
  const summaryKey = getNewsSummaryKey(headline);
  const cachedSummary = state.newsSummaryResults.get(summaryKey);
  if (cachedSummary) {
    renderNewsAnalysisResult(output, cachedSummary);
    details.dataset.loaded = "true";
    requestAnimationFrame(updateChapterHeight);
    return;
  }
  details.dataset.loaded = "loading";
  output.innerHTML = `
    <div class="analysis-loading">
      <span></span>
      <p>기사 원문을 정리하고 기사 시점의 시장 가격과 연결하고 있습니다.</p>
    </div>
  `;
  updateChapterHeight();

  try {
    const response = await fetch("/api/news-analysis", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        id: headline.id,
        title: headline.title,
        topic: headline.topic,
        source: headline.source,
        publishedAt: headline.publishedAt
      })
    });
    if (!response.ok) throw new Error(`News analysis failed: ${response.status}`);
    const result = await response.json();
    cacheNewsSummary(summaryKey, result);
    renderNewsAnalysisResult(output, result);
  } catch {
    const fallback = buildLocalNewsAnalysis(headline, marketAnalysis);
    cacheNewsSummary(summaryKey, fallback);
    renderNewsAnalysisResult(output, fallback);
  } finally {
    details.dataset.loaded = "true";
    requestAnimationFrame(updateChapterHeight);
  }
}

function renderNewsAnalysisResult(output, result) {
  const checkpoints = Array.isArray(result.checkpoints) ? result.checkpoints.slice(0, 3) : [];
  const keyPoints = Array.isArray(result.keyPoints) ? result.keyPoints.slice(0, 3) : [];
  const isArticleBased = result.contentBasis === "article";
  const contentBasis = isArticleBased ? "원문 내용 기반" : "제목 기반";
  const summaryLabel = isArticleBased ? "한 줄 요약" : "제목 기반 해석";
  const pointsLabel = isArticleBased ? "핵심 사실" : "읽는 포인트";
  const marketBasis = result.marketContextBasis === "article-time" ? "기사 시점 가격" : "현재 가격";
  const sourceBasis = Number(result.relatedSourceCount) > 1
    ? `교차 ${result.relatedSourceCount}곳`
    : "단일 출처";
  output.innerHTML = `
    <div class="ai-result-head">
      <span data-tone="${escapeHtml(result.tone || "watch")}">${escapeHtml(result.signal || "혼합 신호")}</span>
      <em>${escapeHtml(result.engineLabel || "데이터 기반 자동 요약")} · ${contentBasis} · ${marketBasis} · ${sourceBasis} · 신뢰도 ${escapeHtml(result.confidence || "중간")}</em>
    </div>
    <section class="ai-article-summary">
      <span>${summaryLabel}</span>
      <p>${escapeHtml(result.summary || "현재 시장과의 연결을 확인하고 있습니다.")}</p>
    </section>
    ${keyPoints.length ? `
      <div class="ai-key-points">
        <header>
          <strong>${pointsLabel}</strong>
          <em>${keyPoints.length}개</em>
        </header>
        ${keyPoints.map((item, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b><i>${escapeHtml(item)}</i></span>`).join("")}
      </div>
    ` : ""}
    <div class="ai-section-title">
      <strong>경제적 의미</strong>
      <span>기사 내용이 시장과 한국에 이어지는 경로</span>
    </div>
    <div class="ai-analysis-grid">
      <article>
        <span>왜 중요한가</span>
        <p>${escapeHtml(result.whyItMatters || "가격에 실제로 반영되는지 확인해야 합니다.")}</p>
      </article>
      <article>
        <span>시장 영향</span>
        <p>${escapeHtml(result.marketImpact || "주식, 금리, 환율의 반응을 함께 봅니다.")}</p>
      </article>
      <article>
        <span>한국 영향</span>
        <p>${escapeHtml(result.koreaImpact || "환율과 외국인 수급으로 이어지는지 확인합니다.")}</p>
      </article>
    </div>
    ${checkpoints.length ? `
      <div class="ai-checkpoints">
        <strong>다음에 확인할 것</strong>
        ${checkpoints.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    ` : ""}
    <div class="ai-limitation">
      <strong>주의할 점</strong>
      <span>${escapeHtml(result.limitation || "기사 원문과 실제 가격 반응을 함께 확인해야 합니다.")}</span>
    </div>
  `;
}
function drawChart() {
  if (!state.snapshot) return;
  const market =
    state.snapshot.markets.find((item) => item.id === state.selectedMarket) ||
    state.snapshot.markets[0];
  if (!market) return;

  hideChartTooltip();
  elements.chartTitle.textContent = market.name;
  const series = (market.series || [])
    .map((point) => ({
      time: new Date(point.time),
      value: point.value === null || point.value === undefined ? Number.NaN : Number(point.value)
    }))
    .filter((point) => Number.isFinite(point.time.getTime()) && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.time - b.time);

  const canvas = elements.marketChart;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40 || rect.height < 40) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  context.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  context.clearRect(0, 0, width, height);

  if (series.length < 2) {
    chartRenderState = null;
    elements.chartMeta.innerHTML = `<span><b>조회 상태</b>유효한 가격 데이터가 부족합니다.</span>`;
    elements.chartCurrentValue.textContent = "--";
    elements.chartStatusText.textContent = "데이터 확인 필요";
    elements.chartPeriodBadge.dataset.direction = "flat";
    elements.chartPeriodBadge.querySelector("strong").textContent = "--";
    context.fillStyle = "#65717d";
    context.font = "650 13px Inter, system-ui, sans-serif";
    context.fillText("표시할 유효 시세가 부족합니다.", 24, 42);
    return;
  }

  const firstPoint = series[0];
  const lastPoint = series.at(-1);

  const periodChange = firstPoint.value
    ? ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100
    : 0;
  const direction = periodChange > 0.005 ? "up" : periodChange < -0.005 ? "down" : "flat";
  const statusLabel = market.live ? "실시간" : market.status === "stale" ? "이전 데이터" : "마감";
  const pointValue = formatChartPointValue(market, lastPoint.value);
  const startLabel = marketTimeFormatter.format(firstPoint.time);
  const endLabel = marketTimeFormatter.format(lastPoint.time);

  elements.chartCurrentValue.textContent = pointValue;
  elements.chartCurrentValue.parentElement.dataset.direction = direction;
  elements.chartStatusText.textContent = `${statusLabel} · ${endLabel} 기준`;
  elements.chartPeriodBadge.dataset.direction = direction;
  elements.chartPeriodBadge.querySelector("strong").textContent = `${signed(periodChange)}%`;
  elements.chartMeta.innerHTML = `
    <span><b>조회 기간</b>${escapeHtml(startLabel)} ~ ${escapeHtml(endLabel)}</span>
    <span><b>데이터 간격</b>5일 · 1시간 · 비거래 시간 제외 · ${series.length}개</span>
    <span><b>비교</b>기간 ${signed(periodChange)}% · 전일 ${signed(market.changePercent)}%</span>
    <span><b>출처·상태</b>Yahoo Finance · ${statusLabel}</span>
  `;
  canvas.setAttribute(
    "aria-label",
    `${market.name} ${startLabel}부터 ${endLabel}까지 1시간 가격 차트. 기간 변화 ${signed(periodChange)}퍼센트`
  );

  const compact = width < 560;
  const padding = compact
    ? { top: 18, right: 14, bottom: 44, left: 54 }
    : { top: 20, right: 22, bottom: 48, left: 68 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = series.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin;
  const margin = rawRange > 0 ? rawRange * 0.12 : Math.max(0.01, rawMax * 0.006);
  const min = rawMin - margin;
  const max = rawMax + margin;
  const range = max - min;
  const lineColor =
    direction === "up" ? "#087b6d" : direction === "down" ? "#d1493f" : "#51636e";
  const areaTop =
    direction === "up" ? "rgba(8, 123, 109, 0.24)" : direction === "down" ? "rgba(209, 73, 63, 0.22)" : "rgba(81, 99, 110, 0.17)";
  const haloColor =
    direction === "up" ? "rgba(8, 123, 109, 0.18)" : direction === "down" ? "rgba(209, 73, 63, 0.18)" : "rgba(81, 99, 110, 0.16)";

  context.save();
  context.strokeStyle = "rgba(92, 111, 121, 0.16)";
  context.fillStyle = "#74828b";
  context.lineWidth = 1;
  context.setLineDash([3, 6]);
  context.font = `${compact ? "600 10px" : "600 11px"} Inter, system-ui, sans-serif`;

  for (let index = 0; index < 5; index += 1) {
    const y = padding.top + (plotHeight / 4) * index;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    const labelValue = max - (range / 4) * index;
    context.textAlign = "right";
    context.fillText(compactFormatter.format(labelValue), padding.left - 10, y + 4);
  }

  const timeTickCount = compact ? 3 : width < 820 ? 4 : 5;
  for (let index = 0; index < timeTickCount; index += 1) {
    const ratio = index / (timeTickCount - 1);
    const x = padding.left + plotWidth * ratio;
    context.beginPath();
    context.moveTo(x, padding.top);
    context.lineTo(x, height - padding.bottom);
    context.stroke();

    const tickIndex = Math.min(series.length - 1, Math.round((series.length - 1) * ratio));
    const tickTime = series[tickIndex].time;
    context.fillStyle = "#74828b";
    context.textAlign = index === 0 ? "left" : index === timeTickCount - 1 ? "right" : "center";
    context.fillText(
      chartAxisTimeFormatter.format(tickTime),
      x,
      height - 13
    );
  }
  context.restore();

  const coordinates = series.map((point, index) => {
    const x = padding.left + (index / (series.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((point.value - min) / range) * plotHeight;
    return { x, y };
  });

  const baselineY =
    padding.top + plotHeight - ((firstPoint.value - min) / range) * plotHeight;
  context.save();
  context.strokeStyle = "rgba(183, 131, 33, 0.66)";
  context.lineWidth = 1;
  context.setLineDash([6, 5]);
  context.beginPath();
  context.moveTo(padding.left, baselineY);
  context.lineTo(width - padding.right, baselineY);
  context.stroke();
  context.fillStyle = "#9a742b";
  context.font = "700 10px Inter, system-ui, sans-serif";
  context.textAlign = "right";
  context.fillText(
    "조회 시작",
    width - padding.right,
    Math.max(padding.top + 11, baselineY - 7)
  );
  context.restore();

  const area = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  area.addColorStop(0, areaTop);
  area.addColorStop(0.72, direction === "up" ? "rgba(8, 123, 109, 0.07)" : direction === "down" ? "rgba(209, 73, 63, 0.07)" : "rgba(81, 99, 110, 0.05)");
  area.addColorStop(1, "rgba(255, 255, 255, 0)");

  const coordinateSegments = [];
  let currentSegment = [];
  coordinates.forEach((point, index) => {
    const previousTime = series[index - 1]?.time.getTime();
    const currentTime = series[index].time.getTime();
    if (index > 0 && currentTime - previousTime > 2.5 * 60 * 60 * 1000) {
      if (currentSegment.length) coordinateSegments.push(currentSegment);
      currentSegment = [];
    }
    currentSegment.push(point);
  });
  if (currentSegment.length) coordinateSegments.push(currentSegment);

  context.fillStyle = area;
  coordinateSegments.forEach((segment) => {
    if (segment.length < 2) return;
    context.beginPath();
    segment.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.lineTo(segment.at(-1).x, height - padding.bottom);
    context.lineTo(segment[0].x, height - padding.bottom);
    context.closePath();
    context.fill();
  });

  context.save();
  context.strokeStyle = lineColor;
  context.lineWidth = compact ? 2.5 : 3;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.shadowColor = haloColor;
  context.shadowBlur = 11;
  context.shadowOffsetY = 3;
  coordinateSegments.forEach((segment) => {
    if (segment.length < 2) return;
    context.beginPath();
    segment.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.stroke();
  });
  context.restore();

  const maximumIndex = values.indexOf(rawMax);
  const minimumIndex = values.indexOf(rawMin);
  drawChartExtremum(context, coordinates[maximumIndex], "고점", rawMax, "#b78321", width, padding, !compact);
  if (minimumIndex !== maximumIndex) {
    drawChartExtremum(context, coordinates[minimumIndex], "저점", rawMin, "#667781", width, padding, !compact);
  }

  const last = coordinates.at(-1);
  context.beginPath();
  context.arc(last.x, last.y, compact ? 7 : 8.5, 0, Math.PI * 2);
  context.fillStyle = haloColor;
  context.fill();
  context.beginPath();
  context.arc(last.x, last.y, compact ? 4.2 : 4.8, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();
  context.beginPath();
  context.arc(last.x, last.y, compact ? 2.6 : 3, 0, Math.PI * 2);
  context.fillStyle = lineColor;
  context.fill();

  chartRenderState = {
    series,
    coordinates,
    market,
    padding,
    width,
    height,
    plotHeight,
    firstValue: firstPoint.value,
    lineColor
  };
}

function formatChartPointValue(market, value) {
  const formatted = formatter.format(value);
  return market.unit === "KRW" ? `${formatted}원` : formatted;
}

function drawChartExtremum(context, point, label, value, color, width, padding, showLabel) {
  if (!point) return;
  context.save();
  context.beginPath();
  context.arc(point.x, point.y, 3.2, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();
  context.lineWidth = 1.8;
  context.strokeStyle = color;
  context.stroke();

  if (showLabel) {
    const alignRight = point.x > width - 150;
    const labelX = point.x + (alignRight ? -9 : 9);
    const labelY = point.y < padding.top + 28 ? point.y + 20 : point.y - 10;
    context.fillStyle = color;
    context.font = "750 10px Inter, system-ui, sans-serif";
    context.textAlign = alignRight ? "right" : "left";
    context.fillText(`${label} ${compactFormatter.format(value)}`, labelX, labelY);
  }
  context.restore();
}

function handleChartPointer(event) {
  const chart = chartRenderState;
  if (!chart || !chart.coordinates.length) return;

  const canvasRect = elements.marketChart.getBoundingClientRect();
  const localX = event.clientX - canvasRect.left;
  const localY = event.clientY - canvasRect.top;
  const inPlot =
    localX >= chart.padding.left &&
    localX <= chart.width - chart.padding.right &&
    localY >= chart.padding.top &&
    localY <= chart.height - chart.padding.bottom;

  if (!inPlot && event.pointerType === "mouse") {
    hideChartTooltip();
    return;
  }

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  chart.coordinates.forEach((point, index) => {
    const distance = Math.abs(point.x - localX);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  showChartTooltip(closestIndex);
}

function showChartTooltip(index) {
  const chart = chartRenderState;
  const point = chart?.coordinates[index];
  const datum = chart?.series[index];
  if (!chart || !point || !datum) return;

  const wrapRect = elements.chartCanvasWrap.getBoundingClientRect();
  const canvasRect = elements.marketChart.getBoundingClientRect();
  const offsetX = canvasRect.left - wrapRect.left;
  const offsetY = canvasRect.top - wrapRect.top;
  const left = offsetX + point.x;
  const top = offsetY + point.y;
  const changeFromStart = chart.firstValue
    ? ((datum.value - chart.firstValue) / chart.firstValue) * 100
    : 0;
  const direction =
    changeFromStart > 0.005 ? "up" : changeFromStart < -0.005 ? "down" : "flat";

  elements.chartHoverLine.hidden = false;
  elements.chartHoverLine.style.left = `${left}px`;
  elements.chartHoverLine.style.top = `${offsetY + chart.padding.top}px`;
  elements.chartHoverLine.style.height = `${chart.plotHeight}px`;

  elements.chartHoverDot.hidden = false;
  elements.chartHoverDot.style.left = `${left}px`;
  elements.chartHoverDot.style.top = `${top}px`;
  elements.chartHoverDot.style.backgroundColor = chart.lineColor;

  elements.chartTooltip.hidden = false;
  elements.chartTooltip.dataset.side = left > wrapRect.width * 0.68 ? "left" : "right";
  elements.chartTooltip.style.left = `${left}px`;
  elements.chartTooltip.style.top = `${Math.max(58, Math.min(wrapRect.height - 58, top))}px`;
  elements.chartTooltip.innerHTML = `
    <span>${escapeHtml(chartTooltipTimeFormatter.format(datum.time))}</span>
    <strong>${escapeHtml(formatChartPointValue(chart.market, datum.value))}</strong>
    <em data-direction="${direction}">조회 시작 대비 ${signed(changeFromStart)}%</em>
  `;
}

function hideChartTooltip() {
  elements.chartHoverLine.hidden = true;
  elements.chartHoverDot.hidden = true;
  elements.chartTooltip.hidden = true;
}
function setConnection(stateName, label) {
  elements.connectionStatus.dataset.state = stateName;
  elements.connectionStatus.querySelector("span:last-child").textContent = label;
}

function updateConnectionStatus(snapshot) {
  const quality = snapshot.dataQuality;
  const missingCount = quality?.missingMarketIds?.length || 0;
  const liveCount = snapshot.markets.filter((market) => market.live).length;
  if (missingCount > 0) {
    setConnection("partial", "일부 데이터");
  } else if (liveCount === snapshot.markets.length && liveCount > 0) {
    setConnection("live", "실시간");
  } else if (liveCount > 0) {
    setConnection("partial", "일부 실시간");
  } else {
    setConnection("closed", "마감 기준");
  }
}

function getMarketStatusLabel(market) {
  if (market?.status === "stale") return "이전";
  return market?.live ? "실시간" : "마감";
}

function getLatestMarketTimestamp(snapshot) {
  const times = (snapshot.markets || [])
    .map((market) => new Date(market.asOf))
    .filter((date) => Number.isFinite(date.getTime()));
  if (!times.length) return null;
  return new Date(Math.max(...times.map((date) => date.getTime())));
}

function renderDataUnavailable() {
  elements.regimeTitle.textContent = "데이터 연결 확인 필요";
  elements.pulseText.textContent = "실제 시장 시세를 불러오지 못했습니다. 임의의 대체 숫자는 표시하지 않습니다.";
  elements.updatedAt.textContent = "기준시각 없음";
  elements.updatedAt.removeAttribute("datetime");
  elements.sourceLine.textContent = "잠시 후 새로고침하면 다시 확인합니다.";
  elements.riskScore.textContent = "--";
  elements.riskMeter.style.strokeDashoffset = 314;
  elements.riskMeter.style.stroke = "#cbd5db";
  elements.watchChips.replaceChildren();
  elements.riskDrivers.replaceChildren();
  elements.riskLegend.replaceChildren();
  elements.marketStrip.innerHTML = `
    <div class="market-unavailable">
      <strong>시장 데이터를 가져오지 못했습니다.</strong>
      <span>실제 시세 연결이 복구되면 자동으로 다시 표시됩니다.</span>
    </div>
  `;
  elements.briefBoard.innerHTML = `
    <div class="data-unavailable-panel">
      <strong>분석을 잠시 멈췄습니다.</strong>
      <p>신뢰할 수 있는 시장 데이터가 없는 상태에서는 위험 온도와 시장 해석을 만들지 않습니다.</p>
    </div>
  `;
}
function renderSignalRow(label, value, interpretation, tone = "neutral") {
  return `
    <div class="signal-row" role="row" data-tone="${tone}">
      <span role="cell">${label}</span>
      <strong role="cell">${value}</strong>
      <em role="cell">${interpretation}</em>
    </div>
  `;
}

function renderImpactCard(label, value, detail, tone = "neutral") {
  return `
    <article class="impact-card" data-tone="${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>${detail}</p>
    </article>
  `;
}

function renderScenarioCard(label, weight, condition, detail, tone) {
  return `
    <article class="scenario-card" data-tone="${tone}">
      <div class="scenario-card-head">
        <span>${label}</span>
        <strong>${weight}%</strong>
      </div>
      <div class="scenario-bar" aria-label="${label} 해석 비중 ${weight}%">
        <span style="width: ${weight}%"></span>
      </div>
      <h4>${condition}</h4>
      <p>${detail}</p>
    </article>
  `;
}

function buildLocalNewsAnalysis(headline, marketAnalysis = {}) {
  const text = `${headline.title || ""} ${headline.topic || ""}`;
  const hasRates = /금리|연준|Fed|채권|물가|inflation|CPI|yield/i.test(text);
  const hasFx = /환율|달러|원화|위안|엔화|dollar/i.test(text);
  const hasChips = /반도체|chip|semiconductor|AI|기술주/i.test(text);
  const hasEnergy = /유가|원유|OPEC|중동|전쟁|oil|WTI/i.test(text);
  const hasChina = /중국|China|수출|무역|export/i.test(text);
  const negativeCount = (text.match(/급락|폭락|경고|둔화|위기|부담|전쟁|하락/gi) || []).length;
  const positiveCount = (text.match(/호조|회복|돌파|개선|완화|상승|증가/gi) || []).length;
  const tone = negativeCount > positiveCount ? "negative" : positiveCount > negativeCount ? "positive" : "watch";
  const signal = tone === "negative" ? "경계 신호" : tone === "positive" ? "개선 가능성" : "혼합 신호";
  const themes = [
    hasRates && "금리·물가",
    hasFx && "환율",
    hasChips && "반도체",
    hasEnergy && "에너지·지정학",
    hasChina && "중국·수출"
  ].filter(Boolean);
  const themeText = themes.join(", ") || "시장 심리";
  const checkpoints = [
    hasFx ? "원/달러가 기사 방향과 같은 쪽으로 움직이는지" : "원/달러와 외국인 수급 반응",
    hasRates ? "미국 장기금리와 성장주 반응" : hasChips ? "NASDAQ과 한국 반도체 대형주 반응" : "KOSPI와 S&P 500의 실제 등락",
    hasEnergy ? "WTI가 추가 상승하는지" : hasChina ? "중국 수요와 한국 수출 지표" : "후속 기사와 원문 수치"
  ];

  return {
    signal,
    tone,
    confidence: "낮음",
    engineLabel: "헤드라인 기반 자동 요약",
    contentBasis: "headline",
    marketContextBasis: "current",
    marketContextAt: null,
    relatedSourceCount: Number(headline.relatedSourceCount) || 1,
    summary: `이 헤드라인은 ${themeText} 변수가 현재 ${marketAnalysis.regime || "시장"} 흐름에 어떤 영향을 주는지 확인해야 하는 기사입니다. 제목의 방향보다 실제 환율·금리·주가 반응이 더 중요합니다.`,
    whyItMatters: hasRates
      ? "금리와 물가는 기업 가치평가, 채권금리, 달러를 동시에 움직여 여러 자산에 파급될 수 있습니다."
      : hasEnergy
        ? "에너지와 지정학 변수는 물가 기대와 기업 비용을 동시에 바꿔 중앙은행 기대까지 흔들 수 있습니다."
        : hasChips
          ? "반도체는 한국 수출과 KOSPI 대형주의 이익 기대에 직접 연결되는 비중이 큰 변수입니다."
          : "헤드라인이 반복 보도되면 투자자의 기대가 바뀌고 가격 변동성이 커질 수 있습니다.",
    marketImpact: hasFx
      ? "달러와 채권금리, 한국 주식의 외국인 수급을 같이 봐야 합니다. 환율만 움직이고 주가가 버티면 충격은 제한적일 수 있습니다."
      : hasRates
        ? "금리 상승은 성장주에 부담이고 금융주에는 혼합 요인입니다. 지수보다 업종별 차이가 커질 수 있습니다."
        : hasEnergy
          ? "유가 상승은 에너지 업종에는 호재가 될 수 있지만 운송·화학·소비에는 비용 부담입니다."
          : "기사 발표 뒤 주가, 변동성, 거래량이 같은 방향으로 움직이는지 확인해야 신호의 강도를 판단할 수 있습니다.",
    koreaImpact: hasChips || hasChina
      ? "한국에서는 반도체 수출, 중국 수요, 원/달러가 함께 움직이는지가 핵심입니다. 수출 호재라도 환율 급등과 외국인 매도가 겹치면 지수 반응은 약할 수 있습니다."
      : hasRates || hasFx
        ? "한국은 대외금리와 환율 변화에 민감합니다. 원화 약세가 길어지면 외국인 수급과 수입물가, 금리 인하 여력에 부담이 됩니다."
        : "한국 시장에서는 대형 수출주와 원/달러, 외국인 순매수 반응을 통해 영향이 실제로 전달되는지 확인합니다.",
    checkpoints,
    limitation: "원문을 가져오지 못해 헤드라인과 현재 가격을 연결한 낮은 신뢰도의 1차 요약입니다. 기사 원문, 발표 시점, 기저효과와 이미 가격에 반영됐는지를 반드시 함께 확인하세요."
  };
}

function safeNewsUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMarketValue(market) {
  const value = formatter.format(Number(market.value));
  return market.unit === "KRW" ? `${value}원` : `${value}`;
}

function getMarketReason(market) {
  const movement =
    Math.abs(market.changePercent) >= 1
      ? `${market.name} 변동폭이 커져 단기 해석 비중이 높습니다.`
      : `${market.name} 변동폭은 제한적이지만 다른 지표와 같이 봐야 합니다.`;
  const reasonMap = {
    kospi: {
      title: "한국 대표 위험자산",
      detail: `${movement} KOSPI는 외국인 수급, 반도체 업황, 환율 변화가 한꺼번에 반영되는 대표 지표입니다.`
    },
    kosdaq: {
      title: "성장주 민감도",
      detail: `${movement} KOSDAQ은 금리와 유동성 기대에 민감해 위험선호 회복 여부를 확인하는 데 유용합니다.`
    },
    usdkrw: {
      title: "한국 시장의 압력계",
      detail: `${movement} 원/달러가 오르면 외국인 환차손 우려와 수입물가 부담이 커질 수 있습니다.`
    },
    sp500: {
      title: "글로벌 위험선호 기준선",
      detail: `${movement} S&P 500은 전 세계 주식자금의 기준점이라 한국 증시에도 다음 거래일 심리로 이어지기 쉽습니다.`
    },
    nasdaq: {
      title: "기술주와 반도체 온도",
      detail: `${movement} NASDAQ 흐름은 한국 반도체와 성장주 투자심리에 직접 연결되는 경우가 많습니다.`
    },
    vix: {
      title: "공포와 헤지 수요",
      detail: `${movement} VIX가 높아지면 투자자들이 주식보다 현금, 달러, 채권 같은 방어 자산을 선호할 가능성이 커집니다.`
    },
    wti: {
      title: "물가와 비용 압력",
      detail: `${movement} 유가는 물류비, 정유/화학 마진, 물가 기대를 통해 한국 기업 실적에 영향을 줍니다.`
    },
    gold: {
      title: "안전자산 선호",
      detail: `${movement} 금 가격은 달러, 실질금리, 지정학 리스크에 반응해 시장의 방어 심리를 보여줍니다.`
    }
  };

  return {
    title: reasonMap[market.id]?.title || "시장 신호",
    detail: reasonMap[market.id]?.detail || movement
  };
}

function buildDailyFlowFallback(analysis) {
  return {
    title: "오늘 흐름이 이렇게 보이는 이유",
    lead: analysis.pulse || "시장 가격과 뉴스 흐름을 함께 보며 오늘의 방향성을 해석합니다.",
    paragraphs: analysis.bullets || [],
    conclusion: "다음 흐름은 환율, 변동성, 미국 증시가 같은 방향으로 움직이는지 확인하는 것이 핵심입니다.",
    chapters: buildChapterFallback(analysis),
    detailedSections: []
  };
}

function buildChapterFallback(analysis, dailyFlow = {}) {
  return [
    {
      label: "01",
      title: "현재 판세",
      summary: `${analysis.regime || "흐름 확인"} 구간입니다.`
    },
    {
      label: "02",
      title: "핵심 원인",
      summary: dailyFlow.lead || analysis.pulse || "가격과 뉴스 신호가 방향을 만들고 있습니다."
    },
    {
      label: "03",
      title: "한국 영향",
      summary: "환율, 외국인 수급, 반도체 흐름을 같이 봐야 합니다."
    },
    {
      label: "04",
      title: "다음 체크",
      summary: analysis.watchlist?.[0] || "환율과 변동성이 같은 방향인지 확인해야 합니다."
    }
  ];
}

function buildDetailedFallback(dailyFlow) {
  const paragraphs = dailyFlow.paragraphs || [];
  if (!paragraphs.length) {
    return [
      {
        title: "1. 전체 흐름",
        body: dailyFlow.lead || "시장 흐름을 확인하는 중입니다."
      }
    ];
  }
  return paragraphs.map((paragraph, index) => ({
    title: `${index + 1}. 분석 포인트`,
    body: paragraph
  }));
}

function getMacroReason(item) {
  const reasons = {
    "base-rate": "기준금리는 예금, 대출, 부동산, 성장주 밸류에이션의 할인율 역할을 합니다.",
    cpi: "소비자물가는 금리 인하 기대와 실질 구매력을 판단하는 핵심 지표입니다.",
    exports: "수출은 한국 경기와 기업 이익의 선행 신호로 자주 쓰입니다.",
    "household-credit": "가계신용은 소비 여력과 금융 안정성을 동시에 보여주는 부담 지표입니다."
  };
  return reasons[item.id] || "이 지표는 한국 경기와 금융 환경을 해석하는 보조 근거입니다.";
}

function getTopicMeaning(topic) {
  if (/정책·지표/i.test(topic)) {
    return "금리·물가·성장률 발표가 기존 시장 기대를 바꾸는지 봅니다.";
  }
  if (/산업·기업/i.test(topic)) {
    return "실적과 투자 계획이 한국 수출 및 대형주 이익으로 이어지는지 봅니다.";
  }
  if (/부동산·가계/i.test(topic)) {
    return "대출 부담과 소비 여력, 금융 안정성의 변화를 확인합니다.";
  }
  if (/한국|Korea|국내/i.test(topic)) {
    return "환율, 수출, 외국인 수급으로 이어지는지 봅니다.";
  }
  if (/미국|Fed/i.test(topic)) {
    return "연준·물가·고용이 달러와 글로벌 위험선호를 바꾸는지 봅니다.";
  }
  if (/중국|아시아|China/i.test(topic)) {
    return "중국 수요와 위안·엔화가 한국 수출주에 미치는 영향을 봅니다.";
  }
  if (/유럽|세계|글로벌|ECB/i.test(topic)) {
    return "유럽 금리와 세계 성장·무역 흐름의 변화를 확인합니다.";
  }
  if (/원자재|환율|에너지|유가|oil|WTI/i.test(topic)) {
    return "유가·달러·운임이 국내 물가와 기업 비용으로 번지는지 봅니다.";
  }
  if (/반도체|기술|Tech|AI|chip/i.test(topic)) {
    return "한국 대형주와 성장주 심리에 직접 연결됩니다.";
  }
  return "가격 지표와 함께 방향성을 확인하는 보조 재료입니다.";
}

function signed(value) {
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${formatter.format(number)}`;
}

function riskColor(score) {
  if (score >= 66) return "#dc2626";
  if (score >= 45) return "#b45309";
  return "#15803d";
}

function relativeTime(value) {
  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (diffMinutes < 60) return `${diffMinutes || 1}분 전`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.round(diffHours / 24)}일 전`;
}

