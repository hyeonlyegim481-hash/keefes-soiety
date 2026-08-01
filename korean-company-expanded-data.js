const DART_SOURCE_URL = "https://dart.fss.or.kr/dsab002/main.do";

const industryProfiles = Object.freeze({
  "finance-insurance": {
    sectorId: "ai-platforms",
    business: "은행·카드·증권·보험 또는 자산관리 사업에서 이자와 수수료, 운용손익을 만듭니다.",
    moat: "고객 기반과 자본규모, 신용평가·리스크 관리 경험, 판매 채널이 장기 경쟁력을 좌우합니다.",
    risk: "순이자마진 하락, 대손비용 증가, 부동산 익스포저와 자본비율 규제 변화가 이익을 흔들 수 있습니다.",
    watch: ["순이자마진과 비이자이익", "대손비용·연체율", "CET1 또는 지급여력비율"]
  },
  telecom: {
    sectorId: "ai-platforms",
    business: "이동통신·유선망과 데이터센터, 기업용 네트워크를 가입자와 기업 고객에게 제공합니다.",
    moat: "전국망과 주파수, 대규모 설비투자, 장기 가입자 관계가 신규 사업자의 진입을 어렵게 만듭니다.",
    risk: "요금 규제와 가입자 정체, 5G·AI 데이터센터 투자 부담, 플랫폼 사업의 낮은 수익성을 함께 봐야 합니다.",
    watch: ["무선 가입자당 매출", "설비투자와 잉여현금흐름", "데이터센터·기업사업 성장"]
  },
  "food-beverage": {
    sectorId: "climate-resilience",
    business: "가공식품과 음료를 생산해 대형 유통망·온라인·해외 법인을 통해 소비자에게 판매합니다.",
    moat: "브랜드 인지도와 레시피, 유통망·생산규모, 반복 구매가 원가 상승을 가격에 반영할 힘을 만듭니다.",
    risk: "곡물·유지·포장재 가격과 환율, 내수 소비 둔화, 해외 증설의 초기비용이 마진을 압박할 수 있습니다.",
    watch: ["국내외 판매량과 가격", "원재료·환율 부담", "해외 매출과 영업이익"]
  },
  "consumer-retail": {
    sectorId: "ai-platforms",
    business: "화장품·생활용품·패션·백화점 등 소비재를 브랜드와 온·오프라인 채널로 판매합니다.",
    moat: "브랜드 선호도와 매장·면세·온라인 유통망, 제품 개발 속도와 고객 데이터가 경쟁력의 핵심입니다.",
    risk: "소비심리 둔화, 중국·면세 수요 변화, 재고 할인과 마케팅비 증가가 수익성을 낮출 수 있습니다.",
    watch: ["채널별 매출과 객단가", "재고자산과 할인율", "해외·면세 매출 회복"]
  },
  "media-games": {
    sectorId: "ai-platforms",
    business: "게임·음악·영상과 지식재산권을 제작해 이용료, 공연, 광고와 라이선스로 수익화합니다.",
    moat: "인기 지식재산권과 팬·이용자 커뮤니티, 개발·제작 역량, 글로벌 유통 플랫폼이 반복 매출을 만듭니다.",
    risk: "신작·아티스트 성과 편중, 제작비 증가, 플랫폼 수수료와 규제·평판 변화로 실적 변동이 커질 수 있습니다.",
    watch: ["신작·콘텐츠 출시 일정", "이용자와 결제지표", "지식재산권별 매출 집중도"]
  },
  "chemicals-materials": {
    sectorId: "battery-mobility",
    business: "석유화학·철강·비철금속과 산업용 소재를 생산해 자동차·전자·건설 공급망에 판매합니다.",
    moat: "대규모 생산설비와 공정기술, 원료 조달망, 고객 인증과 제품 품질의 누적 경험이 진입장벽입니다.",
    risk: "중국 증설과 판가 하락, 원료·에너지 비용, 경기 둔화와 대규모 설비투자가 현금흐름을 압박할 수 있습니다.",
    watch: ["제품 스프레드와 가동률", "재고·운전자본", "설비투자와 순차입금"]
  },
  "shipbuilding-defense": {
    sectorId: "automation",
    business: "선박·엔진·항공기·방산체계를 수주해 장기간 설계·제작하고 유지보수 서비스를 제공합니다.",
    moat: "대형 설비와 인증, 장기 개발경험, 정부·글로벌 고객의 납품 실적이 높은 진입장벽을 만듭니다.",
    risk: "원가 상승과 공정 지연, 환율·선가 변동, 수출 승인과 특정 대형사업 의존이 수익성을 흔들 수 있습니다.",
    watch: ["신규 수주와 수주잔고", "예정원가·영업이익률", "인도 일정과 수출 승인"]
  },
  "construction-infra": {
    sectorId: "energy-infra",
    business: "주택·건축·토목·플랜트와 에너지 인프라를 설계·시공하고 일부 사업을 개발·운영합니다.",
    moat: "대형 프로젝트 수행실적과 시공능력, 금융조달·원가관리, 발주처 신뢰가 수주 경쟁력을 좌우합니다.",
    risk: "미분양과 프로젝트파이낸싱, 원가율 상승, 공기 지연·우발채무가 손익과 현금흐름을 악화할 수 있습니다.",
    watch: ["신규 수주와 수주잔고", "주택 미분양·PF 보증", "원가율과 영업현금흐름"]
  },
  "logistics-transport": {
    sectorId: "autonomous-logistics",
    business: "항공·해운·육상 운송과 창고·포워딩을 결합해 사람과 화물을 국내외로 이동시킵니다.",
    moat: "노선권과 선대·항공기, 글로벌 거점, 대형 화주와의 장기계약이 네트워크 효과를 만듭니다.",
    risk: "운임 급락, 유가·환율 상승, 공급 과잉과 경기 둔화가 높은 고정비 구조에서 이익을 크게 흔들 수 있습니다.",
    watch: ["운임과 수송량", "유가·환율·연료비", "선대·항공기 투자와 부채"]
  },
  "biotech-health": {
    sectorId: "bio-health",
    business: "전문의약품과 바이오 신약·백신을 연구하고 임상·허가를 거쳐 국내외에 판매합니다.",
    moat: "특허와 임상 데이터, 생산·품질 인증, 의료진·유통망 신뢰가 제품의 장기 경쟁력을 만듭니다.",
    risk: "임상 실패와 허가 지연, 특허 만료, 연구개발비 증가와 특정 제품 의존이 실적을 크게 바꿀 수 있습니다.",
    watch: ["핵심 파이프라인 임상", "주요 품목 처방·수출", "연구개발비와 현금 보유"]
  },
  "power-utilities": {
    sectorId: "energy-infra",
    business: "가스·정유·전력과 에너지 소재를 생산·수입·공급해 산업과 생활 인프라를 지탱합니다.",
    moat: "대규모 설비와 저장·배관망, 장기 조달계약, 정제·운영 기술과 규제 허가가 진입장벽입니다.",
    risk: "국제유가·가스가격과 환율, 정제마진·요금 규제, 에너지 전환 투자 부담이 손익을 흔들 수 있습니다.",
    watch: ["원료가격과 판매마진", "환율·재고평가손익", "순차입금과 전환 투자"]
  },
  "semiconductors-electronics": {
    sectorId: "ai-chips",
    business: "반도체와 카메라·기판·패키징·수동부품을 개발해 스마트폰·서버·자동차 고객에게 공급합니다.",
    moat: "미세공정·소재·패키징 기술과 고객 인증, 대규모 설비투자, 수율 개선 경험이 진입장벽입니다.",
    risk: "전자 수요의 재고 조정, 고객 집중, 설비투자 부담과 제품 가격 하락이 이익을 빠르게 흔들 수 있습니다.",
    watch: ["고부가 제품 매출 비중", "가동률·수율과 판가", "설비투자와 영업현금흐름"]
  },
  "software-platform": {
    sectorId: "ai-platforms",
    business: "메신저·검색·커머스·광고·핀테크를 하나의 계정과 데이터 기반 플랫폼에서 제공합니다.",
    moat: "대규모 이용자와 파트너 생태계, 결제·콘텐츠 연결, 축적된 데이터가 서비스 간 전환비용을 만듭니다.",
    risk: "플랫폼 규제와 광고경기, 신규 서비스 투자, 계열사 구조와 이용자 신뢰 문제가 수익성을 흔들 수 있습니다.",
    watch: ["핵심 서비스 이용자", "광고·커머스 성장", "신사업 손실과 현금흐름"]
  }
});

