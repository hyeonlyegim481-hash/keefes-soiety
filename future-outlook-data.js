export const futureOutlookMeta = {
  updatedAt: "2026-07-27",
  title: "인류 위험과 전환 신호",
  description:
    "기후, 물, 식량, 건강, 인구와 전력 수요를 하나의 예언으로 합치지 않고 관측값·조건부 전망·시나리오 범위로 나눠 읽습니다.",
  principle:
    "전망은 미래를 확정하는 숫자가 아닙니다. 정책, 기술, 인구와 배출 경로가 달라지면 결과도 달라지므로 기준시점과 가정을 함께 표시합니다.",
  caution:
    "서로 다른 기관의 수치는 기준연도·모형·포함 범위가 다릅니다. 숫자 크기만 직접 비교하지 말고 각 항목의 단위와 조건을 확인하세요."
};

export const outlookSources = [
  {
    id: "wmo-2025",
    publisher: "세계기상기구 WMO",
    title: "State of the Global Climate 2025",
    publishedAt: "2026-03-23",
    url: "https://wmo.int/publication-series/state-of-global-climate/state-of-global-climate-2025",
    basis: "2025년 관측과 장기 관측계열"
  },
  {
    id: "unep-egr-2025",
    publisher: "유엔환경계획 UNEP",
    title: "Emissions Gap Report 2025",
    publishedAt: "2025-11-04",
    url: "https://www.unep.org/resources/emissions-gap-report-2025",
    basis: "현재 정책·국가감축목표·넷제로 약속의 세기말 온도 경로"
  },
  {
    id: "ipcc-ar6",
    publisher: "기후변화에 관한 정부간 협의체 IPCC",
    title: "AR6 Synthesis Report",
    publishedAt: "2023-03-20",
    url: "https://www.ipcc.ch/report/ar6/syr/longer-report/",
    basis: "1850~1900년 대비 온도와 1995~2014년 대비 해수면 시나리오"
  },
  {
    id: "unwater-2025",
    publisher: "UN-Water",
    title: "WASH facts and figures",
    publishedAt: "2025-08-26",
    url: "https://www.unwater.org/water-facts/wash-water-sanitation-and-hygiene",
    basis: "WHO·UNICEF 2025 공동 모니터링 자료"
  },
  {
    id: "fao-sofi-2025",
    publisher: "FAO·IFAD·UNICEF·WFP·WHO",
    title: "The State of Food Security and Nutrition in the World 2025",
    publishedAt: "2025-07-28",
    url: "https://www.fao.org/newsroom/detail/global-hunger-declines--but-rises-in-africa-and-western-asia--un-report/",
    basis: "2024년 기아 추정치와 현재 추세의 2030년 전망"
  },
  {
    id: "who-climate-health",
    publisher: "세계보건기구 WHO",
    title: "Climate change and health",
    publishedAt: "2023-10-12",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
    basis: "취약지역 노출과 2030~2050년 일부 건강영향의 보수적 추정"
  },
  {
    id: "un-wpp-2024",
    publisher: "유엔 경제사회국 UN DESA",
    title: "World Population Prospects 2024",
    publishedAt: "2024-07-11",
    url: "https://www.un.org/development/desa/pd/content/world-population-prospects-2024",
    basis: "2024년 세계인구와 중위 인구전망"
  },
  {
    id: "kostat-2072",
    publisher: "통계청",
    title: "장래인구추계: 2022~2072년",
    publishedAt: "2023-12-14",
    url: "https://www.kostat.go.kr/boardDownload.es?bid=207&list_no=428476&seq=6",
    basis: "2022년 인구를 기초로 한 중위 추계"
  },
  {
    id: "iea-energy-ai",
    publisher: "국제에너지기구 IEA",
    title: "Energy and AI",
    publishedAt: "2025-04-10",
    url: "https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai",
    basis: "2024년 데이터센터 전력 사용과 2030년 기본 시나리오"
  },
  {
    id: "unep-adaptation-2025",
    publisher: "유엔환경계획 UNEP",
    title: "Adaptation Gap Report 2025",
    publishedAt: "2025-10-29",
    url: "https://www.unep.org/resources/adaptation-gap-report-2025",
    basis: "개도국 적응재원 2023년 흐름과 2035년 연간 필요액"
  },
  {
    id: "ilo-heat-2030",
    publisher: "국제노동기구 ILO",
    title: "Working on a warmer planet",
    publishedAt: "2019-07-01",
    url: "https://www.ilo.org/publications/working-warmer-planet-effect-heat-stress-productivity-and-decent-work",
    basis: "기온상승에 따른 2030년 노동시간 손실 모형"
  }
];

