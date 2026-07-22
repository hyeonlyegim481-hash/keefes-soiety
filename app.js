import {
  glossaryCategoryOrder as coreGlossaryCategories,
  glossaryTerms as coreGlossaryTerms
} from "./glossary-data.js?v=73";
import {
  glossaryExtraCategories,
  glossaryExtraTerms
} from "./glossary-extra-data.js?v=73";
import {
  glossaryMoreCategories,
  glossaryMoreTerms
} from "./glossary-more-data.js?v=73";
import {
  glossaryProCategories,
  glossaryProTerms
} from "./glossary-pro-data.js?v=73";
import { glossarySpecialTerms } from "./glossary-special-data.js?v=73";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js?v=73";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js?v=73";
import { buildMasterGlossary } from "./glossary-master-data.js?v=73";
import { scenarioQuestions as baseScenarioQuestions } from "./quiz-data.js?v=73";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js?v=73";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js?v=73";
import { historyEras, historyEvents, historyPatterns } from "./history-data.js?v=73";
import { historyDeepDives, historyEraDetails } from "./history-detail-data.js?v=73";
import { historyEraProfiles, historyEventPerspectives } from "./history-reading-data.js?v=73";
import {
  indicatorCategories as baseIndicatorCategories,
  indicatorCountries,
  indicatorDefinitions as baseIndicatorDefinitions
} from "./indicator-data.js?v=73";
import {
  financeIndicatorCategories,
  financeIndicatorDefinitions
} from "./indicator-finance-data.js?v=73";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js?v=73";
import { indicatorSnapshot } from "./indicator-values.js?v=73";
import { resourceProductionIndicators } from "./resource-production-data.js?v=73";
import {
  bindResourceProductionDetail,
  formatProductionExact,
  renderResourceProductionDetail
} from "./resource-production-ui.js?v=73";
import { buildEconomicNarrative, getMarketDeepRead } from "./economic-narrative.js?v=73";
import { initFutureIndustryChapter } from "./future-industry-ui.js?v=73";
import { initResourceLibraryChapter } from "./resource-library-ui.js?v=73";
import { economicRelationships } from "./relationship-data.js?v=73";

const scenarioQuestions = [...baseScenarioQuestions, ...extraScenarioQuestions, ...moreScenarioQuestions];
const indicatorCategories = [...baseIndicatorCategories, ...financeIndicatorCategories];
const indicatorDefinitions = [
  ...baseIndicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions
];
const allIndicatorDefinitions = [...indicatorDefinitions, ...resourceProductionIndicators];
const glossaryCategoryOrder = [
  ...coreGlossaryCategories,
  ...glossaryExtraCategories,
  ...glossaryMoreCategories,
  ...glossaryProCategories
];
const glossarySeedTerms = [
  ...coreGlossaryTerms,
  ...glossaryCoreExtraTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms,
  ...glossaryExpandedTerms
];
const masterGlossary = buildMasterGlossary(glossarySeedTerms);
const glossaryTerms = [
  ...coreGlossaryTerms.map((item) => ({ ...item, level: "core" })),
  ...glossaryCoreExtraTerms.map((item) => ({ ...item, level: "core" })),
  ...masterGlossary.core.map((item) => ({ ...item, level: "core" })),
  ...glossaryExtraTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossaryMoreTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossaryProTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossarySpecialTerms.map((item) => ({ ...item, level: "advanced" })),
  ...glossaryExpandedTerms.map((item) => ({ ...item, level: "advanced" })),
  ...masterGlossary.advanced.map((item) => ({ ...item, level: "advanced" }))
];
const glossaryTermsByCategory = glossaryTerms.reduce((groups, item) => {
  const categoryTerms = groups.get(item.category) || [];
  categoryTerms.push(item);
  groups.set(item.category, categoryTerms);
  return groups;
}, new Map());

const GLOSSARY_PAGE_SIZE = 24;
const SNAPSHOT_STORAGE_KEY = "keefes-soiety.snapshot.v1";
const SNAPSHOT_STORAGE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

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
const initialParameters = new URLSearchParams(window.location.search);
const initialChapter = initialParameters.get("chapter") || "brief";
const requestedIndicator = initialParameters.get("indicator");
const initialIndicator = allIndicatorDefinitions.some((indicator) => indicator.id === requestedIndicator)
  ? requestedIndicator
  : "fertility";
let swipeStart = null;
let chartRenderState = null;

let state = {
  snapshot: null,
  narrative: null,
  selectedMarket: "kospi",
  isRefreshing: false,
  activeChapter: initialChapter,
  historyEra: "overview",
  indicatorCategory: initialIndicator.startsWith("production-") ? "resources" : "all",
  indicatorQuery: "",
  selectedIndicatorId: initialIndicator,
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
  newsSection: "all",
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
  const url = new URL(window.location.href);
  url.searchParams.set("indicator", state.selectedIndicatorId);
  history.replaceState(null, "", url);
  renderIndicators();
  revealSelectedIndicatorTrend();
});


function revealSelectedIndicatorTrend() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const trendSection = elements.indicatorDetail.querySelector(".resource-map-section, .indicator-trend-section");
      if (!trendSection) return;

      const rect = trendSection.getBoundingClientRect();
      const topGuard = Math.min(150, window.innerHeight * 0.2);
      const isVisible = rect.top >= topGuard && rect.bottom <= window.innerHeight - 24;
      if (isVisible) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      trendSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: rect.height + topGuard < window.innerHeight ? "center" : "start",
        inline: "nearest"
      });
      trendSection.classList.add("is-revealed");
      window.setTimeout(() => trendSection.classList.remove("is-revealed"), 1100);
    });
  });
}

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
    .register("/sw.js?v=73")
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

initFutureIndustryChapter({ updateHeight: updateChapterHeight });
initResourceLibraryChapter({ updateHeight: updateChapterHeight });
renderIndicators();
setActiveChapter(state.activeChapter, { skipAnimation: true });
queueMicrotask(() => {
  const restoredSnapshot = restoreStoredSnapshot();
  if (restoredSnapshot) {
    state.snapshot = restoredSnapshot;
    render(restoredSnapshot);
    setConnection("stale", "저장 데이터");
  }
  refreshSnapshot();
  setInterval(() => {
    if (document.visibilityState === "visible") refreshSnapshot();
  }, 60_000);
});

async function refreshSnapshot({ force = false } = {}) {
  if (state.isRefreshing) return;
  state.isRefreshing = true;
  setConnection("loading", "업데이트");

  try {
    const snapshot = await fetchSnapshot();
    state.snapshot = snapshot;
    storeSnapshot(snapshot);
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

async function fetchSnapshot() {
  const response = await fetch("/api/snapshot", {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000)
  });
  if (!response.ok) throw new Error(`Snapshot failed: ${response.status}`);

  const snapshot = await response.json();
  if (!Array.isArray(snapshot?.markets) || !snapshot.markets.length) {
    throw new Error("Snapshot has no market data");
  }
  return snapshot;
}

function restoreStoredSnapshot() {
  try {
    const stored = JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || "null");
    if (
      !stored?.savedAt ||
      Date.now() - stored.savedAt > SNAPSHOT_STORAGE_MAX_AGE_MS ||
      !Array.isArray(stored.snapshot?.markets) ||
      !stored.snapshot.markets.length
    ) {
      localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
      return null;
    }
    return {
      ...stored.snapshot,
      markets: stored.snapshot.markets.map((market) => ({
        ...market,
        live: false,
        status: "stale"
      }))
    };
  } catch {
    try {
      localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
    } catch {
      // Ignore storage access errors.
    }
    return null;
  }
}