const companySeeds = Object.freeze([
  ["kb-financial", "KB금융", "105560", "finance-insurance", "은행·카드·증권·보험 금융그룹"],
  ["shinhan-financial", "신한지주", "055550", "finance-insurance", "은행·카드·증권·보험 금융그룹"],
  ["hana-financial", "하나금융지주", "086790", "finance-insurance", "은행·외환·증권·카드 금융그룹"],
  ["woori-financial", "우리금융지주", "316140", "finance-insurance", "은행 중심 종합금융그룹"],
  ["samsung-life", "삼성생명", "032830", "finance-insurance", "생명보험·자산운용"],
  ["mirae-asset-securities", "미래에셋증권", "006800", "finance-insurance", "증권·자산관리·투자은행"],
  ["sk-telecom", "SK텔레콤", "017670", "telecom", "이동통신·AI·데이터센터"],
  ["kt", "KT", "030200", "telecom", "통신·클라우드·미디어"],
  ["lg-uplus", "LG유플러스", "032640", "telecom", "이동통신·유선·기업인프라"],
  ["cj-cheiljedang", "CJ제일제당", "097950", "food-beverage", "식품·바이오소재"],
  ["amorepacific", "아모레퍼시픽", "090430", "consumer-retail", "화장품·뷰티 브랜드"],
  ["lg-household-healthcare", "LG생활건강", "051900", "consumer-retail", "화장품·생활용품·음료"],
  ["shinsegae", "신세계", "004170", "consumer-retail", "백화점·면세·유통"],
  ["hybe", "하이브", "352820", "media-games", "음악·공연·팬 플랫폼"],
  ["krafton", "크래프톤", "259960", "media-games", "게임·글로벌 지식재산권"],
  ["ncsoft", "엔씨소프트", "036570", "media-games", "온라인·모바일 게임"],
  ["kakao", "카카오", "035720", "software-platform", "메신저·광고·커머스·핀테크"],
  ["lotte-chemical", "롯데케미칼", "011170", "chemicals-materials", "석유화학·첨단소재"],
  ["korea-zinc", "고려아연", "010130", "chemicals-materials", "아연·연·귀금속·자원순환"],
  ["posco-holdings", "POSCO홀딩스", "005490", "chemicals-materials", "철강·이차전지소재·에너지"],
  ["hd-hyundai-heavy", "HD현대중공업", "329180", "shipbuilding-defense", "상선·해양플랜트·엔진"],
  ["hanwha-ocean", "한화오션", "042660", "shipbuilding-defense", "상선·특수선·해양플랜트"],
  ["samsung-heavy", "삼성중공업", "010140", "shipbuilding-defense", "고부가 선박·해양플랜트"],
  ["hanwha-aerospace", "한화에어로스페이스", "012450", "shipbuilding-defense", "항공엔진·지상방산·우주"],
  ["korea-aerospace-industries", "한국항공우주", "047810", "shipbuilding-defense", "군용기·헬기·항공우주"],
  ["lig-nex1", "LIG넥스원", "079550", "shipbuilding-defense", "유도무기·감시정찰·항공전자"],
  ["hyundai-engineering-construction", "현대건설", "000720", "construction-infra", "주택·플랜트·토목·에너지"],
  ["samsung-ct", "삼성물산", "028260", "construction-infra", "건설·상사·패션·리조트"],
  ["dl-enc", "DL이앤씨", "375500", "construction-infra", "주택·플랜트·토목"],
  ["hyundai-glovis", "현대글로비스", "086280", "logistics-transport", "자동차 물류·해운·유통"],
  ["korean-air", "대한항공", "003490", "logistics-transport", "국제선 여객·항공화물"],
  ["hmm", "HMM", "011200", "logistics-transport", "컨테이너·벌크 해운"],
  ["cj-logistics", "CJ대한통운", "000120", "logistics-transport", "택배·계약물류·글로벌 포워딩"],
  ["nongshim", "농심", "004370", "food-beverage", "라면·스낵·식품"],
  ["orion", "오리온", "271560", "food-beverage", "제과·간편식·글로벌 식품"],
  ["yuhan", "유한양행", "000100", "biotech-health", "전문의약품·신약 연구"],
  ["sk-biopharmaceuticals", "SK바이오팜", "326030", "biotech-health", "중추신경계 신약"],
  ["gc-biopharma", "GC녹십자", "006280", "biotech-health", "혈액제제·백신·희귀질환"],
  ["korea-gas", "한국가스공사", "036460", "power-utilities", "천연가스 도입·저장·공급"],
  ["s-oil", "S-OIL", "010950", "power-utilities", "정유·석유화학·윤활"],
  ["sk-innovation", "SK이노베이션", "096770", "power-utilities", "에너지·배터리·소재"],
  ["samsung-electro-mechanics", "삼성전기", "009150", "semiconductors-electronics", "적층세라믹콘덴서·카메라·기판"],
  ["lg-innotek", "LG이노텍", "011070", "semiconductors-electronics", "광학솔루션·기판·전장부품"],
  ["db-hitek", "DB하이텍", "000990", "semiconductors-electronics", "특화 파운드리·디스플레이칩"],
  ["hanmi-semiconductor", "한미반도체", "042700", "semiconductors-electronics", "HBM·반도체 후공정 장비"]
]);

function createCompany([id, name, ticker, industryId, role]) {
  const profile = industryProfiles[industryId];
  return {
    id,
    name,
    ticker,
    country: "한국",
    industryId,
    sectorId: profile.sectorId,
    role,
    snapshotStatus: "profile-only",
    fiscal: "기업 선택 시 시장지표 수집 · 공식 실적 별도 검증",
    revenue: "공식 실적 연결 대기",
    revenueGrowth: null,
    margin: null,
    profitability: "회사별 회계기준 확인 후 표시",
    cashSignal: "회사별 공시 기준 확인 후 표시",
    healthParts: null,
    business: `${name}: ${role} 기업입니다. ${profile.business}`,
    moat: profile.moat,
    risk: profile.risk,
    watch: profile.watch,
    source: {
      label: `${name} 최신 사업보고서 검색`,
      url: DART_SOURCE_URL
    }
  };
}

export const koreanExpandedCompanies = Object.freeze(companySeeds.map(createCompany));