export const outlookCategories = [
  { id: "all", label: "전체", short: "8개 위험과 전환 신호" },
  { id: "climate", label: "기후·해양", short: "온도와 해수면" },
  { id: "essentials", label: "물·식량·건강", short: "생활 기반" },
  { id: "society", label: "인구·노동", short: "사회의 구조" },
  { id: "systems", label: "전력·대응", short: "전환 능력" }
];

export const policyTemperaturePaths = [
  {
    id: "net-zero",
    label: "조건부 목표+넷제로",
    value: 1.9,
    display: "1.9°C",
    tone: "better",
    detail: "조건부 국가감축목표와 모든 넷제로 약속이 완전히 이행된다는 가장 낙관적인 정책 경로입니다."
  },
  {
    id: "ndc",
    label: "국가감축목표 이행",
    value: 2.4,
    display: "2.3~2.5°C",
    tone: "watch",
    detail: "제출된 조건부·무조건부 국가감축목표가 이행되는 경우의 세기말 범위입니다."
  },
  {
    id: "current-policy",
    label: "현재 시행 정책",
    value: 2.8,
    display: "2.8°C",
    tone: "danger",
    detail: "약속이 아니라 실제 시행 중인 정책만 이어진다고 본 UNEP 2025 경로입니다."
  }
];

export const climateScenarios = [
  {
    id: "low",
    code: "SSP1-1.9",
    label: "매우 낮은 배출",
    tone: "better",
    plain: "빠르고 지속적인 감축으로 2050년 무렵 전 세계 CO₂ 순배출 제로에 접근하는 물리 시나리오입니다.",
    temperatures: [
      { period: "2021~2040", best: 1.5, min: 1.2, max: 1.8 },
      { period: "2041~2060", best: 1.6, min: 1.2, max: 2.0 },
      { period: "2081~2100", best: 1.4, min: 1.0, max: 1.8 }
    ],
    seaLevel2100: { min: 0.28, max: 0.55 },
    implication: "온난화가 완전히 사라지는 것은 아니며, 적응 투자와 해수면 대응은 계속 필요합니다."
  },
  {
    id: "middle",
    code: "SSP2-4.5",
    label: "중간 배출",
    tone: "watch",
    plain: "배출이 세기 중반까지 뚜렷하게 줄지 않고 이후 완만하게 감소하는 중간 물리 시나리오입니다.",
    temperatures: [
      { period: "2021~2040", best: 1.5, min: 1.2, max: 1.8 },
      { period: "2041~2060", best: 2.0, min: 1.6, max: 2.5 },
      { period: "2081~2100", best: 2.7, min: 2.1, max: 3.5 }
    ],
    seaLevel2100: { min: 0.44, max: 0.76 },
    implication: "폭염·집중호우·생태계 손실과 적응 비용이 현재보다 더 커지는 경로입니다."
  },
  {
    id: "high",
    code: "SSP5-8.5",
    label: "매우 높은 배출",
    tone: "danger",
    plain: "화석연료 사용과 배출이 크게 늘어나는 매우 높은 배출 물리 시나리오입니다.",
    temperatures: [
      { period: "2021~2040", best: 1.6, min: 1.3, max: 1.9 },
      { period: "2041~2060", best: 2.4, min: 1.9, max: 3.0 },
      { period: "2081~2100", best: 4.4, min: 3.3, max: 5.7 }
    ],
    seaLevel2100: { min: 0.63, max: 1.01 },
    implication: "복합 재난과 일부 지역의 적응 한계가 크게 늘어날 수 있는 고위험 경로입니다."
  }
];

