export const glossaryMoreCategories = ["세금·연금", "경제위기·역사"];

export const glossaryMoreTerms = [
  { term: "승수효과", english: "Multiplier Effect", category: "거시경제", definition: "정부지출이나 투자의 최초 증가보다 국민소득이 더 크게 늘어나는 파급효과입니다.", related: ["재정승수", "한계소비성향", "총수요"] },
  { term: "구축효과", english: "Crowding-out Effect", category: "거시경제", definition: "정부의 자금수요가 금리를 올려 민간투자와 소비를 밀어내는 현상입니다.", related: ["재정적자", "국채", "민간투자"] },
  { term: "한계소비성향", english: "MPC, Marginal Propensity to Consume", category: "거시경제", definition: "소득이 한 단위 늘었을 때 소비가 얼마나 증가하는지를 나타내는 비율입니다.", related: ["승수효과", "저축", "가처분소득"] },
  { term: "총요소생산성", english: "TFP, Total Factor Productivity", category: "거시경제", definition: "노동과 자본 투입만으로 설명되지 않는 기술·경영 효율의 생산 기여도입니다.", related: ["생산성", "기술혁신", "잠재성장률"] },

  { term: "생활물가지수", english: "Living Price Index", category: "물가·고용", definition: "소비자가 자주 구입하고 지출 비중이 큰 생활필수품의 가격 변화를 모은 지수입니다.", related: ["소비자물가", "체감물가", "필수품"] },
  { term: "개인소비지출물가", english: "PCE Price Index", category: "물가·고용", definition: "미국 가계의 실제 소비 구성을 반영해 측정하는 물가지수로 연준이 중요하게 봅니다.", related: ["CPI", "근원 PCE", "FOMC"] },
  { term: "GDP 디플레이터", english: "GDP Deflator", category: "물가·고용", definition: "국내에서 생산된 모든 최종 재화와 서비스의 가격 변화를 나타내는 물가지표입니다.", related: ["명목 GDP", "실질 GDP", "물가"] },
  { term: "물가연동국채", english: "Inflation-linked Bond", category: "물가·고용", definition: "원금과 이자가 소비자물가에 연동되어 인플레이션 위험을 줄이는 국채입니다.", related: ["기대인플레이션", "실질금리", "국채"] },

  { term: "연방기금금리", english: "Federal Funds Rate", category: "금리·통화", definition: "미국 은행들이 지급준비금을 하루 동안 빌려줄 때 적용하는 금리로 연준의 정책금리입니다.", related: ["FOMC", "기준금리", "단기금리"] },
  { term: "점도표", english: "Dot Plot", category: "금리·통화", definition: "미국 연준 위원들이 예상하는 향후 정책금리 수준을 점으로 나타낸 표입니다.", related: ["FOMC", "금리전망", "연준"] },
  { term: "테일러준칙", english: "Taylor Rule", category: "금리·통화", definition: "물가와 경기의 균형에서 벗어난 정도를 이용해 적정 정책금리를 추정하는 규칙입니다.", related: ["중립금리", "인플레이션", "GDP 갭"] },
  { term: "역레포", english: "Reverse Repo", category: "금리·통화", definition: "중앙은행이 금융기관에 채권을 팔고 나중에 되사는 방식으로 단기 유동성을 흡수하는 거래입니다.", related: ["레포", "단기금리", "유동성"] },

  { term: "원·엔 환율", english: "KRW/JPY Exchange Rate", category: "외환·국제", definition: "원화와 일본 엔화의 교환비율로 한일 수출기업의 가격경쟁력에 영향을 줍니다.", related: ["엔화", "원화", "수출경쟁력"] },
  { term: "달러 유동성", english: "Dollar Liquidity", category: "외환·국제", definition: "국제금융시장에서 필요한 미국 달러를 원활하게 조달할 수 있는 정도입니다.", related: ["외화유동성", "통화스와프", "달러자금"] },
  { term: "환율 전가", english: "Exchange Rate Pass-through", category: "외환·국제", definition: "환율 변화가 수입가격과 소비자물가에 반영되는 정도입니다.", related: ["수입물가", "원화약세", "인플레이션"] },
  { term: "외환스와프", english: "FX Swap", category: "외환·국제", definition: "현재 통화를 교환하고 미래에 반대 방향으로 재교환하는 두 거래를 결합한 계약입니다.", related: ["선물환", "외화조달", "스와프포인트"] },

  { term: "알파", english: "Alpha", category: "주식·투자", definition: "시장위험을 고려한 뒤에도 기준지수보다 추가로 거둔 초과수익입니다.", related: ["베타", "벤치마크", "액티브투자"] },
  { term: "샤프지수", english: "Sharpe Ratio", category: "주식·투자", definition: "위험 한 단위를 감수해 얻은 초과수익을 나타내는 성과지표입니다.", related: ["변동성", "무위험수익률", "위험조정수익"] },
  { term: "모멘텀", english: "Momentum", category: "주식·투자", definition: "최근 강했던 자산이 당분간 강세를, 약했던 자산이 약세를 이어가는 경향입니다.", related: ["추세", "상대강도", "평균회귀"] },
  { term: "평균회귀", english: "Mean Reversion", category: "주식·투자", definition: "가격이나 수익률이 장기 평균에서 멀어졌다가 다시 평균 쪽으로 돌아오는 경향입니다.", related: ["모멘텀", "밸류에이션", "과잉반응"] },

  { term: "액면가", english: "Face Value", category: "채권·신용", definition: "채권 발행자가 만기에 상환하기로 약속한 원금 기준금액입니다.", related: ["쿠폰금리", "채권가격", "만기"] },
  { term: "할인채", english: "Discount Bond", category: "채권·신용", definition: "액면가보다 낮은 가격으로 발행하고 만기에 액면가를 지급하는 채권입니다.", related: ["제로쿠폰채", "액면가", "만기수익률"] },
  { term: "이표채", english: "Coupon Bond", category: "채권·신용", definition: "만기 전까지 정기적으로 이자를 지급하고 만기에 원금을 상환하는 채권입니다.", related: ["쿠폰", "액면가", "채권금리"] },
  { term: "자산유동화증권", english: "ABS, Asset-backed Securities", category: "채권·신용", definition: "대출·매출채권 등 자산에서 발생할 현금흐름을 담보로 발행하는 증권입니다.", related: ["유동화", "담보자산", "신용보강"] },

  { term: "매출채권", english: "Accounts Receivable", category: "기업·회계", definition: "기업이 상품을 외상으로 판매하고 아직 받지 못한 대금입니다.", related: ["운전자본", "대손충당금", "현금흐름"] },
  { term: "매입채무", english: "Accounts Payable", category: "기업·회계", definition: "기업이 원재료나 상품을 외상으로 구입하고 아직 지급하지 않은 대금입니다.", related: ["운전자본", "현금흐름", "단기부채"] },
  { term: "무형자산", english: "Intangible Asset", category: "기업·회계", definition: "특허권·소프트웨어·상표권처럼 물리적 형태는 없지만 경제적 가치가 있는 자산입니다.", related: ["상각", "특허", "영업권"] },
  { term: "영업권", english: "Goodwill", category: "기업·회계", definition: "기업 인수가격이 인수한 순자산의 공정가치를 초과한 부분입니다.", related: ["인수합병", "무형자산", "손상차손"] },

  { term: "순영업소득", english: "NOI, Net Operating Income", category: "부동산·가계", definition: "부동산 임대수입에서 운영비용을 뺀 이자·세금 차감 전 소득입니다.", related: ["임대수익", "캡레이트", "운영비"] },
  { term: "자본환원율", english: "Cap Rate", category: "부동산·가계", definition: "부동산의 순영업소득을 매입가격으로 나눈 수익률입니다.", related: ["NOI", "부동산가치", "금리"] },
  { term: "전월세전환율", english: "Rent Conversion Rate", category: "부동산·가계", definition: "전세보증금을 월세로 바꿀 때 적용되는 연간 환산 비율입니다.", related: ["전세", "월세", "보증금"] },
  { term: "미분양", english: "Unsold Housing", category: "부동산·가계", definition: "분양을 시작했지만 계약되지 않고 남은 주택 물량입니다.", related: ["주택공급", "건설경기", "악성미분양"] },

  { term: "자동안정화장치", english: "Automatic Stabilizer", category: "정책·제도", definition: "경기 변화에 따라 세금과 실업급여 등이 별도 정책 없이 자동으로 총수요를 완충하는 제도입니다.", related: ["누진세", "실업급여", "재정정책"] },
  { term: "재정승수", english: "Fiscal Multiplier", category: "정책·제도", definition: "정부지출이나 세금 변화 한 단위가 GDP를 얼마나 변화시키는지 나타내는 값입니다.", related: ["승수효과", "정부지출", "구축효과"] },
  { term: "기본소득", english: "Universal Basic Income", category: "정책·제도", definition: "소득이나 고용조건과 관계없이 모든 구성원에게 정기적으로 지급하는 소득입니다.", related: ["이전지출", "복지", "재원"] },
  { term: "규제샌드박스", english: "Regulatory Sandbox", category: "정책·제도", definition: "새 기술과 서비스가 일정 조건에서 기존 규제를 유예받고 시험할 수 있게 하는 제도입니다.", related: ["핀테크", "혁신", "실증특례"] },

  { term: "채굴", english: "Mining", category: "디지털경제", definition: "작업증명 블록체인에서 계산을 수행해 거래를 검증하고 새 코인을 보상받는 과정입니다.", related: ["비트코인", "해시레이트", "작업증명"] },
  { term: "반감기", english: "Halving", category: "디지털경제", definition: "비트코인 등에서 일정 주기마다 신규 발행 보상이 절반으로 줄어드는 규칙입니다.", related: ["공급량", "채굴보상", "비트코인"] },
  { term: "해시레이트", english: "Hash Rate", category: "디지털경제", definition: "작업증명 블록체인 네트워크가 초당 수행하는 계산량으로 보안과 채굴경쟁을 보여줍니다.", related: ["채굴", "네트워크보안", "난이도"] },
  { term: "스마트계약", english: "Smart Contract", category: "디지털경제", definition: "정해진 조건이 충족되면 블록체인에서 자동 실행되는 프로그램입니다.", related: ["블록체인", "디앱", "토큰"] },

  { term: "소득세", english: "Income Tax", category: "세금·연금", definition: "개인이나 법인이 일정 기간 얻은 소득에 부과되는 세금입니다.", related: ["과세표준", "누진세", "원천징수"] },
  { term: "법인세", english: "Corporate Tax", category: "세금·연금", definition: "법인의 사업연도 소득에 부과되는 세금입니다.", related: ["세전이익", "세율", "법인"] },
  { term: "부가가치세", english: "VAT, Value-added Tax", category: "세금·연금", definition: "상품과 서비스가 생산·유통되는 단계에서 새로 더해진 가치에 부과되는 소비세입니다.", related: ["소비세", "매입세액", "매출세액"] },
  { term: "양도소득세", english: "Capital Gains Tax", category: "세금·연금", definition: "부동산·주식 등 자산을 양도해 발생한 이익에 부과하는 세금입니다.", related: ["취득가액", "양도가액", "자본이득"] },
  { term: "종합부동산세", english: "Comprehensive Real Estate Tax", category: "세금·연금", definition: "일정 기준을 넘는 주택과 토지 보유자에게 부과되는 국세입니다.", related: ["공시가격", "보유세", "재산세"] },
  { term: "원천징수", english: "Withholding Tax", category: "세금·연금", definition: "소득을 지급하는 사람이 세금을 미리 떼어 정부에 납부하는 방식입니다.", related: ["근로소득", "연말정산", "소득세"] },
  { term: "세액공제", english: "Tax Credit", category: "세금·연금", definition: "계산된 세금에서 일정 금액을 직접 빼주는 제도입니다.", related: ["소득공제", "결정세액", "연말정산"] },
  { term: "국민연금", english: "National Pension", category: "세금·연금", definition: "가입자가 보험료를 내고 노령·장애·사망 때 급여를 받는 공적연금제도입니다.", related: ["연금보험료", "노령연금", "소득대체율"] },
  { term: "퇴직연금", english: "Retirement Pension", category: "세금·연금", definition: "근로자의 퇴직급여를 금융기관에 적립해 퇴직 후 연금 또는 일시금으로 지급하는 제도입니다.", related: ["DB형", "DC형", "IRP"] },
  { term: "연금소득", english: "Pension Income", category: "세금·연금", definition: "공적연금과 사적연금에서 정기적으로 받는 소득입니다.", related: ["연금소득세", "연금계좌", "노후소득"] },

  { term: "금융위기", english: "Financial Crisis", category: "경제위기·역사", definition: "금융기관과 시장의 신뢰가 무너져 신용공급과 자산거래가 급격히 위축되는 위기입니다.", related: ["신용경색", "뱅크런", "시스템리스크"] },
  { term: "외환위기", english: "Currency Crisis", category: "경제위기·역사", definition: "외화가 부족해 환율이 급등하고 국가와 기업의 대외지급 능력이 흔들리는 위기입니다.", related: ["외환보유액", "IMF", "자본유출"] },
  { term: "대공황", english: "Great Depression", category: "경제위기·역사", definition: "1929년 이후 세계적으로 생산·고용·물가와 금융시스템이 장기간 붕괴한 대규모 불황입니다.", related: ["주가폭락", "디플레이션", "뉴딜정책"] },
  { term: "닷컴버블", english: "Dot-com Bubble", category: "경제위기·역사", definition: "1990년대 말 인터넷기업의 기대가 과도하게 반영됐다가 2000년 전후 급락한 자산버블입니다.", related: ["기술주", "밸류에이션", "버블"] },
  { term: "서브프라임 모기지", english: "Subprime Mortgage", category: "경제위기·역사", definition: "신용도가 낮은 차입자에게 제공된 미국 주택담보대출로 2008년 금융위기의 주요 원인이 됐습니다.", related: ["MBS", "주택버블", "금융위기"] },
  { term: "테이퍼링", english: "Tapering", category: "경제위기·역사", definition: "중앙은행이 양적완화 자산매입 규모를 점진적으로 줄이는 과정입니다.", related: ["양적완화", "양적긴축", "유동성"] },
  { term: "긴축발작", english: "Taper Tantrum", category: "경제위기·역사", definition: "통화긴축 우려로 채권금리가 급등하고 신흥국 자금이 빠르게 이탈하는 시장충격입니다.", related: ["테이퍼링", "국채금리", "신흥국"] },
  { term: "블랙스완", english: "Black Swan", category: "경제위기·역사", definition: "발생 가능성을 미리 예상하기 어렵지만 일어나면 충격이 매우 큰 사건입니다.", related: ["꼬리위험", "위기", "불확실성"] },
  { term: "도덕적해이", english: "Moral Hazard", category: "경제위기·역사", definition: "손실을 다른 주체가 부담할 것으로 기대해 당사자가 더 큰 위험을 선택하는 현상입니다.", related: ["구제금융", "정보비대칭", "대마불사"] },
  { term: "대차대조표 침체", english: "Balance Sheet Recession", category: "경제위기·역사", definition: "자산가격 하락 뒤 가계와 기업이 투자보다 부채상환을 우선해 수요가 장기간 약해지는 침체입니다.", related: ["디레버리징", "자산버블", "부채축소"] }
];
