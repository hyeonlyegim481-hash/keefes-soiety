export const politicsMeta = {
  updatedAt: "2026-07-27",
  countryCount: 7,
  principle:
    "정치적 지지나 반대 점수를 만들지 않고, 공식 직책·공개된 정책 방향·법의 시행 상태와 경제로 전달되는 경로를 분리해 정리합니다.",
  sourcePolicy:
    "국가별 공식 기관과 법령 원문을 우선합니다. 공식 발표는 해당 정부의 입장이므로, 뉴스 영역에서는 복수 언론과 교차해 읽어야 합니다.",
  legalNotice:
    "법·제도 요약은 일반 정보입니다. 실제 적용 여부는 최신 원문, 하위 법령, 관할 기관 안내를 함께 확인해야 합니다."
};

export const politicalTransmissionPaths = [
  {
    id: "budget",
    label: "예산·세금",
    order: "01",
    lead: "정부 지출과 세율이 바뀝니다.",
    path: ["법안·예산안", "정부 지출·세부담", "소비·투자", "성장률·국채금리"],
    checkpoint: "발표액이 아니라 국회 통과 여부, 실제 집행액, 재원 조달 방식을 확인합니다."
  },
  {
    id: "regulation",
    label: "규제·산업정책",
    order: "02",
    lead: "기업의 비용과 시장 진입 조건이 달라집니다.",
    path: ["법률·시행령", "준수 비용·지원금", "기업 투자", "가격·고용·경쟁"],
    checkpoint: "시행일, 적용 대상, 유예기간, 위반 시 제재가 핵심입니다."
  },
  {
    id: "trade",
    label: "무역·외교",
    order: "03",
    lead: "관세와 제재가 공급망을 다시 짭니다.",
    path: ["정상·의회 결정", "관세·수출통제", "물량·원가", "환율·물가·기업이익"],
    checkpoint: "발표와 실제 발효를 구분하고, 품목·국가별 예외를 확인합니다."
  },
  {
    id: "confidence",
    label: "정책 신뢰",
    order: "04",
    lead: "정책의 예측 가능성이 금융가격에 반영됩니다.",
    path: ["정치 일정·갈등", "정책 불확실성", "투자 지연·위험 프리미엄", "주가·채권·통화"],
    checkpoint: "여론보다 법안 표결, 예산 시한, 중앙은행 독립성 같은 제도 신호를 봅니다."
  }
];

export const politicalCalendar = [
  {
    date: "2026-07-23",
    jurisdiction: "한국",
    title: "상법 개정 주요 조항 시행",
    detail: "이사의 충실의무 대상을 회사와 주주로 명확히 한 조항 등이 시행됐습니다.",
    tone: "effective"
  },
  {
    date: "2026-08-02",
    jurisdiction: "EU",
    title: "AI Act 일반 적용 단계",
    detail: "대부분의 일반 규정이 적용되는 시점이며 일부 고위험 체계는 별도 일정이 적용됩니다.",
    tone: "upcoming"
  },
  {
    date: "2026-09-10",
    jurisdiction: "한국",
    title: "상장회사 지배구조 추가 개정 시행",
    detail: "일정 규모 상장회사의 집중투표와 감사위원 선임 관련 조항이 시행될 예정입니다.",
    tone: "upcoming"
  },
  {
    date: "2026-11",
    jurisdiction: "미국",
    title: "연방 중간선거",
    detail: "하원 전체와 상원 일부가 선거 대상이며 이후 입법·예산 추진력이 달라질 수 있습니다.",
    tone: "calendar"
  }
];

