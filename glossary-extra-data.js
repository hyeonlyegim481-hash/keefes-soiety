export const glossaryExtraCategories = ["은행·금융", "행동경제"];

export const glossaryExtraTerms = [
  { term: "GDP 갭", english: "Output Gap", category: "거시경제", definition: "실제 생산 수준과 물가를 자극하지 않는 잠재 생산 수준의 차이입니다.", related: ["잠재성장률", "총수요", "인플레이션"] },
  { term: "경기선행지수", english: "Leading Economic Index", category: "거시경제", definition: "향후 경기 방향보다 먼저 움직이는 여러 경제지표를 합성한 지수입니다.", related: ["경기동행지수", "경기순환", "신규주문"] },
  { term: "경기동행지수", english: "Coincident Economic Index", category: "거시경제", definition: "현재 경기 상태와 비슷한 시점에 움직이는 생산·고용·소비 지표를 합성한 지수입니다.", related: ["경기선행지수", "산업생산", "취업자"] },
  { term: "디스인플레이션", english: "Disinflation", category: "거시경제", definition: "물가가 계속 오르지만 상승률은 낮아지는 현상입니다.", related: ["인플레이션", "디플레이션", "물가상승률"] },

  { term: "필립스곡선", english: "Phillips Curve", category: "물가·고용", definition: "실업률과 임금 또는 물가상승률 사이의 관계를 설명하는 경제학 개념입니다.", related: ["실업률", "임금상승률", "인플레이션"] },
  { term: "자연실업률", english: "Natural Rate of Unemployment", category: "물가·고용", definition: "경기가 균형 상태여도 직업 탐색과 산업 변화 때문에 존재하는 실업률입니다.", related: ["완전고용", "구조적실업", "필립스곡선"] },
  { term: "고용비용지수", english: "ECI, Employment Cost Index", category: "물가·고용", definition: "기업이 근로자에게 지급하는 임금과 복리후생 비용의 변화를 측정한 지수입니다.", related: ["임금상승률", "서비스물가", "고용"] },
  { term: "구인건수", english: "Job Openings", category: "물가·고용", definition: "기업이 채용하려고 열어둔 일자리 수로 노동수요의 강도를 보여줍니다.", related: ["JOLTS", "실업률", "노동수요"] },

  { term: "양적긴축", english: "QT, Quantitative Tightening", category: "금리·통화", definition: "중앙은행이 보유자산을 줄여 시중 유동성을 흡수하는 정책입니다.", related: ["양적완화", "중앙은행 대차대조표", "유동성"] },
  { term: "지급준비율", english: "Reserve Requirement Ratio", category: "금리·통화", definition: "은행이 예금 가운데 중앙은행 등에 의무적으로 보유해야 하는 자금의 비율입니다.", related: ["지급준비금", "통화승수", "은행"] },
  { term: "콜금리", english: "Call Rate", category: "금리·통화", definition: "금융기관끼리 초단기로 자금을 빌리고 빌려줄 때 적용하는 금리입니다.", related: ["단기금리", "기준금리", "자금시장"] },
  { term: "중립금리", english: "Neutral Rate", category: "금리·통화", definition: "경기를 자극하지도 억제하지도 않는 이론적인 실질 정책금리 수준입니다.", related: ["실질금리", "잠재성장률", "통화정책"] },

  { term: "금융계정", english: "Financial Account", category: "외환·국제", definition: "직접투자·증권투자·대출 등 국가 간 금융자산 거래를 기록한 국제수지 항목입니다.", related: ["경상수지", "자본이동", "국제수지"] },
  { term: "선물환", english: "Forward Exchange", category: "외환·국제", definition: "미래 특정 시점에 정한 환율로 통화를 교환하기로 하는 계약입니다.", related: ["환헤지", "환율", "통화선물"] },
  { term: "캐리트레이드", english: "Carry Trade", category: "외환·국제", definition: "금리가 낮은 통화로 자금을 빌려 금리가 높은 통화나 자산에 투자하는 전략입니다.", related: ["금리차", "환율", "엔캐리"] },
  { term: "외화유동성", english: "Foreign Currency Liquidity", category: "외환·국제", definition: "기업과 금융기관이 필요한 외화를 제때 조달하고 지급할 수 있는 능력입니다.", related: ["외환보유액", "통화스와프", "달러자금"] },

  { term: "상장지수펀드", english: "ETF, Exchange Traded Fund", category: "주식·투자", definition: "특정 지수나 자산 가격을 추종하며 주식처럼 거래소에서 사고팔 수 있는 펀드입니다.", related: ["인덱스펀드", "패시브자금", "추적오차"] },
  { term: "인덱스펀드", english: "Index Fund", category: "주식·투자", definition: "시장지수의 구성과 수익률을 그대로 따라가도록 운용하는 펀드입니다.", related: ["ETF", "패시브투자", "벤치마크"] },
  { term: "리밸런싱", english: "Rebalancing", category: "주식·투자", definition: "목표한 자산 비중을 유지하기 위해 오른 자산을 줄이고 낮아진 자산을 늘리는 조정입니다.", related: ["자산배분", "포트폴리오", "지수변경"] },
  { term: "주식분할", english: "Stock Split", category: "주식·투자", definition: "기업가치는 그대로 둔 채 한 주를 여러 주로 나눠 주당 가격을 낮추는 조치입니다.", related: ["액면분할", "주식수", "유동성"] },

  { term: "쿠폰금리", english: "Coupon Rate", category: "채권·신용", definition: "채권 액면가에 대해 발행자가 정기적으로 지급하기로 약속한 이자율입니다.", related: ["채권가격", "액면가", "만기수익률"] },
  { term: "만기수익률", english: "YTM, Yield to Maturity", category: "채권·신용", definition: "채권을 현재 가격에 사서 만기까지 보유할 때 기대되는 연환산 수익률입니다.", related: ["쿠폰", "채권가격", "만기"] },
  { term: "신용부도스와프", english: "CDS, Credit Default Swap", category: "채권·신용", definition: "채무자의 부도 위험을 다른 거래자에게 이전하는 신용파생계약입니다.", related: ["부도위험", "CDS 프리미엄", "신용스프레드"] },
  { term: "담보부채권", english: "Secured Bond", category: "채권·신용", definition: "부동산·매출채권 등 특정 자산을 담보로 제공하고 발행하는 채권입니다.", related: ["무담보채권", "담보가치", "회수율"] },

  { term: "헤지", english: "Hedge", category: "파생·위험", definition: "가격·금리·환율 변동으로 생길 손실을 줄이기 위해 반대 방향 포지션을 취하는 것입니다.", related: ["선물", "옵션", "위험관리"] },
  { term: "증거금", english: "Margin", category: "파생·위험", definition: "파생상품 거래의 계약 이행을 보증하기 위해 예치하는 자금입니다.", related: ["마진콜", "레버리지", "강제청산"] },
  { term: "숏커버링", english: "Short Covering", category: "파생·위험", definition: "공매도 투자자가 빌린 주식을 갚기 위해 시장에서 주식을 다시 사는 행위입니다.", related: ["공매도", "숏스퀴즈", "환매수"] },
  { term: "감마스퀴즈", english: "Gamma Squeeze", category: "파생·위험", definition: "옵션 매도자의 위험회피 매수가 기초자산 상승을 더 빠르게 만드는 현상입니다.", related: ["옵션", "델타헤지", "콜옵션"] },

  { term: "매출총이익", english: "Gross Profit", category: "기업·회계", definition: "매출에서 제품이나 상품을 생산·매입하는 직접 원가를 뺀 이익입니다.", related: ["매출원가", "매출총이익률", "영업이익"] },
  { term: "감가상각", english: "Depreciation", category: "기업·회계", definition: "설비와 건물 같은 유형자산의 취득원가를 사용기간에 걸쳐 비용으로 나누는 회계처리입니다.", related: ["CAPEX", "EBITDA", "유형자산"] },
  { term: "운전자본", english: "Working Capital", category: "기업·회계", definition: "영업에 필요한 단기자산과 단기부채의 차이로 일상적인 자금 여력을 보여줍니다.", related: ["매출채권", "재고", "매입채무"] },
  { term: "이자보상배율", english: "Interest Coverage Ratio", category: "기업·회계", definition: "영업이익을 이자비용으로 나눈 값으로 기업의 이자 지급 능력을 보여줍니다.", related: ["영업이익", "이자비용", "부채"] },

  { term: "수입물가지수", english: "Import Price Index", category: "무역·산업", definition: "해외에서 수입하는 상품의 원화 기준 가격 변화를 측정한 지수입니다.", related: ["환율", "국제유가", "소비자물가"] },
  { term: "보호무역", english: "Protectionism", category: "무역·산업", definition: "관세와 수입규제 등으로 국내 산업을 해외 경쟁으로부터 보호하는 정책입니다.", related: ["관세", "무역분쟁", "자유무역"] },
  { term: "리쇼어링", english: "Reshoring", category: "무역·산업", definition: "기업이 해외로 옮겼던 생산시설을 본국으로 다시 이전하는 전략입니다.", related: ["공급망", "오프쇼어링", "산업정책"] },
  { term: "산업생산지수", english: "Industrial Production Index", category: "무역·산업", definition: "광공업과 제조업 등의 생산량 변화를 지수로 나타낸 경기지표입니다.", related: ["가동률", "제조업", "경기동행지수"] },

  { term: "변동금리", english: "Floating Interest Rate", category: "부동산·가계", definition: "시장 기준금리 변화에 따라 일정 주기마다 적용금리가 바뀌는 금리방식입니다.", related: ["고정금리", "코픽스", "이자부담"] },
  { term: "고정금리", english: "Fixed Interest Rate", category: "부동산·가계", definition: "약정한 기간 동안 적용금리가 변하지 않는 금리방식입니다.", related: ["변동금리", "금리위험", "주택담보대출"] },
  { term: "깡통전세", english: "Underwater Jeonse", category: "부동산·가계", definition: "주택가격이 대출과 전세보증금 합계보다 낮아 보증금 회수가 위험해진 주택입니다.", related: ["역전세", "전세가율", "보증금"] },
  { term: "가계신용", english: "Household Credit", category: "부동산·가계", definition: "가계대출과 카드 외상구매 등 가계가 부담하는 전체 신용을 합한 통계입니다.", related: ["가계부채", "판매신용", "대출"] },

  { term: "예대마진", english: "Loan-deposit Spread", category: "은행·금융", definition: "은행의 대출금리와 예금금리 사이의 차이입니다.", related: ["순이자마진", "대출금리", "예금금리"] },
  { term: "순이자마진", english: "NIM, Net Interest Margin", category: "은행·금융", definition: "은행이 운용자산으로 벌어들인 순이자이익을 평균 이자수익자산으로 나눈 비율입니다.", related: ["예대마진", "은행수익", "조달비용"] },
  { term: "BIS 자기자본비율", english: "BIS Capital Ratio", category: "은행·금융", definition: "은행의 위험가중자산 대비 자기자본 비율로 손실 흡수 능력을 보여줍니다.", related: ["자기자본", "위험가중자산", "금융안정"] },
  { term: "연체율", english: "Delinquency Rate", category: "은행·금융", definition: "전체 대출 가운데 약속한 상환일을 넘긴 대출이 차지하는 비율입니다.", related: ["부실채권", "가계대출", "신용위험"] },
  { term: "대손충당금", english: "Loan Loss Provision", category: "은행·금융", definition: "금융기관이 대출 손실 가능성에 대비해 미리 비용으로 쌓아두는 금액입니다.", related: ["부실채권", "충당금적립률", "은행이익"] },
  { term: "뱅크런", english: "Bank Run", category: "은행·금융", definition: "예금자들이 은행의 지급 능력을 불신해 한꺼번에 예금을 인출하는 현상입니다.", related: ["유동성위기", "예금보험", "최종대부자"] },
  { term: "시스템리스크", english: "Systemic Risk", category: "은행·금융", definition: "한 금융기관이나 시장의 문제가 금융시스템 전체로 번질 위험입니다.", related: ["전염효과", "금융안정", "대마불사"] },
  { term: "예금자보호", english: "Deposit Insurance", category: "은행·금융", definition: "금융기관이 예금을 지급하지 못할 때 일정 한도까지 예금자를 보호하는 제도입니다.", related: ["예금보험공사", "뱅크런", "보호한도"] },
  { term: "그림자금융", english: "Shadow Banking", category: "은행·금융", definition: "은행과 비슷한 신용중개를 하지만 전통 은행규제 밖에서 이루어지는 금융활동입니다.", related: ["비은행금융", "유동화", "시스템리스크"] },
  { term: "최종대부자", english: "Lender of Last Resort", category: "은행·금융", definition: "금융위기 때 중앙은행이 일시적 유동성 부족 금융기관에 긴급자금을 공급하는 역할입니다.", related: ["중앙은행", "뱅크런", "유동성"] },

  { term: "손실회피", english: "Loss Aversion", category: "행동경제", definition: "같은 크기의 이익보다 손실에서 더 큰 심리적 고통을 느끼는 경향입니다.", related: ["전망이론", "위험회피", "처분효과"] },
  { term: "확증편향", english: "Confirmation Bias", category: "행동경제", definition: "자신의 기존 믿음을 지지하는 정보만 찾고 반대 정보는 과소평가하는 경향입니다.", related: ["인지편향", "반대증거", "과잉확신"] },
  { term: "앵커링", english: "Anchoring", category: "행동경제", definition: "처음 접한 숫자나 정보에 지나치게 의존해 이후 판단을 조정하는 경향입니다.", related: ["기준점", "가격판단", "인지편향"] },
  { term: "군집행동", english: "Herding", category: "행동경제", definition: "자신의 정보보다 다수의 행동을 따라 같은 방향으로 움직이는 현상입니다.", related: ["쏠림", "버블", "시장심리"] },
  { term: "처분효과", english: "Disposition Effect", category: "행동경제", definition: "이익 난 자산은 너무 빨리 팔고 손실 난 자산은 오래 보유하려는 경향입니다.", related: ["손실회피", "매몰비용", "투자심리"] },
  { term: "과잉확신", english: "Overconfidence", category: "행동경제", definition: "자신의 정보와 예측 능력을 실제보다 높게 평가하는 경향입니다.", related: ["잦은매매", "확증편향", "위험과소평가"] },
  { term: "현상유지편향", english: "Status Quo Bias", category: "행동경제", definition: "변화의 이익이 있어도 현재 상태를 그대로 유지하려는 경향입니다.", related: ["관성", "손실회피", "기본옵션"] },
  { term: "매몰비용", english: "Sunk Cost", category: "행동경제", definition: "이미 지출해 회수할 수 없으며 앞으로의 선택에서는 제외해야 하는 비용입니다.", related: ["기회비용", "처분효과", "의사결정"] },
  { term: "FOMO", english: "Fear of Missing Out", category: "행동경제", definition: "상승 기회를 놓칠까 두려워 충분한 분석 없이 뒤늦게 따라 사는 심리입니다.", related: ["추격매수", "군집행동", "버블"] },
  { term: "내러티브 경제학", english: "Narrative Economics", category: "행동경제", definition: "사람들 사이에 퍼지는 이야기와 믿음이 소비·투자와 경기 흐름에 영향을 준다는 관점입니다.", related: ["시장서사", "기대", "군집행동"] }
];