export const humanityRisks = [
  {
    id: "warming",
    order: "01",
    category: "climate",
    categoryLabel: "기후",
    title: "지구 평균기온",
    horizon: "현재~2100",
    confidence: "높음",
    current: {
      value: "1.43",
      unit: "°C",
      label: "2025년 관측",
      note: "1850~1900년 평균 대비",
      kind: "관측"
    },
    outlook: {
      value: "2.8",
      unit: "°C",
      label: "현재 정책의 세기말 경로",
      note: "UNEP 2025 정책평가",
      kind: "조건부 전망"
    },
    plain: "한 해의 온도와 장기 온난화 수준은 다릅니다. 2025년 관측은 최근 상태이고 2.8°C는 현재 정책이 이어진다는 조건의 세기말 경로입니다.",
    chain: ["온실가스 축적", "평균기온·해양열 증가", "폭염·강수 극단화", "건강·농업·보험 손실"],
    signals: ["대기 CO₂ 농도", "10년 평균 지구온도", "해양열 함량"],
    korea: "전력 피크, 농수산물 가격, 산업단지 냉각과 도시 폭염 비용으로 먼저 체감될 가능성이 큽니다.",
    limits: "단일 연도의 1.5°C 초과가 파리협정의 장기 목표를 곧바로 넘었다는 뜻은 아닙니다.",
    sourceIds: ["wmo-2025", "unep-egr-2025"]
  },
  {
    id: "sea-level",
    order: "02",
    category: "climate",
    categoryLabel: "해양",
    title: "해수면과 연안 위험",
    horizon: "현재~2100+",
    confidence: "중간~높음",
    current: {
      value: "4.75",
      unit: "mm/년",
      label: "2012~2025 상승률",
      note: "세계 평균 해수면",
      kind: "관측"
    },
    outlook: {
      value: "0.28~1.01",
      unit: "m",
      label: "2100년 시나리오 범위",
      note: "1995~2014년 평균 대비",
      kind: "시나리오"
    },
    plain: "2100년 수치는 하나가 아니라 배출 시나리오별 가능 범위입니다. 해수면은 온도 상승이 멈춰도 수세기 동안 계속 오를 수 있습니다.",
    chain: ["해양 팽창·빙하 손실", "평균 해수면 상승", "폭풍해일·염수 침투", "항만·주거·보험 비용"],
    signals: ["위성 해수면 상승률", "빙하 질량수지", "지역별 지반침하"],
    korea: "항만, 해안 산업단지와 저지대 도시에서는 세계 평균보다 지역 해수면과 지반침하를 함께 봐야 합니다.",
    limits: "지역별 해류와 지반운동 때문에 실제 연안 상승폭은 세계 평균과 다를 수 있습니다.",
    sourceIds: ["wmo-2025", "ipcc-ar6"]
  },
  {
    id: "water",
    order: "03",
    category: "essentials",
    categoryLabel: "물",
    title: "안전한 식수 접근",
    horizon: "현재~2030",
    confidence: "높음",
    current: {
      value: "21",
      unit: "억 명",
      label: "2024년 미접근 인구",
      note: "안전하게 관리되는 식수",
      kind: "관측"
    },
    outlook: {
      value: "20",
      unit: "억 명",
      label: "현재 속도의 2030년",
      note: "여전히 미접근할 전망",
      kind: "조건부 전망"
    },
    plain: "세계 평균은 조금 개선되더라도 2030년에도 약 20억 명이 안전한 식수에 접근하지 못할 수 있다는 뜻입니다.",
    chain: ["가뭄·오염·노후관", "취수·정수 비용 상승", "건강·농업·공장 차질", "지역 격차 확대"],
    signals: ["안전관리 식수 접근률", "가뭄 지속기간", "누수율·물 재이용률"],
    korea: "반도체·배터리 산업용수, 가뭄 지역의 생활용수와 수질 안정성을 분리해 확인해야 합니다.",
    limits: "식수 접근 지표는 수량뿐 아니라 수질, 이용 가능시간과 접근성을 함께 반영합니다.",
    sourceIds: ["unwater-2025"]
  },
  {
    id: "food",
    order: "04",
    category: "essentials",
    categoryLabel: "식량",
    title: "기아와 식량가격 충격",
    horizon: "현재~2030",
    confidence: "중간",
    current: {
      value: "6.73",
      unit: "억 명",
      label: "2024년 기아 추정",
      note: "세계 인구의 약 8.2%",
      kind: "추정"
    },
    outlook: {
      value: "5.12",
      unit: "억 명",
      label: "현재 추세의 2030년",
      note: "약 60%가 아프리카",
      kind: "조건부 전망"
    },
    plain: "세계 합계는 감소할 수 있지만 지역별 격차는 커질 수 있습니다. 기후 충격, 분쟁과 식품물가가 전망을 다시 악화시킬 수 있습니다.",
    chain: ["기후·분쟁·비료비", "생산·물류 변동", "식품가격 상승", "영양·사회안정 악화"],
    signals: ["곡물 생산량과 재고", "FAO 식품가격지수", "지역별 영양부족률"],
    korea: "곡물·사료 수입의존도가 높아 생산국 날씨, 해상운임과 환율이 국내 식품가격으로 연결됩니다.",
    limits: "기아 추정치는 조사와 모형의 범위를 포함하며 식량불안 전체와 같은 지표가 아닙니다.",
    sourceIds: ["fao-sofi-2025"]
  },
  {
    id: "health",
    order: "05",
    category: "essentials",
    categoryLabel: "건강",
    title: "폭염과 감염병 부담",
    horizon: "2030~2050",
    confidence: "중간",
    current: {
      value: "36",
      unit: "억 명",
      label: "기후 취약지역 거주",
      note: "WHO 현재 노출 추정",
      kind: "추정"
    },
    outlook: {
      value: "+25",
      unit: "만 명/년",
      label: "2030~2050년 추가 사망",
      note: "영양·말라리아·설사·열스트레스만 포함",
      kind: "보수적 전망"
    },
    plain: "25만 명은 모든 기후 건강피해가 아니라 WHO가 수량화한 일부 원인만 합친 보수적 추정이며 전체 피해는 더 넓습니다.",
    chain: ["폭염·강수·생태 변화", "열노출·매개체 확산", "의료수요·노동손실", "취약계층 격차"],
    signals: ["초과사망과 온열질환", "열대야·폭염 지속시간", "매개체 감염병 지역"],
    korea: "고령인구 비중 상승과 도시 열섬이 겹치므로 기온뿐 아니라 야간최저기온과 응급실 지표를 봐야 합니다.",
    limits: "오래된 모형에 기반한 보수적 수치이며 산불 연기, 정신건강과 다수 재난 영향은 모두 포함하지 않습니다.",
    sourceIds: ["who-climate-health"]
  },
  {
    id: "population",
    order: "06",
    category: "society",
    categoryLabel: "인구",
    title: "세계 증가와 한국 고령화",
    horizon: "현재~2080s",
    confidence: "중간~높음",
    current: {
      value: "82",
      unit: "억 명",
      label: "2024년 세계인구",
      note: "UN 중위 추계 기준",
      kind: "추정"
    },
    outlook: {
      value: "103",
      unit: "억 명",
      label: "2080년대 중반 정점",
      note: "2100년 약 102억 명",
      kind: "인구 전망"
    },
    plain: "세계는 계속 늘지만 한국을 포함한 여러 국가는 먼저 감소합니다. 같은 미래에도 지역별 노동력·주택·연금 문제는 반대 방향일 수 있습니다.",
    chain: ["출산·수명·이동", "연령구조 변화", "노동·소비·재정 변화", "성장률·복지 부담"],
    signals: ["합계출산율", "생산연령인구", "순이동과 고령인구 비중"],
    korea: "통계청 중위 추계에서 2072년 총인구는 3,622만 명, 65세 이상 비중은 47.7%입니다.",
    limits: "출산율, 기대수명과 국제이동이 달라지면 장기 인구경로는 크게 바뀔 수 있습니다.",
    sourceIds: ["un-wpp-2024", "kostat-2072"]
  },
  {
    id: "heat-labour",
    order: "07",
    category: "society",
    categoryLabel: "노동",
    title: "열스트레스와 생산성",
    horizon: "현재~2030",
    confidence: "중간",
    current: {
      value: "1.4",
      unit: "%",
      label: "1995년 손실 노동시간",
      note: "ILO 모형 기준",
      kind: "모형 추정"
    },
    outlook: {
      value: "2.2",
      unit: "%",
      label: "2030년 손실 노동시간",
      note: "정규직 8천만 명 상당",
      kind: "조건부 전망"
    },
    plain: "전 세계 평균 노동시간의 2.2%가 더위 때문에 사라질 수 있다는 뜻이며 농업·건설과 저소득 지역에 피해가 집중됩니다.",
    chain: ["기온·습도 상승", "작업중단·속도 저하", "생산량·임금 손실", "지역·직종 격차"],
    signals: ["습구흑구온도 WBGT", "폭염 작업중지시간", "산업별 노동생산성"],
    korea: "건설·물류·농업의 작업시간 조정, 냉방비와 산업안전 규정이 기업 비용과 노동공급에 영향을 줍니다.",
    limits: "2019년 발표 모형으로, 실제 손실은 적응설비와 작업방식 변화에 따라 달라집니다.",
    sourceIds: ["ilo-heat-2030"]
  },
  {
    id: "power-adaptation",
    order: "08",
    category: "systems",
    categoryLabel: "전력·대응",
    title: "AI 전력수요와 적응재원",
    horizon: "현재~2035",
    confidence: "중간",
    current: {
      value: "415",
      unit: "TWh",
      label: "2024년 데이터센터 전력",
      note: "세계 전력의 약 1.5%",
      kind: "추정"
    },
    outlook: {
      value: "945",
      unit: "TWh",
      label: "2030년 IEA 기본경로",
      note: "세계 전력의 3% 미만",
      kind: "시나리오"
    },
    plain: "AI 사용이 늘면 전력망·냉각·발전 투자가 함께 필요합니다. 동시에 개도국 기후적응에는 현재보다 훨씬 큰 재원이 필요합니다.",
    chain: ["AI·냉방·전기화", "지역 전력수요 집중", "망·발전·저장 투자", "전력비·입지 경쟁"],
    signals: ["데이터센터 전력계약", "송전망 접속 대기", "적응재원 집행액"],
    korea: "데이터센터 입지, 반도체 공장과 여름 냉방 피크가 겹치는 지역의 전력망 증설 속도를 확인해야 합니다.",
    limits: "IEA 기본경로는 효율 개선과 AI 도입 속도에 따라 크게 달라질 수 있습니다. UNEP는 별도로 2035년 개도국 적응재원을 연 3,100억~3,650억 달러로 추정합니다.",
    sourceIds: ["iea-energy-ai", "unep-adaptation-2025"]
  }
];