export const countrySnapshots = [
  {
    id: "korea",
    name: "한국",
    code: "KR",
    region: "동아시아",
    system: "대통령제 · 단원제 국회",
    leadership: "이재명 대통령",
    leadershipDetail: "2026년 7월 현재 대통령실 공식 페이지 기준",
    institution: "행정부와 제22대 국회가 법률·예산을 각각 제안·심사하며, 헌법재판소와 법원이 사법 통제를 담당합니다.",
    currentState:
      "민생 물가와 성장, 자본시장 제도, AI·첨단산업, 공급망 대응이 경제정책의 주요 축입니다. 정책 발표보다 국회 심사와 하위 법령, 실제 예산 집행을 구분해서 볼 필요가 있습니다.",
    agenda: [
      "민생·물가와 적극적 재정 운용",
      "상법·자본시장 제도와 기업지배구조",
      "AI·첨단산업 및 핵심 공급망",
      "가계부채·주거와 지역 균형"
    ],
    economyLinks: [
      {
        title: "예산과 내수",
        body: "추경·본예산의 규모보다 집행 속도와 소비·고용으로 이어지는지를 확인합니다."
      },
      {
        title: "법과 자본시장",
        body: "상법 개정은 이사회 의사결정, 소수주주 보호, 기업의 자본조달 방식에 영향을 줄 수 있습니다."
      },
      {
        title: "대외정책과 원화",
        body: "미·중 통상정책과 안보 이슈는 수출 주문, 외국인 수급, 원/달러를 통해 전달됩니다."
      }
    ],
    watch: [
      "2027년도 예산안의 재원과 지출 구성",
      "상법 개정 뒤 기업 정관·이사회 운영 변화",
      "AI 기본법 하위 지침과 기업 준수 범위",
      "가계대출·부동산 대책의 실제 금융 조건"
    ],
    sources: [
      { label: "대한민국 대통령실", url: "https://www.president.go.kr/" },
      { label: "대한민국 국회", url: "https://www.assembly.go.kr/portal/main/main.do" },
      { label: "국가법령정보센터", url: "https://www.law.go.kr/" }
    ]
  },
  {
    id: "us",
    name: "미국",
    code: "US",
    region: "북아메리카",
    system: "연방 대통령제 · 양원제 의회",
    leadership: "도널드 트럼프 대통령",
    leadershipDetail: "미 백악관 공식 페이지 기준 제47대 대통령",
    institution: "대통령과 연방 의회가 권한을 나누며, 연방대법원과 주정부의 권한도 정책 시행 범위를 크게 좌우합니다.",
    currentState:
      "세제·재정 패키지 집행, 관세와 무역정책, 에너지·규제 완화, 디지털자산 제도화가 경제정책의 핵심 축입니다. 2026년 중간선거는 이후 의회 입법 구도에 영향을 줄 수 있습니다.",
    agenda: [
      "2025년 대규모 세제·지출법의 2026년 집행",
      "관세·수출통제와 공급망 재편",
      "에너지 생산과 규제정책",
      "스테이블코인 등 디지털자산 규칙"
    ],
    economyLinks: [
      {
        title: "관세와 물가",
        body: "품목별 관세는 수입단가와 기업 마진을 바꾸고 달러·아시아 수출주에도 영향을 줍니다."
      },
      {
        title: "감세와 국채",
        body: "세부담 완화가 수요를 받칠 수 있지만 재정적자와 국채 공급이 금리를 높이는지 함께 봐야 합니다."
      },
      {
        title: "의회와 정책 지속성",
        body: "중간선거 뒤 의회 다수당이 바뀌면 예산과 추가 법안의 통과 가능성이 달라질 수 있습니다."
      }
    ],
    watch: [
      "관세의 실제 발효 품목·세율과 법원 판단",
      "2026년 세법 적용에 따른 소비·투자 변화",
      "연방 예산 시한과 국채 발행",
      "11월 중간선거 이후 의회 구성"
    ],
    sources: [
      { label: "미국 백악관", url: "https://www.whitehouse.gov/administration/donald-j-trump/" },
      { label: "미국 의회 법률 현황", url: "https://www.congress.gov/public-laws/119th-congress" },
      { label: "미국 국세청", url: "https://www.irs.gov/newsroom" }
    ]
  },
  {
    id: "china",
    name: "중국",
    code: "CN",
    region: "동아시아",
    system: "중국공산당 영도 · 전국인민대표대회 체계",
    leadership: "시진핑 국가주석",
    leadershipDetail: "중국 국무원 공식 영문 자료 기준",
    institution: "당의 정책 방향을 바탕으로 국무원과 전국인민대표대회가 계획·법률·행정을 집행하는 구조입니다.",
    currentState:
      "2026~2030년 제15차 5개년 계획이 시작됐습니다. 내수 확대, 현대 산업체계, 기술 자립, 부동산·지방부채 안정, 대외 개방이 동시에 추진되는 국면입니다.",
    agenda: [
      "제15차 5개년 계획과 현대 산업체계",
      "소비 확대와 고용 안정",
      "AI·첨단제조·기술 자립",
      "부동산·지방부채 및 대외무역"
    ],
    economyLinks: [
      {
        title: "산업정책과 공급",
        body: "보조금·투자가 전기차, 배터리, 태양광, 반도체 공급을 늘리면 세계 가격과 경쟁 구도가 바뀝니다."
      },
      {
        title: "내수와 한국 수출",
        body: "중국 소비·설비투자의 실제 회복 여부는 한국 중간재와 소비재 주문에 직접 연결됩니다."
      },
      {
        title: "무역 갈등과 위안화",
        body: "관세·수출통제 대응은 우회무역, 생산기지 이동, 위안화와 원화 변동으로 이어질 수 있습니다."
      }
    ],
    watch: [
      "2026년 4.5~5% 성장 목표의 분기별 달성 경로",
      "소비 확대 계획이 가계소득과 서비스 소비로 이어지는지",
      "부동산 판매·지방정부 재정",
      "미국·EU와의 관세·수출통제 변화"
    ],
    sources: [
      {
        label: "중국 국무원 2026 정부업무보고",
        url: "https://english.www.gov.cn/english.www.gov.cn/news/202603/13/content_WS69b4b144c6d00ca5f9a09dfd.html"
      },
      {
        label: "중국 국무원 뉴스",
        url: "https://english.www.gov.cn/news"
      }
    ]
  },
  {
    id: "japan",
    name: "일본",
    code: "JP",
    region: "동아시아",
    system: "입헌군주제 · 의원내각제",
    leadership: "다카이치 사나에 총리",
    leadershipDetail: "2026년 2월 18일 제105대 총리 지명",
    institution: "총리는 국회가 지명하고 내각이 행정을 담당합니다. 중의원·참의원의 입법과 예산 심사가 정책 속도를 좌우합니다.",
    currentState:
      "제2차 다카이치 내각은 적극적 재정, 실질소득과 임금, 경제안보, AI·사이버, 에너지·식량안보를 주요 과제로 제시하고 있습니다.",
    agenda: [
      "물가 대응과 실질임금·가처분소득",
      "적극적 재정과 2026년 보정예산",
      "경제안보·에너지·핵심물자",
      "AI·정부 디지털화와 사이버 방어"
    ],
    economyLinks: [
      {
        title: "재정과 국채금리",
        body: "지출 확대가 성장 기대를 높이는 동시에 일본 국채금리와 엔화에 어떤 압력을 주는지 봅니다."
      },
      {
        title: "임금과 소비",
        body: "명목임금보다 물가를 뺀 실질임금이 개선돼야 내수 회복이 지속되기 쉽습니다."
      },
      {
        title: "경제안보와 설비투자",
        body: "반도체·에너지·사이버 지원은 일본 내 투자와 동아시아 공급망 배치를 바꿀 수 있습니다."
      }
    ],
    watch: [
      "식료품 소비세 논의의 법안화 여부",
      "보정예산 규모와 국채 발행",
      "임금 상승률과 서비스 물가",
      "AI·사이버 법의 구체적 집행 기준"
    ],
    sources: [
      { label: "일본 총리관저", url: "https://japan.kantei.go.jp/" },
      {
        label: "제2차 다카이치 내각 기본방침",
        url: "https://japan.kantei.go.jp/105/decisions/2026/_00001.html"
      },
      { label: "일본 디지털청", url: "https://www.digital.go.jp/en" }
    ]
  },
  {
    id: "russia",
    name: "러시아",
    code: "RU",
    region: "유라시아",
    system: "연방제 · 대통령 중심 집행 구조",
    leadership: "블라디미르 푸틴 대통령",
    leadershipDetail: "2024년 5월 새 임기 취임, 임기 6년",
    institution: "대통령이 국내·외 정책의 기본 방향을 정하고 정부와 연방의회가 예산·법률을 집행·심사합니다.",
    currentState:
      "전쟁과 국제 제재, 국방·안보 지출, 에너지 수출 경로가 정치와 경제를 동시에 규정하고 있습니다. 공식 발표만으로 보기 어려워 에너지 가격·물량과 중앙은행 자료를 함께 확인해야 합니다.",
    agenda: [
      "국방·안보와 재정지출",
      "제재 대응과 수입 대체",
      "석유·가스 수출시장 재편",
      "물가·루블·노동력 부족"
    ],
    economyLinks: [
      {
        title: "전쟁과 재정",
        body: "국방 지출은 일부 생산과 고용을 늘릴 수 있지만 민간 투자·인력·물가에 부담을 줄 수 있습니다."
      },
      {
        title: "제재와 공급망",
        body: "결제·기술·물류 제약은 수입 비용과 생산성, 교역 상대국 구성을 바꿉니다."
      },
      {
        title: "에너지와 재정수입",
        body: "수출 유가와 물량, 할인율, 운송경로가 정부 수입과 루블 흐름에 중요합니다."
      }
    ],
    watch: [
      "전쟁·협상과 추가 제재",
      "원유·가스 수출 물량과 실현 가격",
      "러시아 중앙은행의 금리·물가 판단",
      "연방예산의 국방·민간 지출 구성"
    ],
    sources: [
      { label: "러시아 대통령실", url: "https://en.kremlin.ru/structure/president" },
      { label: "러시아 중앙은행", url: "https://www.cbr.ru/eng/" }
    ]
  },
  {
    id: "eu",
    name: "유럽연합",
    code: "EU",
    region: "유럽",
    system: "초국가 연합 · 집행위·이사회·의회 공동 입법",
    leadership: "우르줄라 폰데어라이엔 집행위원장",
    leadershipDetail: "2024~2029년 제2기 집행위원회",
    institution: "집행위원회가 법안을 제안하고 유럽의회와 회원국 이사회가 공동 입법합니다. 규정과 지침은 적용 방식이 다릅니다.",
    currentState:
      "경쟁력과 규제 단순화, 방위·안보, 에너지 독립, 산업 탈탄소, AI 규칙 집행이 2026년 주요 의제입니다.",
    agenda: [
      "단일시장 경쟁력과 규제 단순화",
      "방위·안보 및 에너지 독립",
      "AI Act·디지털 규칙 집행",
      "CBAM·산업 탈탄소와 무역"
    ],
    economyLinks: [
      {
        title: "규칙의 역외효과",
        body: "EU에 수출하는 한국 기업도 탄소·AI·데이터 규칙에 맞춰 제품과 보고체계를 바꿔야 할 수 있습니다."
      },
      {
        title: "방위와 재정",
        body: "방위 지출 확대는 재정 규율, 국채 발행, 산업 수요를 함께 바꿉니다."
      },
      {
        title: "무역협정과 공급망",
        body: "인도 등과의 협정과 원자재 정책은 유럽 기업의 조달망과 한국 기업의 경쟁 조건에 영향을 줍니다."
      }
    ],
    watch: [
      "AI Act와 AI Omnibus의 실제 적용 일정",
      "CBAM 인증서 비용과 배출량 검증",
      "2028~2034 장기예산 협상",
      "방위·에너지 공동조달"
    ],
    sources: [
      {
        label: "EU 집행위원회 2026 업무계획",
        url: "https://commission.europa.eu/strategy-and-policy/strategy-documents/commission-work-programme/commission-work-programme-2026_en"
      },
      {
        label: "폰데어라이엔 집행위원장",
        url: "https://commission.europa.eu/about/organisation/president_en"
      }
    ]
  },
  {
    id: "india",
    name: "인도",
    code: "IN",
    region: "남아시아",
    system: "연방 의원내각제 · 양원제 의회",
    leadership: "나렌드라 모디 총리",
    leadershipDetail: "2024년 6월 세 번째 임기 시작",
    institution: "총리와 내각이 하원 신임을 바탕으로 행정을 이끌며 연방정부와 주정부가 정책 권한을 나눕니다.",
    currentState:
      "연립정부 아래 제조업, 인프라, 디지털 공공기반, 일자리, 대외무역 협정이 성장정책의 중심입니다. 주정부별 제도와 집행 차이도 큽니다.",
    agenda: [
      "제조업 육성과 글로벌 공급망 유치",
      "철도·전력·도시 등 인프라 투자",
      "디지털 공공기반과 금융 포용",
      "일자리·농촌소득과 무역협정"
    ],
    economyLinks: [
      {
        title: "공공투자와 민간투자",
        body: "인프라 지출이 물류비를 낮추고 민간 설비투자를 끌어내는지가 핵심입니다."
      },
      {
        title: "무역과 제조업",
        body: "관세·생산연계 인센티브와 무역협정은 글로벌 기업의 생산기지 선택에 영향을 줍니다."
      },
      {
        title: "연방과 주정부",
        body: "토지·전력·노동·허가의 실제 조건은 주별로 달라 중앙정부 발표와 현장 결과가 다를 수 있습니다."
      }
    ],
    watch: [
      "연립정부 내 주요 법안 합의",
      "자본지출과 민간 설비투자",
      "식품 물가·몬순·농촌소득",
      "EU 등 주요 무역협정의 이행"
    ],
    sources: [
      { label: "인도 총리실", url: "https://www.pmindia.gov.in/en/" },
      {
        label: "인도 예산",
        url: "https://www.indiabudget.gov.in/"
      }
    ]
  }
];