function storeSnapshot(snapshot) {
  try {
    localStorage.setItem(
      SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), snapshot })
    );
  } catch {
    // Storage can be unavailable in private browsing or when the quota is full.
  }
}

function render(snapshot) {
  const narrative = buildEconomicNarrative(snapshot);
  state.narrative = narrative;
  renderSummary(snapshot, narrative);
  renderBriefBoard(snapshot, narrative);
  renderMarkets(snapshot.markets);
  renderTabs(snapshot.markets);
  renderMarketBrief(snapshot.markets);
  renderMarketBoard(snapshot.markets);
  renderMarketConnections(snapshot.markets, snapshot.analysis);
  renderAnalysis(snapshot, narrative);
  renderMacro(snapshot.macro, snapshot.analysis, narrative);
  renderIndicators();
  renderStudy(snapshot);
  renderHistory(snapshot);
  renderGlossary();
  renderQuiz();
  renderNews(snapshot.headlines, snapshot.analysis, snapshot.dataQuality);
  drawChart();
  setActiveChapter(state.activeChapter, { skipAnimation: true });
}

function renderSummary(snapshot, narrative = state.narrative) {
  const { analysis } = snapshot;
  elements.regimeTitle.textContent = narrative?.heroTitle || analysis.regime;
  elements.pulseText.textContent = narrative?.plainSummary || analysis.pulse;
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

function renderBriefBoard(snapshot, narrative = state.narrative) {
  const { analysis } = snapshot;
  const tone = analysis.riskScore >= 66 ? "negative" : analysis.riskScore >= 45 ? "watch" : "positive";
  const reasons = narrative?.coreReasons || [];
  const breadth = narrative?.breadth || { rising: 0, falling: 0, total: snapshot.markets.length };

  elements.briefBoard.innerHTML = `
    <section class="explain-hero" data-tone="${tone}">
      <header>
        <span>30초 이해</span>
        <em>위험 온도 <strong>${analysis.riskScore}</strong>/100 · ${escapeHtml(narrative?.riskBand || analysis.regime)}</em>
      </header>
      <h3>${escapeHtml(narrative?.title || analysis.regime)}</h3>
      <p>${escapeHtml(narrative?.meaning || analysis.pulse)}</p>
    </section>

    <section class="reason-ledger" aria-label="오늘의 흐름을 만든 이유">
      <div class="board-heading">
        <div>
          <p class="section-kicker">숫자에서 결론까지</p>
          <h3>왜 이렇게 해석하는가</h3>
        </div>
        <span>사실 → 의미</span>
      </div>
      <ol class="cause-list">
        ${reasons
          .map(
            (item, index) => `
              <li data-tone="${item.tone || "neutral"}">
                <span class="cause-number">${String(index + 1).padStart(2, "0")}</span>
                <div class="cause-fact">
                  <em>확인된 숫자</em>
                  <strong>${escapeHtml(item.label)}</strong>
                  <b>${escapeHtml(item.fact)}</b>
                </div>
                <span class="cause-arrow" aria-hidden="true">→</span>
                <div class="cause-meaning">
                  <em>쉽게 말하면</em>
                  <p>${escapeHtml(item.meaning)}</p>
                  <small>${escapeHtml(item.confidence)}</small>
                </div>
              </li>
            `
          )
          .join("")}
      </ol>
    </section>

    <section class="brief-two-up">
      <div>
        <span>한국에서 중요한 뜻</span>
        <strong>${escapeHtml(narrative?.korea?.title || "환율과 수출을 함께 확인합니다.")}</strong>
        <p>${escapeHtml(narrative?.korea?.summary || "")}</p>
      </div>
      <div>
        <span>다음에 확인할 것</span>
        <ul>
          ${(narrative?.nextChecks || analysis.watchlist || [])
            .slice(0, 4)
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>
    </section>

    <footer class="brief-verdict-bar">
      <div>
        <span>시장 폭</span>
        <strong>${breadth.rising}/${breadth.total}개 상승</strong>
        <em>상승 ${breadth.rising} · 하락 ${breadth.falling}</em>
      </div>
      <div>
        <span>오늘의 결론</span>
        <strong>${escapeHtml(narrative?.heroTitle || analysis.regime)}</strong>
        <em>한 지표가 아니라 교차 신호 기준</em>
      </div>
      <button type="button" data-open-chapter="analysis">근거 전체 보기 <span aria-hidden="true">→</span></button>
    </footer>
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

  const selectedTab = [...elements.chapterTabs].find((tab) => tab.dataset.chapter === nextChapter);
  requestAnimationFrame(() => {
    const chapterNav = selectedTab?.parentElement;
    if (!selectedTab || !chapterNav) return;
    const navRect = chapterNav.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const targetLeft = chapterNav.scrollLeft
      + (tabRect.left - navRect.left)
      - (chapterNav.clientWidth - tabRect.width) / 2;
    chapterNav.scrollTo({ left: Math.max(0, targetLeft), behavior: skipAnimation ? "auto" : "smooth" });
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

  const read = getMarketDeepRead(selected, markets, state.narrative);
  const statusLabel = getMarketStatusLabel(selected);
  const basisLabel = selected.asOf
    ? marketTimeFormatter.format(new Date(selected.asOf))
    : "기준시각 없음";

  elements.marketBrief.innerHTML = `
    <section class="market-readable" data-tone="${escapeHtml(read.tone || "neutral")}">
      <header class="market-read-head">
        <div>
          <span>지금 선택한 지표</span>
          <strong>${escapeHtml(selected.name)} ${escapeHtml(formatMarketValue(selected))}</strong>
          <em class="${selected.direction === "up" ? "up" : "down"}">${escapeHtml(signed(selected.changePercent))}%</em>
        </div>
        <p>${escapeHtml(statusLabel)} · ${escapeHtml(basisLabel)}</p>
      </header>
      <div class="market-explain-grid">
        <article>
          <span>이 숫자는 무엇인가</span>
          <p>${escapeHtml(read.definition)}</p>
        </article>
        <article>
          <span>오늘 얼마나 움직였나</span>
          <p>${escapeHtml(read.movement)}</p>
        </article>
        <article>
          <span>쉽게 해석하면</span>
          <p>${escapeHtml(read.interpretation)}</p>
        </article>
      </div>
      <aside class="market-caution">
        <strong>이 숫자만 보고 단정하면 안 되는 것</strong>
        <p>${escapeHtml(read.caution)}</p>
      </aside>
    </section>
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
          const read = getMarketDeepRead(market, markets, state.narrative);
          const isSelected = market.id === state.selectedMarket;
          return `
            <button class="market-mini-card" type="button" data-market-id="${market.id}" aria-pressed="${isSelected}">
              <span>${market.group === "korea" ? "한국" : "글로벌"}</span>
              <strong>${market.name}</strong>
              <em class="${market.direction === "up" ? "up" : "down"}">${formatMarketValue(market)} · ${signed(market.changePercent)}%</em>
              <p>${escapeHtml(read.interpretation)}</p>
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
  const selected = markets.find((market) => market.id === state.selectedMarket) || markets[0];
  const read = getMarketDeepRead(selected, markets, state.narrative);
  const tensions = state.narrative?.tensions || [];

  elements.marketConnections.innerHTML = `
    <section class="expansion-section cross-reading">
      <div class="board-heading">
        <div>
          <p class="section-kicker">한 지표를 세 지표로 검증</p>
          <h3>${escapeHtml(selected?.name || "시장")} 해석이 맞는지 확인하는 법</h3>
        </div>
        <span>교차 확인 ${read.checks.length}개</span>
      </div>
      <div class="cross-check-list">
        ${read.checks
          .map(
            (item, index) => `
              <article data-tone="${escapeHtml(item.tone || "neutral")}">
                <span>확인 ${index + 1}</span>
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <em>${escapeHtml(item.value)}</em>
                </div>
                <p>${escapeHtml(item.question)}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="market-context-band">
        <span>시장 전체 결론</span>
        <strong>${escapeHtml(read.overallContext)}</strong>
        <em>위험 온도 ${escapeHtml(String(analysis.riskScore))}/100</em>
      </div>
      <div class="tension-list">
        <strong>결론을 서두르면 안 되는 반대 신호</strong>
        ${tensions.slice(0, 3).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </div>
      <p class="data-caveat">지표가 같은 시간에 움직였다는 사실만으로 원인과 결과가 확정되지는 않습니다. 교차 지표는 해석을 검증하는 단서입니다.</p>
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

function renderAnalysis(snapshot, narrative = state.narrative) {
  const analysis = snapshot?.analysis || {};
  const facts = narrative?.facts || [];
  const inferences = narrative?.inferences || [];
  const tensions = narrative?.tensions || [];
  const limitations = narrative?.limitations || [];
  const verdictTone = analysis.riskScore >= 66 ? "negative" : analysis.riskScore >= 45 ? "watch" : "positive";

  renderEconomicQuote(analysis);
  renderAnalysisBoard(analysis, narrative);
  renderScenarioMatrix(analysis, narrative);

  elements.analysisList.innerHTML = `
    <li class="deep-thesis" data-tone="${verdictTone}">
      <span>심층 결론</span>
      <h3>${escapeHtml(narrative?.title || analysis.regime || "현재 시장을 교차 확인합니다.")}</h3>
      <p>${escapeHtml(narrative?.meaning || analysis.pulse || "")}</p>
      <div>
        <strong>왜 중요한가</strong>
        <em>${escapeHtml(narrative?.korea?.title || "한국에서는 환율과 수출의 전파 경로를 함께 봐야 합니다.")}</em>
      </div>
    </li>

    <li class="evidence-separation">
      <div class="analysis-part-heading">
        <p class="article-label">Evidence</p>
        <h3>사실과 해석을 분리해서 보기</h3>
        <span>왼쪽은 확인된 값, 오른쪽은 그 값에서 도출한 판단입니다.</span>
      </div>
      <div class="fact-inference-grid">
        <section class="fact-column">
          <header>
            <span>01</span>
            <div>
              <strong>확인된 사실</strong>
              <p>가격과 공식 발표에서 직접 읽을 수 있는 내용</p>
            </div>
          </header>
          ${facts
            .map(
              (item) => `
                <article>
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.value)}</strong>
                  <p>${escapeHtml(item.note)}</p>
                </article>
              `
            )
            .join("")}
        </section>
        <section class="inference-column">
          <header>
            <span>02</span>
            <div>
              <strong>가능성이 높은 해석</strong>
              <p>사실을 연결한 판단이며 확정된 원인은 아닙니다.</p>
            </div>
          </header>
          ${inferences
            .map(
              (item) => `
                <article>
                  <span>${escapeHtml(item.label)} · 신뢰도 ${escapeHtml(item.confidence)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>근거: ${escapeHtml(item.basis)}</p>
                </article>
              `
            )
            .join("")}
        </section>
      </div>
    </li>

    <li class="deep-counter">
      <div class="analysis-part-heading">
        <p class="article-label">Countercheck</p>
        <h3>현재 결론과 충돌하는 신호</h3>
        <span>심층 분석은 맞는 근거뿐 아니라 틀릴 수 있는 근거도 함께 봅니다.</span>
      </div>
      <div class="counter-evidence-list">
        ${tensions
          .map(
            (item, index) => `
              <article>
                <span>반대 신호 ${index + 1}</span>
                <p>${escapeHtml(item)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </li>

    <li class="analysis-limitations">
      <div>
        <span>분석의 한계</span>
        <strong>여기까지는 말할 수 있고, 그 이상은 단정하지 않습니다.</strong>
      </div>
      <ul>
        ${limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </li>
  `;
}
function renderAnalysisBoard(analysis, narrative = state.narrative) {
  const components = narrative?.riskComponents || [];
  const actual = Number(analysis.riskScore || narrative?.riskScore || 0);
  const rebuilt = Number(narrative?.rebuiltRisk || actual);
  const adjustment = components.slice(1).reduce((sum, item) => sum + Number(item.points || 0), 0);

  elements.analysisBoard.innerHTML = `
    <section class="analysis-score-board">
      <div class="board-heading">
        <div>
          <p class="section-kicker">계산을 공개하는 심층 분석</p>
          <h3>위험 온도 ${actual}점은 이렇게 만들어졌습니다</h3>
        </div>
        <span>설명 모델 · 수익률 예측 아님</span>
      </div>
      <div class="risk-formula">
        <div class="risk-formula-total" data-tone="${actual >= 66 ? "negative" : actual >= 45 ? "watch" : "positive"}">
          <span>현재 위험 온도</span>
          <strong>${actual}</strong>
          <em>/100 · ${escapeHtml(narrative?.riskBand || analysis.regime || "")}</em>
          <p>중립 출발점에 현재 시장 신호를 더하고 뺀 값입니다.</p>
        </div>
        <ol class="risk-component-list">
          ${components
            .map(
              (item, index) => `
                <li>
                  <span>${index === 0 ? "출발" : `조정 ${index}`}</span>
                  <strong>${escapeHtml(item.label)}</strong>
                  <b class="${Number(item.points) > 0 ? "negative" : Number(item.points) < 0 ? "positive" : "neutral"}">${Number(item.points) > 0 ? "+" : ""}${item.points}점</b>
                  <p>${escapeHtml(item.reason)}</p>
                </li>
              `
            )
            .join("")}
        </ol>
      </div>
      <footer class="risk-formula-check">
        <span>검산</span>
        <strong>기본 42점 ${adjustment >= 0 ? "+" : "-"} ${Math.abs(adjustment)}점 = ${rebuilt}점</strong>
        <em>화면 표시값 ${actual}점${actual === rebuilt ? "과 일치" : "과 차이 있음"}</em>
      </footer>
    </section>
  `;
}
function renderScenarioMatrix(analysis, narrative = state.narrative) {
  const scenarios = narrative?.scenarios || [];
  const toneById = { base: "watch", better: "positive", worse: "negative" };

  elements.scenarioMatrix.innerHTML = `
    <section class="expansion-section scenario-reading">
      <div class="board-heading">
        <div>
          <p class="section-kicker">조건이 바뀌면 결론도 바뀜</p>
          <h3>기본·개선·악화 시나리오</h3>
        </div>
        <span>확률 대신 확인 조건</span>
      </div>
      <div class="scenario-condition-grid">
        ${scenarios
          .map(
            (scenario) => `
              <article data-tone="${toneById[scenario.id] || "neutral"}" data-current="${scenario.id === "base"}">
                <header>
                  <span>${escapeHtml(scenario.label)}</span>
                  ${scenario.id === "base" ? "<em>현재 기본값</em>" : ""}
                </header>
                <h4>${escapeHtml(scenario.title)}</h4>
                <div>
                  <strong>이 조건이면</strong>
                  <p>${escapeHtml(scenario.trigger)}</p>
                </div>
                <div>
                  <strong>이렇게 해석</strong>
                  <p>${escapeHtml(scenario.meaning)}</p>
                </div>
                <footer>
                  ${(scenario.checks || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
                </footer>
              </article>
            `
          )
          .join("")}
      </div>
      <p class="data-caveat">세 시나리오는 발생 확률이 아닙니다. 어떤 데이터가 나오면 현재 판단을 유지하거나 바꿔야 하는지 보여주는 조건표입니다.</p>
    </section>
  `;
}
function renderIndicators() {
  const query = state.indicatorQuery.trim().toLocaleLowerCase("ko-KR");
  const filtered = allIndicatorDefinitions.filter((indicator) => {
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
    }),
    ...resourceProductionIndicators.map((indicator) => indicator.year)
  );
  elements.indicatorUpdate.textContent = `WDI + USGS · 지표별 기준연도 표시`;
  elements.indicatorSummary.innerHTML = `
    <div>
      <span>수록 범위</span>
      <strong>${allIndicatorDefinitions.length}개 지표 · ${indicatorCategories.length - 1}개 분야</strong>
      <p>인구부터 물가·금융, 대외투자, 기술과 세계 자원 생산까지 비교합니다.</p>
    </div>
    <div>
      <span>한국 합계출산율</span>
      <strong>${fertility ? formatIndicatorValue(indicatorDefinitions[0], fertility) : "--"}</strong>
      <p>${fertility ? `${fertility.year}년 기준 · 세계 ${formatIndicatorValue(indicatorDefinitions[0], indicatorSnapshot.indicators.fertility.countries.WLD)}` : "기준값 없음"}</p>
    </div>
    <div>
      <span>데이터 기준</span>
      <strong>최신 ${latestYear}년 · 생산지도 ${resourceProductionIndicators.length}개</strong>
      <p>세계은행과 USGS 자료의 실제 기준연도를 지표마다 표시합니다.</p>
    </div>
  `;

  elements.indicatorCategoryTabs.innerHTML = indicatorCategories
    .map((category) => {
      const count = category.id === "all"
        ? allIndicatorDefinitions.length
        : allIndicatorDefinitions.filter((indicator) => indicator.category === category.id).length;
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
        <p>출산, 리튬, 고용, 의료처럼 더 짧은 단어로 찾아보세요.</p>
      </div>
    `;

  const selected = allIndicatorDefinitions.find((indicator) => indicator.id === state.selectedIndicatorId);
  if (!filtered.length || !selected) {
    elements.indicatorDetail.innerHTML = `
      <div class="indicator-detail-empty">
        <span>지표 선택</span>
        <strong>왼쪽 목록에서 확인할 지표를 선택하세요.</strong>
      </div>
    `;
    return;
  }

  if (selected.kind === "resource-production") {
    elements.indicatorDetail.innerHTML = renderResourceProductionDetail(selected);
    bindResourceProductionDetail(elements.indicatorDetail, updateChapterHeight);
    requestAnimationFrame(updateChapterHeight);
    return;
  }

  renderIndicatorDetail(selected);
  requestAnimationFrame(() => {
    drawIndicatorTrend();
    updateChapterHeight();
  });
}

function renderIndicatorListItem(indicator) {
  if (indicator.kind === "resource-production") {
    const leader = [...indicator.countries]
      .filter((country) => country.id !== "OTH")
      .sort((a, b) => b.value - a.value)[0];
    const isSelected = indicator.id === state.selectedIndicatorId;
    return `
      <button class="indicator-list-item resource-indicator-list-item" type="button" data-indicator-id="${indicator.id}" aria-pressed="${isSelected}">
        <span class="indicator-list-meta">
          <em>${escapeHtml(getIndicatorCategoryLabel(indicator.category))}</em>
          <i>${indicator.year}년 추정</i>
        </span>
        <strong>${escapeHtml(indicator.name)}</strong>
        <span class="indicator-list-value">
          <b>${escapeHtml(leader.label)} ${formatProductionExact(leader.value, indicator.unit)}</b>
          <small>세계 ${formatProductionExact(indicator.worldTotal, indicator.unit)}</small>
        </span>
        <p>${escapeHtml(indicator.description)}</p>
      </button>
    `;
  }

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
    <section class="indicator-trend-section">
      <div class="indicator-section-title">
        <div>
          <span>선택한 지표 추세</span>
          <strong>${escapeHtml(indicator.name)} · ${first && last ? `${first.year}~${last.year}년` : "자료 없음"}</strong>
        </div>
        <em>${trendDelta == null ? "변화 계산 불가" : `기간 변화 ${formatIndicatorDelta(indicator, trendDelta)}`}</em>
      </div>
      <div class="indicator-trend-frame">
        <canvas id="indicatorTrendCanvas" width="760" height="220" aria-label="${escapeHtml(indicator.name)} 한국 추세 차트"></canvas>
      </div>
    </section>
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
  const selectedEraDetails = historyEraDetails[selectedView.id] || [];
  const selectedProfile = historyEraProfiles[selectedView.id] || historyEraProfiles.overview;
  const visibleEvents = state.historyEra === "overview"
    ? historyEvents.filter((event) => event.featured)
    : historyEvents.filter((event) => event.era === state.historyEra);
  const currentLink = getHistoryCurrentLink(snapshot);

  elements.historyCount.textContent = `${historyEvents.length}개 사건 · ${historyEras.length}개 시대 · 4개 시각 자료`;
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
    <figure class="history-era-visual" data-focus="${escapeHtml(selectedProfile.imageFocus)}">
      <div class="history-era-image-frame">
        <img
          src="${escapeHtml(selectedProfile.image)}"
          alt="${escapeHtml(selectedProfile.imageAlt)}"
          loading="${selectedView.id === "overview" ? "eager" : "lazy"}"
          decoding="async"
        />
        <span>${escapeHtml(selectedView.period)}</span>
      </div>
      <figcaption>${escapeHtml(selectedProfile.caption)}</figcaption>
    </figure>
    <div class="history-era-copy">
      <p class="section-kicker">${escapeHtml(selectedView.period)}</p>
      <h3>${escapeHtml(selectedView.title)}</h3>
      <p class="history-era-summary">${escapeHtml(selectedView.summary)}</p>
      <div class="history-era-narrative">
        ${selectedProfile.narrative.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
      <div class="history-era-lenses">
        ${selectedEraDetails.map((detail) => `
          <article>
            <span>${escapeHtml(detail.label)}</span>
            <p>${escapeHtml(detail.text)}</p>
          </article>
        `).join("")}
      </div>
      <aside class="history-era-question">
        <span>핵심 질문</span>
        <strong>${escapeHtml(selectedView.question)}</strong>
      </aside>
    </div>
    <section class="history-era-structure" aria-label="${escapeHtml(selectedView.label)} 시대의 구조">
      <div class="history-era-structure-heading">
        <span>시대의 구조</span>
        <strong>무엇이 바뀌었고 무엇이 남았나</strong>
      </div>
      <div class="history-era-structure-list">
        ${selectedProfile.structure.map((item, index) => `
          <article>
            <i>${index + 1}</i>
            <div>
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.text)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;

  elements.historyTimeline.innerHTML = `
    <div class="history-section-heading">
      <div>
        <p class="section-kicker">시간의 흐름</p>
        <h3>${escapeHtml(selectedView.label)}의 전환점</h3>
      </div>
      <span>${visibleEvents.length}개 사건</span>
    </div>
    <p class="history-expand-hint">첫 사건은 펼쳐져 있습니다. 다른 사건도 눌러 원인부터 오늘의 교훈까지 확인하세요.</p>
    <div class="history-event-list">
      ${visibleEvents.map((event, index) => renderHistoryEvent(event, index)).join("")}
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

function renderHistoryEvent(event, index) {
  const detail = historyDeepDives[event.id] || {};
  const perspective = historyEventPerspectives[event.id] || {};
  const flow = detail.flow || [];
  const checklist = perspective.checklist || [];
  return `
    <details class="history-event" ${index === 0 ? "open" : ""}>
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
        <div class="history-event-flow">
          <span>경제가 움직인 순서</span>
          <ol>
            ${flow.map((step, stepIndex) => `
              <li>
                <i>${stepIndex + 1}</i>
                <strong>${escapeHtml(step)}</strong>
              </li>
            `).join("")}
          </ol>
        </div>
        <section>
          <span>배경과 촉발</span>
          <p>${escapeHtml(event.cause)}</p>
        </section>
        <section>
          <span>당시 경제의 결과</span>
          <p>${escapeHtml(event.result)}</p>
        </section>        <section>
          <span>사람과 기업이 겪은 변화</span>
          <p>${escapeHtml(perspective.people || "당시 생활과 기업 활동의 변화를 정리하고 있습니다.")}</p>
        </section>
        <section>
          <span>정책은 어떻게 대응했나</span>
          <p>${escapeHtml(detail.policy || "정책 대응 자료를 정리하고 있습니다.")}</p>
        </section>        <section>
          <span>다음 시대에 남긴 유산</span>
          <p>${escapeHtml(perspective.legacy || "이 사건이 남긴 제도와 행동 변화를 정리하고 있습니다.")}</p>
        </section>
        <section>
          <span>한국과의 연결</span>
          <p>${escapeHtml(detail.korea || "한국 경제와의 연결을 정리하고 있습니다.")}</p>
        </section>
        <section>
          <span>자주 하는 오해</span>
          <p>${escapeHtml(detail.misconception || "한 가지 원인만으로 사건 전체를 설명하지 않도록 주의합니다.")}</p>
        </section>
        <section>
          <span>오늘의 교훈</span>
          <p>${escapeHtml(event.today)}</p>
        </section>
        <div class="history-event-checklist">
          <span>오늘 비슷한 상황을 판단할 3가지 신호</span>
          <ul>
            ${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
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
  const scenario = economicRelationships.find((item) => item.id === state.relationshipScenario) || economicRelationships[0];
  const selectedIndex = Math.min(scenario.steps.length - 1, Math.max(0, state.relationshipStep));
  const selectedStep = scenario.steps[selectedIndex];
  const previousStep = selectedIndex > 0 ? scenario.steps[selectedIndex - 1] : null;
  const nextStep = selectedIndex < scenario.steps.length - 1 ? scenario.steps[selectedIndex + 1] : null;
  const currentSignal = getRelationshipCurrentSignal(scenario.id, snapshot);
  const stepLabels = ["정책·충격", "1차 반응", "자금·소득", "실물경제", "최종 파급"];
  const progress = `${((selectedIndex + 1) / scenario.steps.length) * 100}%`;

  elements.relationshipLab.innerHTML = `
    <section class="expansion-section relationship-section">
      <div class="board-heading relationship-heading">
        <div>
          <p class="section-kicker">경제 연결 지도</p>
          <h3>한 변화가 경제 전체로 번지는 과정</h3>
        </div>
        <span>12개 상황 · 단계별 원리와 확인 지표</span>
      </div>
      <div class="relationship-tabs" role="tablist" aria-label="경제 변화 선택">
        ${economicRelationships.map((item) => `
          <button type="button" role="tab" data-relationship-scenario="${item.id}" aria-selected="${item.id === scenario.id}">
            <span>${escapeHtml(item.category)}</span>
            <strong>${escapeHtml(item.label)}</strong>
          </button>
        `).join("")}
      </div>
      <header class="relationship-intro">
        <div class="relationship-intro-copy">
          <span>${escapeHtml(scenario.category)} · 출발점</span>
          <h4>${escapeHtml(scenario.trigger)}</h4>
          <p>${escapeHtml(scenario.summary)}</p>
        </div>
        <div class="relationship-question">
          <span>판단의 핵심 질문</span>
          <strong>${escapeHtml(scenario.coreQuestion)}</strong>
        </div>
      </header>
      <div class="relationship-korea-context">
        <span>한국에서 더 살펴볼 점</span>
        <p>${escapeHtml(scenario.koreaContext)}</p>
      </div>
      <div class="relationship-chain" aria-label="${escapeHtml(scenario.label)} 전달 경로" style="--relationship-progress: ${progress}">
        ${scenario.steps.map((step, index) => `
          <button type="button" class="relationship-step" data-relationship-step="${index}" aria-pressed="${index === selectedIndex}">
            <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(stepLabels[index] || "파급")}</span>
            <strong>${escapeHtml(step.title)}</strong>
            <small>${escapeHtml(step.firstAffected)}</small>
          </button>
        `).join("")}
      </div>
      <section class="relationship-step-explainer" aria-live="polite">
        <header>
          <div>
            <span>선택한 단계 ${String(selectedIndex + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(selectedStep.title)}</strong>
          </div>
          <em>${previousStep ? `${escapeHtml(previousStep.title)}에서 전달` : "변화의 출발점"}</em>
        </header>
        <p class="relationship-step-summary">${escapeHtml(selectedStep.detail)}</p>
        <div class="relationship-step-detail-grid">
          <section class="relationship-mechanism">
            <span>왜 이어지나</span>
            <p>${escapeHtml(selectedStep.mechanism)}</p>
          </section>
          <section>
            <span>먼저 반응하는 곳</span>
            <strong>${escapeHtml(selectedStep.firstAffected)}</strong>
          </section>
          <section>
            <span>확인할 숫자</span>
            <div class="relationship-indicator-chips">${selectedStep.indicators.map((indicator) => `<i>${escapeHtml(indicator)}</i>`).join("")}</div>
          </section>
          <section class="relationship-example">
            <span>현실에서 이렇게 보임</span>
            <p>${escapeHtml(selectedStep.example)}</p>
          </section>
        </div>
        <div class="relationship-next-step">
          <span>${nextStep ? "다음 연결" : "마지막 확인"}</span>
          <strong>${nextStep ? `${escapeHtml(selectedStep.title)} → ${escapeHtml(nextStep.title)}` : "최종 파급이 실제 지표에 나타났는지 확인"}</strong>
        </div>
      </section>
      <section class="relationship-impact-section">
        <div class="relationship-subheading">
          <div>
            <span>영향 비교</span>
            <h4>누구에게 어떻게 다르게 작용하나</h4>
          </div>
          <small>방향은 기본 경로이며 조건에 따라 달라질 수 있습니다.</small>
        </div>
        <div class="relationship-impact-grid">
          ${scenario.impacts.map((impact) => `
            <article data-tone="${impact.tone}">
              <header><span>${escapeHtml(impact.area)}</span><em>${escapeHtml(impact.direction)}</em></header>
              <strong>${escapeHtml(impact.headline)}</strong>
              <p>${escapeHtml(impact.detail)}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="relationship-watch-section">
        <div class="relationship-subheading">
          <div>
            <span>검증 순서</span>
            <h4>이 숫자들이 같은 방향으로 움직이는지 확인</h4>
          </div>
          <small>하나의 지표만으로 연결을 단정하지 않습니다.</small>
        </div>
        <div class="relationship-watch-list" role="list">
          ${scenario.watch.map((item, index) => `
            <div role="listitem">
              <b>${String(index + 1).padStart(2, "0")}</b>
              <strong>${escapeHtml(item.indicator)}</strong>
              <em>${escapeHtml(item.direction)}</em>
              <span>${escapeHtml(item.timing)}</span>
              <p>${escapeHtml(item.meaning)}</p>
            </div>
          `).join("")}
        </div>
      </section>
      <div class="relationship-effects" aria-label="함께 볼 영향">
        <strong>시장에 먼저 나타날 수 있는 신호</strong>
        <div>${scenario.effects.map((effect) => `<span>${escapeHtml(effect)}</span>`).join("")}</div>
      </div>
      <div class="relationship-learning-grid">
        <section class="relationship-current">
          <span>${escapeHtml(currentSignal.label)}</span>
          <strong>${escapeHtml(currentSignal.value)}</strong>
          <p>${escapeHtml(currentSignal.detail)}</p>
        </section>
        <section class="relationship-condition relationship-condition-stronger">
          <span>경로가 강해지는 조건</span>
          <div>${scenario.strongerWhen.map((item) => `<i>${escapeHtml(item)}</i>`).join("")}</div>
        </section>
        <section class="relationship-condition relationship-condition-weaker">
          <span>경로가 약해지는 조건</span>
          <div>${scenario.weakerWhen.map((item) => `<i>${escapeHtml(item)}</i>`).join("")}</div>
        </section>
        <section>
          <span>항상 이렇게 되지는 않음</span>
          <p>${escapeHtml(scenario.exception)}</p>
        </section>
        <section>
          <span>반응하는 시간</span>
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
  const sp500 = byId.sp500;
  const vix = byId.vix;

  const signals = {
    "rate-hike": {
      label: "현재 숫자에 대입",
      value: `기준금리 ${macroValueText(rate)} · 물가 ${macroValueText(cpi)}`,
      detail: "금리가 높아도 물가가 충분히 낮아졌는지, 가계대출과 투자가 실제로 둔화되는지 확인합니다."
    },
    "rate-cut": {
      label: "현재 숫자에 대입",
      value: `기준금리 ${macroValueText(rate)} · 위험 ${snapshot?.analysis?.riskScore ?? "--"}/100`,
      detail: "인하 기대보다 인하 이유가 물가 안정인지 경기 급랭인지 먼저 구분합니다."
    },
    "inflation-up": {
      label: "현재 물가 신호",
      value: `소비자물가 ${macroValueText(cpi)} · 기준금리 ${macroValueText(rate)}`,
      detail: "전체 물가뿐 아니라 근원·서비스물가와 기대인플레이션이 함께 오르는지 확인합니다."
    },
    "oil-up": {
      label: "현재 시장 신호",
      value: wti ? `WTI ${formatMarketValue(wti)} · ${signed(wti.changePercent)}%` : "WTI 확인 중",
      detail: "하루 상승보다 몇 주간 높은 가격이 이어지고 원화 약세까지 겹치는지 확인합니다."
    },
    "won-weakness": {
      label: "현재 시장 신호",
      value: usdkrw ? `원/달러 ${formatMarketValue(usdkrw)} · ${signed(usdkrw.changePercent)}%` : "환율 확인 중",
      detail: "달러지수, 외국인 수급, 수입물가가 같은 방향인지 교차 확인합니다."
    },
    "fiscal-expansion": {
      label: "현재 판단에 대입",
      value: `위험 온도 ${snapshot?.analysis?.riskScore ?? "--"}/100 · 물가 ${macroValueText(cpi)}`,
      detail: "경기가 약하고 물가가 안정적일수록 재정 확대가 생산과 고용으로 이어질 여지가 큽니다."
    },
    "exports-up": {
      label: "현재 한국 지표",
      value: `수출 ${macroValueText(exports)}`,
      detail: "증가율뿐 아니라 수출 물량, 반도체 외 품목, 재고와 가동률이 함께 개선되는지 확인합니다."
    },
    "us-slowdown": {
      label: "현재 미국 위험 신호",
      value: `${sp500 ? `S&P 500 ${signed(sp500.changePercent)}%` : "S&P 확인 중"} · ${vix ? `VIX ${formatMarketValue(vix)}` : "VIX 확인 중"}`,
      detail: "주가 하락만 보지 말고 미국 고용·소매판매와 국채금리가 동시에 침체 방향인지 확인합니다."
    },
    "china-slowdown": {
      label: "현재 한국 연결 신호",
      value: `한국 수출 ${macroValueText(exports)} · 원/달러 ${usdkrw ? formatMarketValue(usdkrw) : "--"}`,
      detail: "대중 수출 물량과 산업금속 가격, 중국 제조업 주문이 함께 약해지는지 확인합니다."
    },
    "wage-up": {
      label: "현재 판단에 대입",
      value: `물가 ${macroValueText(cpi)}`,
      detail: "명목임금보다 임금상승률에서 물가상승률을 뺀 실질임금과 생산성을 함께 봅니다."
    },
    "household-debt-up": {
      label: "현재 한국 부채 신호",
      value: `가계신용 ${macroValueText(credit)} · 기준금리 ${macroValueText(rate)}`,
      detail: "대출 증가율보다 소득 대비 부채, DSR, 변동금리 비중과 연체율을 함께 확인합니다."
    },
    "home-price-down": {
      label: "현재 한국 지표",
      value: `가계신용 ${macroValueText(credit)}`,
      detail: "가격만 보지 말고 거래량, 전세가, 미분양, 착공과 연체율이 함께 악화되는지 확인합니다."
    }
  };
  return signals[scenarioId] || {
    label: "현재 숫자와 연결",
    value: "시장 지표 확인",
    detail: "한 숫자보다 여러 전달 경로가 같은 방향인지 확인합니다."
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
function renderMacro(macro, analysis, narrative = state.narrative) {
  const korea = narrative?.korea || {};
  const inflation = macro.find((item) => /소비자|물가/.test(item.label));
  const policyRate = macro.find((item) => /금리/.test(item.label));
  const exports = macro.find((item) => /수출/.test(item.label));
  const credit = macro.find((item) => /신용/.test(item.label));

  elements.koreaBrief.innerHTML = `
    <section class="korea-readable">
      <header>
        <span>한국 경제 한 줄 결론</span>
        <h3>${escapeHtml(korea.title || "환율·수출·물가를 함께 확인해야 합니다.")}</h3>
        <p>${escapeHtml(korea.summary || "")}</p>
      </header>
      <div class="korea-balance">
        <article data-tone="positive">
          <span>버팀목</span>
          <strong>${escapeHtml(korea.good || exportChangeText(exports))}</strong>
          <p>해외 판매가 기업 매출과 제조업 생산을 받쳐줄 가능성을 보여줍니다.</p>
        </article>
        <article data-tone="negative">
          <span>부담</span>
          <strong>${escapeHtml(korea.burden || `물가 ${macroValueText(inflation)}`)}</strong>
          <p>환율과 물가가 높으면 수출 호조가 가계의 체감경기까지 곧바로 이어지지 않을 수 있습니다.</p>
        </article>
      </div>
      <footer>
        <span>같이 봐야 할 공식값</span>
        <p>기준금리 ${escapeHtml(macroValueText(policyRate))} · 소비자물가 ${escapeHtml(macroValueText(inflation))} · 가계신용 ${escapeHtml(macroValueText(credit))}</p>
      </footer>
    </section>
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
          <summary>무슨 뜻인가</summary>
          <p>${escapeHtml(getMacroReason(item))}</p>
        </details>
      `;
      return node;
    })
  );
  renderKoreaBoard(macro, analysis, narrative);
  renderKoreaImpact(macro, analysis, state.snapshot?.markets || [], narrative);
}
function renderKoreaBoard(macro, analysis, narrative = state.narrative) {
  const chains = narrative?.korea?.chains || [];

  elements.koreaBoard.innerHTML = `
    <div class="board-heading">
      <div>
        <p class="section-kicker">숫자가 생활로 오는 과정</p>
        <h3>한국 경제를 움직이는 세 갈래</h3>
      </div>
      <span>원인 → 전달 → 결과</span>
    </div>
    <div class="economic-chain-list">
      ${chains
        .map(
          (chain, index) => `
            <article class="economic-chain">
              <header>
                <span>경로 ${index + 1}</span>
                <strong>${escapeHtml(chain.label)}</strong>
                <em>출발: ${escapeHtml(chain.start)}</em>
              </header>
              <ol class="chain-steps">
                ${chain.steps
                  .map((step, stepIndex) => `
                    <li>
                      <span>${stepIndex + 1}</span>
                      <strong>${escapeHtml(step)}</strong>
                    </li>
                  `)
                  .join("")}
              </ol>
              <p class="chain-result"><span>현재 해석</span> ${escapeHtml(chain.result)}</p>
              <p class="chain-caution"><span>확인할 점</span> ${escapeHtml(chain.caution)}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}
function renderKoreaImpact(macro, analysis, markets, narrative = state.narrative) {
  const korea = narrative?.korea || {};
  const limitations = narrative?.limitations || [];

  elements.koreaImpact.innerHTML = `
    <section class="expansion-section korea-impact-reading">
      <div class="board-heading">
        <div>
          <p class="section-kicker">누구에게 어떻게 영향을 주나</p>
          <h3>가계·기업·정책을 따로 보기</h3>
        </div>
        <span>위험 온도 ${analysis.riskScore}/100</span>
      </div>
      <div class="korea-impact-list">
        <article data-audience="household">
          <span>가계</span>
          <strong>이자 부담과 생활비가 소비 여력을 결정</strong>
          <p>${escapeHtml(korea.household || "금리와 가계부채를 함께 확인합니다.")}</p>
          <em>따라서 수출이 좋아져도 대출 이자와 물가가 높으면 가계가 느끼는 경기는 늦게 회복될 수 있습니다.</em>
        </article>
        <article data-audience="business">
          <span>기업</span>
          <strong>수출 매출과 수입 원가가 동시에 움직임</strong>
          <p>${escapeHtml(korea.business || "수출과 원가를 함께 확인합니다.")}</p>
          <em>수출기업과 내수기업, 원자재 수입기업의 체감이 서로 다를 수 있습니다.</em>
        </article>
        <article data-audience="policy">
          <span>한국은행·정부</span>
          <strong>경기를 돕고 싶어도 환율과 물가를 무시할 수 없음</strong>
          <p>${escapeHtml(korea.policy || "물가와 환율이 정책 여력을 결정합니다.")}</p>
          <em>금리를 내리면 이자 부담은 줄지만 원화와 물가에 새 부담을 줄 가능성도 함께 봐야 합니다.</em>
        </article>
      </div>
      <div class="korea-evidence-note">
        <span>현재 판단의 균형</span>
        <p><strong>긍정 근거</strong> ${escapeHtml(korea.good || "수출 흐름")}</p>
        <p><strong>부담 근거</strong> ${escapeHtml(korea.burden || "환율과 물가")}</p>
      </div>
      <p class="data-caveat">${escapeHtml(limitations[0] || "한국 공표지표는 실시간 시세가 아니라 발표 주기별 최신값입니다.")}</p>
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
      [item.term, item.english, item.category, item.definition, item.plain, item.why, item.example, item.caution, ...(item.related || [])].join(" ")
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
    { id: "all", label: "통합", detail: "핵심 700·심화 1,300 전체" },
    { id: "core", label: "핵심", detail: "일상·은행·주식·거시 기본어" },
    { id: "advanced", label: "심화", detail: "채권·파생·정책·계량 확장어" }
  ];

  const coreCount = glossaryTerms.filter((item) => item.level === "core").length;
  const advancedCount = glossaryTerms.length - coreCount;
  elements.glossaryTotal.textContent = `전체 ${formatter.format(glossaryTerms.length)} · 핵심 ${formatter.format(coreCount)} · 심화 ${formatter.format(advancedCount)}`;
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
      button.innerHTML = `<span><strong>${item.label}</strong><em>${item.detail}</em></span><b>${formatter.format(count)}개</b>`;
      return button;
    })
  );
  elements.glossaryResultCount.innerHTML = `
    <strong>${formatter.format(filtered.length)}</strong>
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
      button.innerHTML = `<span>${name}</span><em>${formatter.format(count)}</em>`;
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
    ? `용어 더 보기 · ${formatter.format(remaining)}개 남음`
    : "모든 용어 표시 중";
  requestAnimationFrame(updateChapterHeight);
}

function createGlossaryCard(item) {
  const detail = getGlossaryDetail(item);
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
      <article data-detail="plain">
        <span>쉽게 풀면</span>
        <p>${escapeHtml(detail.plain)}</p>
      </article>
      <article data-detail="importance">
        <span>왜 중요한가</span>
        <p>${escapeHtml(detail.why)}</p>
      </article>
      <article data-detail="example">
        <span>실제 해석 예시</span>
        <p>${escapeHtml(detail.example)}</p>
      </article>
      <article data-detail="reading">
        <span>같이 보는 기준</span>
        <p>${escapeHtml(detail.reading)}</p>
      </article>
      <article data-detail="caution">
        <span>주의할 점</span>
        <p>${escapeHtml(detail.caution)}</p>
      </article>
      <div class="glossary-related">
        <strong>관련 용어</strong>
        ${(item.related || []).map((term) => `<span>${escapeHtml(term)}</span>`).join("")}
      </div>
    </div>
  `;
  return card;
}

function getGlossaryDetail(item) {
  return {
    plain: item.plain || `${item.term}은(는) ${item.definition} 기사나 지표에서 이 표현을 만나면 먼저 대상·기간·비교 기준을 확인하면 뜻이 선명해집니다.`,
    why: item.why || getGlossaryImportance(item.category),
    example: item.example || `${item.term}의 숫자가 변했다면 절대 수준만 보지 말고 직전 기간·전년 같은 기간·관련 지표가 같은 방향인지 비교합니다.`,
    reading: getGlossaryReadingPoint(item.category),
    caution: item.caution || getGlossaryCaution(item.category)
  };
}

function getGlossaryImportance(category) {
  if (["거시경제", "물가·고용", "정책·제도", "경제학파·이론", "경제위기·역사"].includes(category)) {
    return "성장·물가·고용과 정책이 어떤 순서로 연결되는지 이해하게 해주며, 한 지표의 변화가 경제 전체에 미칠 경로를 판단하는 기준이 됩니다.";
  }
  if (["금리·통화", "채권·신용", "은행·금융"].includes(category)) {
    return "돈의 조달비용과 신용위험을 통해 예금·대출·채권·주식의 가격이 어떻게 달라지는지 설명하는 핵심 연결고리입니다.";
  }
  if (["외환·국제", "무역·산업", "국제개발·무역제도"].includes(category)) {
    return "환율·수출입·해외 자금이 한국의 기업이익과 물가, 성장률로 전달되는 과정을 읽는 데 중요합니다.";
  }
  if (["주식·투자", "시장심리·자금", "파생·위험"].includes(category)) {
    return "가격 변화가 실제 가치 변화인지 수급과 심리의 일시적 움직임인지 구분하고 손실 가능성을 관리하는 데 쓰입니다.";
  }
  if (["기업·회계", "기업금융·M&A"].includes(category)) {
    return "기업의 매출·이익·현금흐름과 자본배분을 분리해 사업의 질과 재무 체력을 판단하게 해줍니다.";
  }
  if (["부동산·가계", "세금·연금", "보험·위험관리"].includes(category)) {
    return "가계의 현재 현금흐름과 장기 부채·노후·위험 부담이 어떻게 달라지는지 계산하는 데 직접 연결됩니다.";
  }
  if (["원자재·에너지", "ESG·기후경제"].includes(category)) {
    return "에너지·원료 가격과 기후 규제가 기업 원가, 소비자물가와 장기 투자비용에 미치는 영향을 이해하게 합니다.";
  }
  if (["디지털경제", "지급결제·핀테크"].includes(category)) {
    return "새 기술의 성장 가능성과 실제 수익구조·결제위험·규제비용을 분리해 평가하는 데 필요합니다.";
  }
  return "같은 숫자도 산식과 표본, 비교 기준에 따라 의미가 달라지므로 경제 자료를 정확하게 읽기 위한 기본 도구입니다.";
}

function getGlossaryCaution(category) {
  if (["데이터·통계", "거시경제", "물가·고용"].includes(category)) {
    return "전월비와 전년비, 명목과 실질, 속보치와 확정치를 섞지 말고 단위·계절조정·기저효과를 먼저 확인해야 합니다.";
  }
  if (["주식·투자", "채권·신용", "파생·위험", "시장심리·자금"].includes(category)) {
    return "과거 관계와 평균은 미래 수익을 보장하지 않습니다. 가격 수준, 유동성, 만기와 손실 한도를 함께 확인해야 합니다.";
  }
  if (["기업·회계", "기업금융·M&A"].includes(category)) {
    return "기업마다 계산 기준이 다를 수 있으므로 일회성 항목과 회계정책을 확인하고 현금흐름으로 교차 검증해야 합니다.";
  }
  if (["외환·국제", "무역·산업", "원자재·에너지", "국제개발·무역제도"].includes(category)) {
    return "환율·가격·물량과 비교 기준의 영향을 분리하고, 한 국가나 한 달의 수치만으로 구조적 변화를 단정하지 않습니다.";
  }
  if (["정책·제도", "세금·연금"].includes(category)) {
    return "발표 내용과 실제 시행 시점·대상·재원은 다를 수 있으므로 법령과 공식 공표 기준을 확인해야 합니다.";
  }
  return "용어 하나만으로 좋고 나쁨을 결정하지 말고 원자료의 범위와 시점, 관련 지표가 같은 방향인지 함께 확인합니다.";
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
  elements.quizBankSize.textContent = `${formatter.format(glossaryTerms.length + scenarioQuestions.length)}개 문제은행`;
  elements.quizModes.replaceChildren(
    ...modes.map((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.className = "quiz-mode-button";
      button.dataset.quizMode = mode.id;
      button.setAttribute("aria-selected", String(state.quizMode === mode.id));
      button.innerHTML = `<strong>${mode.label}</strong><b>${formatter.format(mode.count)}개</b><span>${mode.detail}</span>`;
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
  const termCount = mode === "term" ? 10 : mode === "mixed" ? 5 : 0;
  const scenarioCount = mode === "scenario" ? 10 : mode === "mixed" ? 5 : 0;
  const selectedTerms = termCount ? shuffleQuizItems(glossaryTerms).slice(0, termCount) : [];
  const selectedScenarios = scenarioCount
    ? shuffleQuizItems(scenarioQuestions).slice(0, scenarioCount).map(shuffleScenarioChoices)
    : [];
  const termPool = buildTermQuizPool(selectedTerms);
  if (mode === "term") return termPool;
  if (mode === "scenario") return selectedScenarios;
  return shuffleQuizItems([...termPool, ...selectedScenarios]);
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

function buildTermQuizPool(terms) {
  return terms.map((term, termIndex) => {
    const sameCategory = glossaryTermsByCategory.get(term.category) || [];
    const distractors = [];
    let cursor = Math.abs(quizHash(`${term.term}-${termIndex}`)) % sameCategory.length;
    let attempts = 0;
    while (distractors.length < 3 && attempts < sameCategory.length * 2) {
      const candidate = sameCategory[cursor % sameCategory.length].term;
      if (candidate !== term.term && !distractors.includes(candidate)) distractors.push(candidate);
      cursor += 1;
      attempts += 1;
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
  { id: "security-disasters", label: "전쟁·사고·재난", description: "안보·대형 사고·자연재해·인프라 충격" },
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
  const criticalHeadlineCount = headlines.filter((headline) => headline.section === "security-disasters").length;
  const globalHeadlineCount = headlines.filter(
    (headline) => !["korea", "security-disasters"].includes(headline.section)
  ).length;
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
      <strong>한국 ${koreaHeadlineCount}건 · 전쟁·재난 ${criticalHeadlineCount}건 · 해외 경제 ${globalHeadlineCount}건</strong>
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
    const availableFilters = new Set(["all", ...NEWS_SECTION_DEFINITIONS.map((section) => section.id)]);
    if (!availableFilters.has(state.newsSection)) state.newsSection = "all";
    const filterDefinitions = [
      { id: "all", label: "전체", count: headlines.length },
      ...NEWS_SECTION_DEFINITIONS.map((section) => ({
        ...section,
        count: headlines.filter((headline) => headline.section === section.id).length
      }))
    ];
    const controls = document.createElement("div");
    controls.className = "news-filter-bar";
    const fetchedAt = dataQuality?.newsFetchedAt ? new Date(dataQuality.newsFetchedAt) : null;
    const scheduledAnalysisCount = Number(dataQuality?.scheduledNewsAnalysisCount) || 0;
    const refreshLabel = dataQuality?.newsSourceMode === "scheduled"
      ? `서버 예약 수집 · 1시간 간격 · 실제 AI 요약 ${scheduledAnalysisCount}건`
      : `실시간 보완 수집 · ${Number(dataQuality?.newsRefreshMinutes) || 30}분 캐시`;
    controls.innerHTML = `
      <div class="news-filter-tabs" role="tablist" aria-label="뉴스 분야">
        ${filterDefinitions.map((filter) => `
          <button type="button" role="tab" data-news-filter="${escapeHtml(filter.id)}" aria-selected="${state.newsSection === filter.id}">
            <span>${escapeHtml(filter.label)}</span>
            <em>${filter.count}</em>
          </button>
        `).join("")}
      </div>
      <div class="news-refresh-note">
        <span>${escapeHtml(refreshLabel)}</span>
        <time>${fetchedAt && Number.isFinite(fetchedAt.getTime()) ? marketTimeFormatter.format(fetchedAt) : "갱신 시각 확인 중"}</time>
      </div>
    `;
    controls.querySelectorAll("[data-news-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.newsSection = button.dataset.newsFilter || "all";
        renderNews(headlines, analysis, dataQuality);
        requestAnimationFrame(updateChapterHeight);
      });
    });

    const selectedDefinitions = state.newsSection === "all"
      ? NEWS_SECTION_DEFINITIONS
      : NEWS_SECTION_DEFINITIONS.filter((section) => section.id === state.newsSection);
    const sectionsGrid = document.createElement("div");
    sectionsGrid.className = "news-sections-grid";
    sectionsGrid.dataset.filtered = String(state.newsSection !== "all");
    let visibleIndex = 0;
    const sections = selectedDefinitions.map((section) => {
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
    sectionsGrid.replaceChildren(...sections);
    elements.newsList.replaceChildren(controls, sectionsGrid);
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
  if (headline.section === "security-disasters") item.dataset.newsKind = "critical";
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
  const criticalCount = headlines.filter((headline) => headline.section === "security-disasters").length;
  const globalCount = headlines.filter(
    (headline) => !["korea", "security-disasters"].includes(headline.section)
  ).length;
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
        <span>전쟁·사고·재난</span>
        <strong>${criticalCount}건</strong>
        <p>안보·인명·인프라 충격과 함께 공급망, 유가, 환율로 번지는 경로를 봅니다.</p>
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
    [/지진|홍수|산불|태풍|폭발|붕괴|정전|사이버|항만\s*마비/i, "재난·인프라"],
    [/유가|원유|OPEC|중동|전쟁|공습|미사일|oil/i, "에너지·지정학"],
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
  if (/전쟁|지정학|사고|재난|인프라|사이버/i.test(topic)) {
    return "인명·시설 피해와 함께 공급망, 유가, 환율, 보험 비용으로 번지는 경로를 봅니다.";
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