export const futureMilestones = [
  {
    period: "2030",
    label: "가까운 시험대",
    title: "물·식량·전력의 방향이 먼저 드러납니다.",
    facts: [
      "현재 속도라면 안전한 식수 미접근 인구 약 20억 명",
      "현재 추세라면 만성 영양부족 약 5.12억 명",
      "데이터센터 전력수요 기본경로 약 945TWh"
    ],
    sourceIds: ["unwater-2025", "fao-sofi-2025", "iea-energy-ai"]
  },
  {
    period: "2035",
    label: "적응 투자",
    title: "피해를 줄이는 재정 능력의 격차가 커질 수 있습니다.",
    facts: [
      "개도국 적응재원 연 3,100억~3,650억 달러 필요",
      "2023년 국제 공공 적응재원은 260억 달러",
      "현재 흐름 대비 필요액은 약 12~14배"
    ],
    sourceIds: ["unep-adaptation-2025"]
  },
  {
    period: "2050",
    label: "물리 위험 누적",
    title: "온도보다 인프라의 준비 차이가 피해를 가릅니다.",
    facts: [
      "IPCC 해수면 범위 약 0.15~0.29m",
      "WHO의 일부 건강영향 추가 사망 추정이 적용되는 구간",
      "전력망·물·연안 시설의 장기 교체가 필요한 시점"
    ],
    sourceIds: ["ipcc-ar6", "who-climate-health"]
  },
  {
    period: "2080s",
    label: "인구 정점",
    title: "세계 증가와 국가별 감소가 동시에 진행됩니다.",
    facts: [
      "세계인구 약 103억 명으로 정점 전망",
      "인구 정점을 먼저 지난 국가는 노동·재정 구조 전환",
      "도시·지역별 수요 방향이 크게 갈릴 가능성"
    ],
    sourceIds: ["un-wpp-2024"]
  },
  {
    period: "2100",
    label: "시나리오의 차이",
    title: "선택한 배출 경로에 따라 위험의 크기가 크게 갈립니다.",
    facts: [
      "IPCC 세기말 온도 최선값 1.4°C·2.7°C·4.4°C",
      "해수면 가능 범위 0.28~1.01m",
      "해수면 상승은 2100년 이후에도 지속"
    ],
    sourceIds: ["ipcc-ar6"]
  }
];