export const lawChanges = [
  {
    id: "kr-commercial-duty",
    jurisdiction: "한국",
    countryId: "korea",
    title: "상법: 이사의 충실의무와 주주 공평대우",
    shortTitle: "이사 충실의무 확대",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2025-07-22",
    effectiveAt: "2026-07-23",
    scope: "주식회사 이사와 주주",
    plain: "이사가 회사뿐 아니라 주주를 위해 직무를 충실히 하고 전체 주주의 이익을 공평하게 대우해야 한다는 원칙이 법에 명시됐습니다.",
    changes: [
      "제382조의3에 회사와 주주를 위한 충실의무를 명시",
      "총주주의 이익 보호와 전체 주주의 공평한 대우를 규정",
      "구체적 책임 범위는 향후 판례와 기업 실무를 함께 확인해야 함"
    ],
    economy:
      "이사회 의사결정, 합병·분할·자사주 등 이해상충 거래, 소수주주 보호와 한국 기업의 지배구조 평가에 영향을 줄 수 있습니다.",
    affected: ["상장·비상장 주식회사", "이사·이사회", "주주·기관투자자"],
    verify: ["회사 정관과 이사회 규정 변경", "법원 판례와 금융당국 후속 지침"],
    source: {
      publisher: "법제처 국가법령정보센터",
      label: "상법 제382조의3 원문",
      url: "https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031410871"
    }
  },
  {
    id: "kr-ai-basic",
    jurisdiction: "한국",
    countryId: "korea",
    title: "인공지능기본법: 지원과 신뢰 의무의 공통 틀",
    shortTitle: "AI 기본법",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2026-01-20 개정",
    effectiveAt: "2026-01-22 · 일부 2026-07-21",
    scope: "AI 개발·제공·이용 사업자와 공공기관",
    plain: "AI 산업 지원 체계와 고영향·생성형 AI의 투명성·안전 관련 기준을 하나의 기본법 안에 두고, 2026년부터 단계적으로 적용하고 있습니다.",
    changes: [
      "국가인공지능전략위원회와 기본계획 등 정책 추진 체계를 규정",
      "고영향 AI 판단·확인과 생성형 AI 투명성 관련 의무의 근거 마련",
      "학습용 데이터, AI 연구소, 취약계층 지원 등 산업·사회 지원 확대"
    ],
    economy:
      "AI 서비스의 문서화·표시·위험관리 비용이 생기는 동시에 연구개발, 데이터, 인프라 지원의 제도적 근거가 강화됩니다.",
    affected: ["AI 모델·서비스 기업", "고영향 분야 도입기관", "공공기관·이용자"],
    verify: ["고영향 AI 해당 여부", "시행령·고시별 유예와 세부 의무"],
    source: {
      publisher: "법제처 국가법령정보센터",
      label: "인공지능기본법 원문",
      url: "https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=&chrClsCd=010202&efYd=20260122&lsiSeq=282791&urlMode=lsInfoP"
    }
  },
  {
    id: "kr-labor-union",
    jurisdiction: "한국",
    countryId: "korea",
    title: "노동조합법: 사용자 범위와 교섭 절차",
    shortTitle: "노동조합법 개정",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2025-09-09",
    effectiveAt: "2026-03-10",
    scope: "원청·하청 구조의 사용자와 노동조합",
    plain: "근로계약 당사자가 아니어도 근로조건을 실질적이고 구체적으로 지배·결정하는 지위에 있으면 그 범위에서 사용자로 볼 수 있도록 바뀌었습니다.",
    changes: [
      "실질적 근로조건 결정 주체를 사용자 범위에 포함",
      "확대된 사용자와 노동조합 사이의 교섭 절차를 시행령에 보완",
      "교섭단위·공고·노동위원회 절차의 세부 기준 정비"
    ],
    economy:
      "원청의 노무관리·교섭 책임, 협력업체 계약, 분쟁 비용과 산업별 노사관계 운영 방식에 영향을 줄 수 있습니다.",
    affected: ["원청·플랫폼·다단계 도급 기업", "협력업체 근로자", "노동조합·노동위원회"],
    verify: ["실질적·구체적 지배 판단 사례", "산업별 교섭단위와 판정"],
    source: {
      publisher: "법제처 국가법령정보센터",
      label: "노동조합법 개정 원문",
      url: "https://law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20260310&lsiSeq=273667&urlMode=lsInfoP"
    }
  },
  {
    id: "kr-commercial-governance",
    jurisdiction: "한국",
    countryId: "korea",
    title: "상법: 집중투표와 감사위원 선임",
    shortTitle: "상장회사 지배구조",
    status: "upcoming",
    statusLabel: "시행 예정",
    enactedAt: "2025-09-09",
    effectiveAt: "2026-09-10",
    scope: "대통령령 기준에 해당하는 상장회사",
    plain: "일정 규모 이상 상장회사가 집중투표를 정관으로 배제하지 못하게 하고 감사위원 선임 구조를 조정하는 개정입니다.",
    changes: [
      "대상 상장회사의 집중투표 배제 제한",
      "감사위원회 구성·분리선임 관련 인원 기준 조정",
      "시행 뒤 최초 소집되는 해당 주주총회부터 적용되는 조항 확인 필요"
    ],
    economy:
      "이사 선임 경쟁, 소수주주의 이사회 참여 가능성, 기관투자자의 의결권 행사와 기업 주주총회 운영에 영향을 줍니다.",
    affected: ["대규모 상장회사", "이사회·감사위원회", "기관·소수주주"],
    verify: ["대통령령상 적용 회사 범위", "시행 후 첫 주주총회 적용례"],
    source: {
      publisher: "법제처 국가법령정보센터",
      label: "상법 개정문",
      url: "https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001702&lsRvsGubun=all"
    }
  },
  {
    id: "us-obbba",
    jurisdiction: "미국",
    countryId: "us",
    title: "Public Law 119-21: 2026년 세제·지출 변화",
    shortTitle: "대규모 세제·재정법",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2025-07-04",
    effectiveAt: "조항별 상이 · 다수 2026년 적용",
    scope: "개인·기업 세금, 복지·에너지·국경·국방 지출",
    plain: "2017년 개인소득세율 구조를 영구화하고 공제·세액공제·기업 투자와 여러 연방지출 규칙을 폭넓게 바꾼 대형 법률입니다.",
    changes: [
      "개인소득세 7개 세율 구조를 영구화",
      "2026년 표준공제·각종 공제와 세액공제 기준 변경",
      "기업 투자·에너지·복지·국경·국방 관련 다수 조항을 서로 다른 시점에 시행"
    ],
    economy:
      "가계 가처분소득과 기업투자를 지지할 수 있지만 연방 재정적자, 국채 공급, 산업별 세제 차이를 함께 봐야 합니다.",
    affected: ["미국 납세자", "미국 진출 기업", "에너지·제조·금융시장"],
    verify: ["각 조항의 과세연도와 종료일", "재무부·IRS 하위 지침"],
    source: {
      publisher: "미국 의회",
      label: "H.R.1 / Public Law 119-21",
      url: "https://www.congress.gov/bill/119th-congress/house-bill/1/summary"
    },
    secondarySource: {
      label: "IRS 2026 세제 안내",
      url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill"
    }
  },
  {
    id: "us-genius",
    jurisdiction: "미국",
    countryId: "us",
    title: "GENIUS Act: 지급형 스테이블코인 규제",
    shortTitle: "스테이블코인 법",
    status: "rulemaking",
    statusLabel: "하위규칙 마련",
    enactedAt: "2025-07-18",
    effectiveAt: "2026년 재무부 규칙 제정 진행",
    scope: "지급형 스테이블코인 발행자·은행·결제 사업자",
    plain: "달러 등 자산에 연동된 지급형 스테이블코인 발행자에게 준비자산, 공개, 감독과 자금세탁방지 기준을 두는 미국 연방 체계입니다.",
    changes: [
      "허가된 발행자와 연방·주 감독 체계를 마련",
      "유동자산 100% 준비와 월별 준비자산 공개 요구",
      "2026년 자금세탁방지·주 규제 동등성 등 하위규칙 제정 진행"
    ],
    economy:
      "달러 기반 디지털결제와 단기국채 수요, 은행·핀테크 경쟁, 해외 스테이블코인의 미국 접근 조건에 영향을 줄 수 있습니다.",
    affected: ["스테이블코인 발행자", "은행·핀테크", "거래소·결제 이용자"],
    verify: ["최종 규칙과 시행일", "해외 발행자 상호인정 요건"],
    source: {
      publisher: "미국 의회",
      label: "S.1582 / Public Law 119-27",
      url: "https://www.congress.gov/bill/119th-congress/senate-bill/1582/all-info"
    },
    secondarySource: {
      label: "미 재무부 2026 규칙 제안",
      url: "https://home.treasury.gov/news/press-releases/sb0435"
    }
  },
  {
    id: "eu-cbam",
    jurisdiction: "EU",
    countryId: "eu",
    title: "탄소국경조정제도(CBAM) 본단계",
    shortTitle: "CBAM 본격 시행",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2023년 규정",
    effectiveAt: "2026-01-01 본단계",
    scope: "철강·알루미늄·시멘트·비료·전력·수소 등 대상 수입",
    plain: "EU 수입자가 대상 상품의 내재배출량을 신고하고 그에 맞는 CBAM 인증서를 제출하는 본단계가 시작됐습니다.",
    changes: [
      "대상 상품 50톤 초과 수입자는 승인 신고자 지위 필요",
      "내재배출량 신고와 CBAM 인증서 제출 의무",
      "생산국에서 이미 낸 탄소가격은 조건에 따라 차감 가능"
    ],
    economy:
      "EU 수출기업은 배출량 측정·검증과 탄소비용을 가격·공급계약에 반영해야 하며 저탄소 공정 투자의 유인이 커집니다.",
    affected: ["EU 수입자", "한국 철강·알루미늄 등 수출기업", "검증·탄소회계 사업자"],
    verify: ["품목 코드와 50톤 기준", "실제 배출량 검증·인증서 가격"],
    source: {
      publisher: "유럽연합 집행위원회",
      label: "CBAM 공식 안내",
      url: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en"
    }
  },
  {
    id: "eu-ai-act",
    jurisdiction: "EU",
    countryId: "eu",
    title: "EU AI Act: 일반 적용과 수정 일정",
    shortTitle: "EU AI Act",
    status: "upcoming",
    statusLabel: "적용 확대 예정",
    enactedAt: "2024-08-01 발효",
    effectiveAt: "2026-08-02 일반 적용 · 일부 별도 일정",
    scope: "EU 시장에 AI를 제공·배포·사용하는 사업자",
    plain: "위험 수준에 따라 금지, 투명성, 문서화, 감독 의무를 나누는 규칙으로 2026년 8월 일반 적용 단계가 확대됩니다.",
    changes: [
      "금지 AI와 AI 리터러시는 2025년부터 이미 적용",
      "2026년 8월 대부분의 일반 규정 적용 확대",
      "AI Omnibus에 따라 규제 제품 내 일부 고위험 AI 일정은 2028년까지 연장"
    ],
    economy:
      "EU에 AI 제품·서비스를 공급하는 기업은 위험 분류, 데이터·문서, 투명성, 사람의 감독과 공급망 계약을 점검해야 합니다.",
    affected: ["AI 개발·배포 기업", "고위험 분야 도입기관", "EU 수출기업"],
    verify: ["AI Omnibus 최종 일정", "고위험 분류와 조화표준"],
    source: {
      publisher: "유럽연합 집행위원회",
      label: "AI Act 적용 일정",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    },
    secondarySource: {
      label: "EUR-Lex 규정 원문",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=en"
    }
  },
  {
    id: "cn-vat",
    jurisdiction: "중국",
    countryId: "china",
    title: "중국 증치세법과 시행조례",
    shortTitle: "부가가치세 법제화",
    status: "in-force",
    statusLabel: "시행 중",
    enactedAt: "2024-12-25",
    effectiveAt: "2026-01-01",
    scope: "중국 내 상품·서비스·무형자산·부동산 거래와 수입",
    plain: "기존 행정규정 중심의 증치세 체계를 법률로 올리고 과세 범위, 납세자, 세율 적용과 수출 영세율 기준을 시행조례로 구체화했습니다.",
    changes: [
      "상품·서비스·무형자산·부동산의 과세 범위를 법률로 규정",
      "납세자 구분과 세액 계산·세제 혜택 기준을 구체화",
      "일부 수출과 국경 간 서비스·무형자산의 영세율 기준 명확화"
    ],
    economy:
      "중국에서 판매·수입·수출하는 기업의 세금계산, 계약가격, 매입세액 공제와 공급망 구조에 영향을 줍니다.",
    affected: ["중국 내 사업자", "중국 수출입 기업", "국경 간 서비스 제공자"],
    verify: ["거래 유형별 세율·영세율", "지방 세무당국 집행과 세금계산서"],
    source: {
      publisher: "중국 국무원",
      label: "증치세법 시행조례 안내",
      url: "https://english.www.gov.cn/policies/latestreleases/202512/30/content_WS69539fa9c6d00ca5f9a08548.html"
    },
    secondarySource: {
      label: "전국인민대표대회 법률 공포",
      url: "https://www.npc.gov.cn/npc/c2/c30834/202412/t20241225_442015.html"
    }
  },
  {
    id: "jp-cyber",
    jurisdiction: "일본",
    countryId: "japan",
    title: "사이버대처능력강화법",
    shortTitle: "능동적 사이버 방어",
    status: "rulemaking",
    statusLabel: "단계 시행",
    enactedAt: "2025-05-16 성립 · 2025-05-23 공포",
    effectiveAt: "조항별 단계 시행",
    scope: "국가·중요 인프라·관련 통신 및 보안 사업자",
    plain: "중요 인프라의 사이버 피해를 막고 국가 대응 능력을 강화하기 위한 정보공유·관민협력·대응 권한의 법적 기반을 마련했습니다.",
    changes: [
      "중요 전자계산기 피해 예방을 위한 관민 협력 체계",
      "중요 인프라 사고 정보와 대응 체계 강화",
      "관계 법률 정비와 세부 제도는 단계적으로 시행"
    ],
    economy:
      "통신·전력·금융·운송 등 중요 인프라 기업의 보고, 보안투자, 정부 협력과 공급업체 관리 부담이 달라질 수 있습니다.",
    affected: ["중요 인프라 운영자", "통신·클라우드·보안기업", "일본 진출 공급업체"],
    verify: ["조항별 시행일", "대상 사업자·보고 범위와 하위 지침"],
    source: {
      publisher: "일본 내각관방",
      label: "사이버안보 법률 원문·설명",
      url: "https://www.cas.go.jp/jp/seisaku/cyber_anzen_hosyo_torikumi/index.html"
    }
  },
  {
    id: "jp-ai-promotion",
    jurisdiction: "일본",
    countryId: "japan",
    title: "AI 관련기술 연구개발·활용 촉진법",
    shortTitle: "일본 AI법",
    status: "in-force",
    statusLabel: "정책 집행",
    enactedAt: "2025-05",
    effectiveAt: "2025년 법 성립 · 2026년 기본계획 집행",
    scope: "정부·연구기관·AI 개발·활용 기업",
    plain: "엄격한 사전허가보다 연구개발·활용 촉진과 국가 전략·거버넌스에 중심을 둔 일본의 AI 기본 법체계입니다.",
    changes: [
      "AI 연구개발과 사회 활용 촉진의 국가 책무를 규정",
      "AI 기본계획과 정부 추진체계의 근거 마련",
      "2026년 정부 AI와 국내 기반모델 실증 등 정책 집행 확대"
    ],
    economy:
      "정부 조달과 국내 AI·클라우드 투자, 공공데이터 활용을 촉진하며 사업자는 별도의 개인정보·저작권·분야별 규칙도 함께 확인해야 합니다.",
    affected: ["AI·클라우드 기업", "정부 공급업체", "연구기관·공공기관"],
    verify: ["AI 기본계획의 사업별 예산", "분야별 지침과 기존 법률 적용"],
    source: {
      publisher: "일본 디지털청",
      label: "정부 AI와 AI법 집행",
      url: "https://www.digital.go.jp/en/policies/genai"
    }
  }
];
