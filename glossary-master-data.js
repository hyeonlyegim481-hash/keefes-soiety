export const MASTER_CORE_TARGET = 500;
export const MASTER_ADVANCED_TARGET = 855;

const subject = (name, english, description) => ({ name, english, description });
const lens = (name, english, description, use) => ({ name, english, description, use });

function buildFamily({ category, subjects, lenses, why, caution, anchor }) {
  return lenses.flatMap((point) => subjects.map((item) => ({
    term: `${item.name} ${point.name}`,
    english: `${item.english} ${point.english}`,
    category,
    definition: `${item.description} 여기에 ${point.name} 기준을 적용해 수치와 조건을 해석하는 세부 용어입니다. ${point.description}`,
    plain: `쉽게 말해 ${item.name}을 볼 때 ${point.name}을 따로 떼어 확인하는 것입니다. 상품 이름이나 큰 숫자만 보지 않고 실제 부담과 결과를 비교하게 해줍니다.`,
    why: `${why} ${point.use}`,
    example: `예를 들어 ${item.name} 관련 수치가 변했다면 ${point.name}도 같은 방향으로 움직였는지, 직전 기간과 비교해 변화가 일시적인지 확인합니다.`,
    caution,
    related: [item.name, point.name, anchor]
  })));
}

function roundRobin(groups) {
  const output = [];
  const maxLength = Math.max(...groups.map((group) => group.length));
  for (let index = 0; index < maxLength; index += 1) {
    for (const group of groups) {
      if (group[index]) output.push(group[index]);
    }
  }
  return output;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s·()\-_,./]/g, "");
}

function selectUnique(candidates, target, existingTerms) {
  const termKeys = new Set(existingTerms.map((item) => normalize(item.term)));
  const englishKeys = new Set(existingTerms.map((item) => normalize(item.english)));
  const selected = [];

  for (const item of candidates) {
    const termKey = normalize(item.term);
    const englishKey = normalize(item.english);
    if (!termKey || !englishKey || termKeys.has(termKey) || englishKeys.has(englishKey)) continue;
    selected.push(item);
    termKeys.add(termKey);
    englishKeys.add(englishKey);
    if (selected.length === target) break;
  }

  if (selected.length !== target) {
    throw new Error(`용어 확장 목표 ${target}개 중 ${selected.length}개만 생성됐습니다.`);
  }
  return selected;
}

const savingsSubjects = [
  subject("보통예금", "Demand Deposit", "필요할 때 자유롭게 입출금할 수 있는 은행 예금입니다."),
  subject("정기예금", "Time Deposit", "목돈을 정한 기간 맡기고 약정 이자를 받는 저축상품입니다."),
  subject("자유적금", "Flexible Installment Savings", "납입 시기와 금액을 비교적 자유롭게 정하는 적립식 상품입니다."),
  subject("정액적금", "Fixed Installment Savings", "매달 정해진 금액을 약정 기간 동안 납입하는 적립식 상품입니다."),
  subject("파킹통장", "Parking Account", "짧게 맡겨도 비교적 높은 금리를 제시하는 수시입출금 계좌입니다."),
  subject("저축은행예금", "Savings Bank Deposit", "저축은행이 자금을 조달하기 위해 판매하는 예금상품입니다."),
  subject("외화예금", "Foreign Currency Deposit", "달러나 엔화 등 외국 통화로 보유하는 예금상품입니다."),
  subject("청년우대저축", "Youth Preferential Savings", "일정한 연령과 소득 요건을 충족한 청년에게 우대 조건을 주는 저축입니다."),
  subject("주택청약종합저축", "Housing Subscription Savings", "주택 청약 자격과 저축 기능을 함께 제공하는 전용 계좌입니다."),
  subject("CMA", "Cash Management Account", "증권사가 단기금융상품 등에 자금을 운용해 수익을 제공하는 계좌입니다."),
  subject("MMF", "Money Market Fund", "만기가 짧은 채권과 단기금융상품에 투자하는 펀드입니다."),
  subject("예금성상품", "Deposit-like Product", "원금 보관과 이자 수취를 주된 목적으로 이용하는 금융상품 묶음입니다.")
];

const savingsLenses = [
  lens("표시금리", "Posted Rate", "광고나 상품설명서에 제시된 기본 연이율을 뜻합니다.", "우대조건 적용 전 기준 수익을 비교하는 데 필요합니다."),
  lens("우대금리", "Preferential Rate", "급여이체·카드사용 등 조건을 채웠을 때 추가되는 금리를 뜻합니다.", "실제로 달성 가능한 조건인지 판단해야 최종 이자를 정확히 계산할 수 있습니다."),
  lens("만기수령액", "Maturity Proceeds", "원금과 세후이자를 합쳐 만기에 받게 되는 금액입니다.", "금리 숫자보다 실제 손에 들어오는 돈을 비교하게 해줍니다."),
  lens("중도해지이율", "Early Withdrawal Rate", "약정 만기 전에 해지할 때 적용되는 낮은 이율입니다.", "비상자금으로 쓸 가능성이 있으면 만기금리보다 더 중요할 수 있습니다."),
  lens("예금자보호", "Deposit Protection", "금융회사 부실 때 법정 한도 안에서 보호되는 대상과 범위를 뜻합니다.", "상품명이 예금처럼 보여도 보호 대상이 아닐 수 있어 반드시 확인해야 합니다.")
];

const loanSubjects = [
  subject("신용대출", "Unsecured Personal Loan", "개인의 소득과 신용도를 바탕으로 담보 없이 빌리는 대출입니다."),
  subject("마이너스통장", "Overdraft Credit Line", "한도 안에서 필요한 만큼 꺼내 쓰고 사용액에 이자를 내는 대출입니다."),
  subject("주택담보대출", "Mortgage Loan", "주택을 담보로 제공하고 장기간 자금을 빌리는 대출입니다."),
  subject("전세자금대출", "Jeonse Loan", "전세보증금 마련을 위해 보증이나 담보를 이용하는 대출입니다."),
  subject("집단대출", "Group Mortgage Loan", "분양사업장의 여러 계약자를 대상으로 일괄 심사해 제공하는 대출입니다."),
  subject("중도금대출", "Interim Payment Loan", "분양대금 중 계약금과 잔금 사이의 중도금을 납부하기 위한 대출입니다."),
  subject("자동차대출", "Auto Loan", "자동차 구매대금을 마련하기 위해 이용하는 할부성 대출입니다."),
  subject("학자금대출", "Student Loan", "등록금과 생활비 등 교육비를 지원하기 위한 정책성 대출입니다."),
  subject("카드론", "Long-term Card Loan", "신용카드회사가 회원에게 제공하는 장기 카드대출입니다."),
  subject("현금서비스", "Short-term Card Loan", "카드 한도 안에서 단기간 현금을 빌리는 고금리 대출입니다."),
  subject("리볼빙", "Revolving Credit", "카드대금 일부만 결제하고 나머지를 다음 달로 넘기는 약정입니다."),
  subject("사업자대출", "Business Loan", "개인사업자나 법인이 운영·투자 자금을 마련하기 위해 받는 대출입니다."),
  subject("정책서민금융", "Policy Inclusive Finance", "정부와 공공기관이 저소득·저신용층을 지원하는 금융상품입니다."),
  subject("보험계약대출", "Policy Loan", "보험계약의 해약환급금 범위 안에서 자금을 빌리는 대출입니다.")
];

const loanLenses = [
  lens("적용금리", "Applied Interest Rate", "기준금리와 가산금리, 우대금리를 반영해 실제 계약에 적용되는 금리입니다.", "광고 최저금리와 본인의 실제 금리를 구분하게 해줍니다."),
  lens("원리금상환액", "Debt Service Payment", "약정 기간에 갚아야 할 원금과 이자를 합한 금액입니다.", "월 소득으로 감당 가능한 부채인지 판단하는 직접적인 기준입니다."),
  lens("총대출비용", "Total Borrowing Cost", "전체 기간의 이자와 보증료·인지세·각종 수수료를 더한 비용입니다.", "금리만 낮아 보이는 상품 사이의 실질 비용을 비교할 수 있습니다."),
  lens("중도상환수수료", "Prepayment Fee", "약정 만기 전에 원금을 갚을 때 금융회사가 부과할 수 있는 비용입니다.", "대환이나 조기상환 계획이 있다면 절감 이자와 함께 계산해야 합니다."),
  lens("연체위험", "Delinquency Risk", "납입일을 넘겨 연체이자와 신용도 하락이 발생할 가능성입니다.", "상환 여유자금과 자동이체 관리가 왜 필요한지 보여줍니다.")
];

const accountSubjects = [
  subject("연금저축", "Pension Savings", "노후자금을 준비하면서 일정 요건 아래 세액공제를 받는 장기계좌입니다."),
  subject("개인형퇴직연금", "Individual Retirement Pension", "퇴직금과 개인 납입금을 함께 운용할 수 있는 퇴직연금 계좌입니다."),
  subject("확정급여형퇴직연금", "Defined Benefit Retirement Plan", "퇴직 때 받을 급여가 근속기간과 임금에 따라 정해지는 제도입니다."),
  subject("확정기여형퇴직연금", "Defined Contribution Retirement Plan", "회사가 납입한 부담금을 근로자가 운용하고 결과를 부담하는 제도입니다."),
  subject("중개형 ISA", "Brokerage ISA", "여러 금융상품을 한 계좌에서 운용하며 세제 혜택을 받을 수 있는 계좌입니다."),
  subject("청년도약계좌", "Youth Leap Account", "청년의 중장기 자산형성을 지원하기 위해 정부기여금을 더하는 계좌입니다."),
  subject("증권종합계좌", "General Securities Account", "주식·채권·펀드 등 여러 증권상품을 거래하는 기본 계좌입니다."),
  subject("위탁매매계좌", "Brokerage Trading Account", "투자자가 증권사에 주문을 위탁해 시장에서 거래하는 계좌입니다."),
  subject("비과세종합저축", "Tax-exempt Comprehensive Savings", "일정 자격을 충족한 사람이 이자·배당소득 비과세를 받을 수 있는 저축입니다."),
  subject("개인연금보험", "Individual Pension Insurance", "보험료를 장기간 납입한 뒤 연금 형태로 수령하는 보험상품입니다."),
  subject("퇴직연금계좌", "Retirement Pension Account", "퇴직급여를 보관하고 노후까지 금융상품으로 운용하는 전용 계좌입니다."),
  subject("장기저축계좌", "Long-term Savings Account", "오랜 기간 자금을 적립해 목돈과 장기 목표를 준비하는 계좌입니다.")
];

const accountLenses = [
  lens("납입한도", "Contribution Limit", "세제 혜택이나 제도상 인정되는 연간 납입 상한입니다.", "여러 계좌를 함께 이용할 때 중복 한도를 계산하게 해줍니다."),
  lens("세액공제", "Tax Credit", "납입액 일부를 산출세액에서 직접 차감해주는 혜택입니다.", "환급액은 소득과 납부세액에 따라 달라진다는 점을 확인해야 합니다."),
  lens("운용수익률", "Investment Return", "계좌 안 자산의 가격 변화와 이자·배당을 합친 성과입니다.", "세제 혜택과 별개로 상품 선택과 비용이 장기 결과를 좌우합니다."),
  lens("중도인출", "Early Withdrawal", "정해진 사유나 조건 아래 만기 전에 자금을 꺼내는 절차입니다.", "인출 가능 여부와 세금 추징을 미리 확인하게 해줍니다."),
  lens("만기과세", "Maturity Taxation", "만기 또는 연금 수령 때 이익에 적용되는 세금 방식입니다.", "가입 때 받은 혜택과 수령 때 부담할 세금을 함께 비교해야 합니다.")
];

const macroSubjects = [
  subject("국내총생산", "Gross Domestic Product", "한 나라 안에서 생산된 최종 재화와 서비스의 부가가치를 합한 지표입니다."),
  subject("국민총소득", "Gross National Income", "국민이 국내외에서 벌어들인 소득을 합한 지표입니다."),
  subject("민간소비", "Private Consumption", "가계와 민간 비영리단체가 재화와 서비스에 지출한 금액입니다."),
  subject("정부소비", "Government Consumption", "정부가 공공서비스 제공을 위해 사용한 소비지출입니다."),
  subject("설비투자", "Equipment Investment", "기업이 기계·운송장비·정보기술 설비 등에 지출한 투자입니다."),
  subject("건설투자", "Construction Investment", "주거·상업용 건물과 토목시설 건설에 투입된 투자입니다."),
  subject("재고투자", "Inventory Investment", "생산 후 판매되지 않고 재고로 쌓인 물량의 변화를 뜻합니다."),
  subject("상품수출", "Goods Exports", "국내에서 생산한 상품을 해외에 판매한 금액과 물량입니다."),
  subject("상품수입", "Goods Imports", "해외에서 생산한 상품을 국내로 들여온 금액과 물량입니다."),
  subject("산업생산", "Industrial Production", "광공업과 제조업 등의 생산활동 변화를 보여주는 지표입니다."),
  subject("소매판매", "Retail Sales", "소비재가 소매단계에서 판매된 규모와 변화를 나타냅니다."),
  subject("서비스업생산", "Service Production", "도소매·운수·금융 등 서비스업의 생산활동을 측정합니다."),
  subject("취업자수", "Number of Employed Persons", "조사 기준기간에 수입을 목적으로 일한 사람의 수입니다."),
  subject("고용률", "Employment Rate", "생산가능인구 가운데 취업자가 차지하는 비율입니다."),
  subject("실업률", "Unemployment Rate", "경제활동인구 중 구직 중인 실업자가 차지하는 비율입니다."),
  subject("경제활동참가율", "Labor Force Participation Rate", "생산가능인구 중 취업자와 구직자가 차지하는 비율입니다."),
  subject("소비자물가", "Consumer Prices", "가계가 구입하는 대표 상품과 서비스 가격의 변화를 측정합니다."),
  subject("근원물가", "Core Prices", "변동성이 큰 일부 품목을 제외해 기조적 물가 흐름을 보여줍니다."),
  subject("생산자물가", "Producer Prices", "생산자가 국내시장에 공급하는 상품과 서비스 가격을 측정합니다."),
  subject("수입물가", "Import Prices", "해외에서 수입하는 상품의 원화 기준 가격 변화를 나타냅니다."),
  subject("가계소득", "Household Income", "가계가 근로·사업·재산·이전 등으로 얻은 소득입니다."),
  subject("처분가능소득", "Disposable Income", "소득에서 세금과 사회부담금을 빼 실제로 소비·저축할 수 있는 금액입니다."),
  subject("노동생산성", "Labor Productivity", "노동 한 단위를 투입해 만들어낸 산출의 크기입니다."),
  subject("단위노동비용", "Unit Labor Cost", "산출 한 단위를 생산하는 데 드는 노동비용입니다."),
  subject("경상수지", "Current Account Balance", "상품·서비스·소득의 대외 거래 결과를 합한 수지입니다."),
  subject("통합재정수지", "Consolidated Fiscal Balance", "정부의 전체 수입과 지출 차이를 보여주는 재정지표입니다.")
];

const macroLenses = [
  lens("전년동기비", "Year-on-year Change", "1년 전 같은 기간과 비교한 증감률입니다.", "계절 영향을 줄이지만 기저효과가 생길 수 있습니다."),
  lens("전기비", "Period-on-period Change", "직전 월이나 분기와 비교한 증감률입니다.", "현재 변화의 속도를 빠르게 포착하는 데 유용합니다."),
  lens("계절조정치", "Seasonally Adjusted Value", "명절·휴가·날씨처럼 반복되는 계절요인을 통계적으로 제거한 값입니다.", "인접 기간의 경기 방향을 비교할 때 사용합니다."),
  lens("성장기여도", "Growth Contribution", "전체 증감률 가운데 해당 항목이 밀어 올리거나 내린 정도입니다.", "비중과 증가율을 함께 반영해 성장의 원인을 분해합니다."),
  lens("장기추세", "Long-term Trend", "단기 변동을 완화해 여러 해 동안 이어지는 방향을 보여줍니다.", "한두 번의 급등락을 구조 변화로 오해하지 않게 합니다."),
  lens("잠정치", "Preliminary Estimate", "빠른 공표를 위해 일부 자료로 먼저 계산한 뒤 수정될 수 있는 값입니다.", "최신성과 정확성 사이의 차이를 이해하게 해줍니다.")
];

const stockSubjects = [
  subject("보통주", "Common Stock", "의결권과 잔여이익 청구권을 가진 일반적인 기업 지분증권입니다."),
  subject("우선주", "Preferred Stock", "의결권이 제한되는 대신 배당이나 잔여재산에서 우선권을 가진 주식입니다."),
  subject("대형주", "Large-cap Stock", "시가총액이 상대적으로 큰 기업의 주식입니다."),
  subject("중형주", "Mid-cap Stock", "시가총액이 대형주와 소형주 사이인 기업의 주식입니다."),
  subject("소형주", "Small-cap Stock", "시가총액이 상대적으로 작은 기업의 주식입니다."),
  subject("성장주", "Growth Stock", "매출과 이익이 시장 평균보다 빠르게 늘 것으로 기대되는 주식입니다."),
  subject("가치주", "Value Stock", "이익과 자산에 비해 시장가격이 낮다고 평가되는 주식입니다."),
  subject("배당주", "Dividend Stock", "배당을 꾸준히 지급하는 특성이 강조되는 주식입니다."),
  subject("경기민감주", "Cyclical Stock", "실적이 경기 확장과 침체에 크게 반응하는 기업의 주식입니다."),
  subject("경기방어주", "Defensive Stock", "경기 변동에도 수요와 이익이 비교적 안정적인 기업의 주식입니다."),
  subject("공모주", "Initial Public Offering Stock", "기업이 상장을 위해 일반 투자자에게 처음 공개 모집하는 주식입니다."),
  subject("유상증자주", "Rights Offering Stock", "신주 발행을 통해 자본을 조달하는 기업의 주식입니다."),
  subject("자사주", "Treasury Stock", "회사가 발행 후 다시 취득해 보유하는 자기 회사 주식입니다."),
  subject("코스피", "KOSPI", "유가증권시장 상장종목의 가격 흐름을 나타내는 대표 지수입니다."),
  subject("코스닥", "KOSDAQ", "코스닥시장 상장종목의 가격 흐름을 나타내는 대표 지수입니다."),
  subject("상장리츠", "Listed REIT", "부동산에 투자해 임대료와 매각수익을 배분하는 상장 증권입니다."),
  subject("국내주식 ETF", "Domestic Equity ETF", "국내 주식이나 지수를 추종하며 거래소에서 매매되는 펀드입니다."),
  subject("해외주식 ETF", "Foreign Equity ETF", "해외 주식이나 지수를 추종하며 국내외 거래소에서 매매되는 펀드입니다."),
  subject("인버스 ETF", "Inverse ETF", "기초지수의 일간 수익률과 반대 방향 성과를 목표로 하는 펀드입니다."),
  subject("레버리지 ETF", "Leveraged ETF", "기초지수 일간 수익률의 일정 배수를 목표로 하는 펀드입니다."),
  subject("액티브 ETF", "Active ETF", "운용자의 판단으로 비교지수보다 높은 성과를 추구하는 상장펀드입니다."),
  subject("인덱스펀드", "Index Fund", "시장지수의 구성과 성과를 따라가도록 운용하는 펀드입니다."),
  subject("배당성장주", "Dividend Growth Stock", "배당금을 장기간 늘려온 기업의 주식입니다."),
  subject("고배당주", "High Dividend Stock", "현재 주가 대비 배당금 비율이 상대적으로 높은 주식입니다.")
];

const stockLenses = [
  lens("거래가격", "Trading Price", "시장에서 매수·매도 주문이 체결된 가격입니다.", "가격은 기업가치뿐 아니라 수급과 심리에도 움직인다는 점을 보여줍니다."),
  lens("거래량", "Trading Volume", "일정 기간 실제로 거래된 주식이나 좌수의 규모입니다.", "가격 움직임에 시장 참여가 얼마나 실렸는지 확인하게 합니다."),
  lens("배당수익률", "Dividend Yield", "주당 배당금을 현재 가격으로 나눈 비율입니다.", "가격 대비 현금배당 수준을 비교하는 데 쓰입니다."),
  lens("가격변동성", "Price Volatility", "수익률이 평균 주변에서 흔들리는 정도입니다.", "기대수익과 별개로 감당해야 할 가격위험을 보여줍니다."),
  lens("총수익률", "Total Return", "가격 변화와 배당·분배금을 합친 전체 투자성과입니다.", "배당을 제외한 주가 수익률과 실제 보유성과를 구분하게 합니다.")
];

const businessSubjects = [
  subject("매출액", "Revenue", "기업이 상품과 서비스를 판매해 인식한 총수익입니다."),
  subject("매출원가", "Cost of Sales", "판매된 제품과 상품을 생산·매입하는 데 직접 든 원가입니다."),
  subject("매출총이익", "Gross Profit", "매출액에서 매출원가를 뺀 이익입니다."),
  subject("판매관리비", "Selling and Administrative Expense", "판매와 관리 활동에 사용한 인건비·광고비·임차료 등의 비용입니다."),
  subject("영업이익", "Operating Profit", "본업의 매출에서 영업 관련 비용을 뺀 이익입니다."),
  subject("EBITDA", "EBITDA", "이자·세금·감가상각 전 영업성과를 나타내는 지표입니다."),
  subject("당기순이익", "Net Income", "모든 수익과 비용·세금을 반영한 최종 회계이익입니다."),
  subject("영업현금흐름", "Operating Cash Flow", "본업에서 실제로 들어오고 나간 현금의 순액입니다."),
  subject("투자현금흐름", "Investing Cash Flow", "설비·투자자산의 취득과 처분에서 발생한 현금흐름입니다."),
  subject("재무현금흐름", "Financing Cash Flow", "차입·상환·증자·배당 등 자금조달 활동의 현금흐름입니다."),
  subject("현금성자산", "Cash Equivalents", "즉시 사용하거나 단기간에 현금화할 수 있는 자산입니다."),
  subject("매출채권", "Accounts Receivable", "상품을 외상으로 판매하고 아직 받지 못한 대금입니다."),
  subject("재고자산", "Inventory", "판매하거나 생산에 투입하기 위해 보유한 상품과 원재료입니다."),
  subject("매입채무", "Accounts Payable", "원재료나 상품을 외상으로 사고 아직 지급하지 않은 대금입니다."),
  subject("유형자산", "Property Plant and Equipment", "건물·기계·토지처럼 영업에 장기간 사용하는 실물자산입니다."),
  subject("무형자산", "Intangible Assets", "특허·소프트웨어·영업권처럼 물리적 형태가 없는 자산입니다."),
  subject("총차입금", "Total Borrowings", "기업이 금융기관과 채권자에게 빌린 이자부 부채의 합계입니다."),
  subject("순차입금", "Net Debt", "총차입금에서 현금성자산을 뺀 실질 부채 규모입니다."),
  subject("자본총계", "Total Equity", "자산에서 부채를 뺀 주주 몫의 장부가치입니다."),
  subject("이익잉여금", "Retained Earnings", "과거 순이익 중 배당하지 않고 회사에 남겨둔 누적 금액입니다."),
  subject("자본적지출", "Capital Expenditure", "장기간 사용할 설비와 자산을 취득·개선하기 위한 지출입니다."),
  subject("연구개발비", "Research and Development Expense", "새 기술과 제품을 개발하기 위해 사용한 비용입니다."),
  subject("현금배당금", "Cash Dividends", "기업이 이익 일부를 현금으로 주주에게 지급한 금액입니다."),
  subject("법인세비용", "Corporate Tax Expense", "회계기간의 이익과 관련해 인식한 법인세 비용입니다.")
];

const businessLenses = [
  lens("연간변화", "Annual Change", "최근 연간 수치가 이전 연도보다 얼마나 달라졌는지를 뜻합니다.", "일시적 분기 변동과 사업의 큰 방향을 구분하게 합니다."),
  lens("분기변화", "Quarterly Change", "최근 분기 수치가 직전 분기나 전년 같은 분기보다 달라진 정도입니다.", "실적의 변곡점을 비교적 빠르게 확인하는 데 쓰입니다."),
  lens("예상치차이", "Estimate Variance", "실제 결과와 회사 지침 또는 시장 예상의 차이입니다.", "절대 실적보다 기대와의 차이가 가격에 미치는 영향을 이해하게 합니다."),
  lens("현금흐름영향", "Cash Flow Impact", "해당 회계항목이 실제 현금의 유입과 유출에 미치는 효과입니다.", "회계이익과 현금창출력을 구분하는 데 필요합니다."),
  lens("지속가능성", "Sustainability Assessment", "현재 수치가 일회성이 아니라 반복될 수 있는지를 평가하는 관점입니다.", "기업의 정상 이익과 장기 재무체력을 판단하게 합니다.")
];

const paymentSubjects = [
  subject("입출금거래", "Deposit and Withdrawal Transaction", "계좌에 돈을 넣거나 계좌에서 돈을 꺼내는 기본 금융거래입니다."),
  subject("자동이체", "Automatic Transfer", "정해진 날짜에 일정 금액이 자동으로 이체되도록 등록한 거래입니다."),
  subject("계좌이체", "Account Transfer", "한 계좌에서 다른 계좌로 자금을 옮기는 거래입니다."),
  subject("간편결제", "Simple Payment", "등록한 카드나 계좌로 인증 절차를 줄여 결제하는 서비스입니다."),
  subject("신용카드결제", "Credit Card Payment", "카드사가 가맹점에 먼저 지급하고 회원이 나중에 갚는 결제입니다."),
  subject("체크카드결제", "Debit Card Payment", "결제 시점에 연결계좌 잔액에서 대금이 빠져나가는 거래입니다."),
  subject("해외결제", "Overseas Payment", "외국 가맹점이나 해외 온라인몰에서 외화로 이루어지는 결제입니다."),
  subject("무통장입금", "Cash Deposit Without Passbook", "수취 계좌번호를 이용해 현금이나 다른 계좌에서 입금하는 방식입니다."),
  subject("가상계좌", "Virtual Account", "납부자 식별을 위해 일시적 또는 전용으로 부여되는 입금계좌입니다."),
  subject("오픈뱅킹", "Open Banking", "하나의 서비스에서 여러 금융회사의 계좌를 조회·이체하는 기반입니다."),
  subject("공동인증", "Joint Certificate Authentication", "전자서명용 인증서를 이용해 본인과 거래 의사를 확인하는 방식입니다."),
  subject("금융인증", "Financial Certificate Authentication", "클라우드 기반 인증서를 이용해 금융거래 본인을 확인하는 방식입니다.")
];

const paymentLenses = [
  lens("거래한도", "Transaction Limit", "한 번 또는 하루 동안 처리할 수 있는 최대 금액입니다.", "큰 금액을 보내기 전에 한도 상향과 추가 인증 여부를 확인하게 합니다."),
  lens("처리시간", "Processing Time", "요청부터 승인·정산·최종 입금까지 걸리는 시간입니다.", "휴일과 점검시간에 생길 수 있는 지연을 예상하게 합니다."),
  lens("이용수수료", "Service Fee", "거래 처리와 환전·중개에 대해 부담하는 비용입니다.", "소액 거래에서는 수수료 비중이 커질 수 있어 비교가 필요합니다."),
  lens("취소절차", "Cancellation Procedure", "승인된 거래를 철회하고 대금을 되돌리는 과정입니다.", "승인취소와 실제 환급 사이에 시차가 있다는 점을 확인하게 합니다."),
  lens("보안위험", "Security Risk", "정보 탈취·피싱·오입금·부정사용으로 손실이 생길 가능성입니다.", "인증정보 보호와 수취인 확인이 왜 중요한지 보여줍니다.")
];

const coreFamilies = [
  buildFamily({ category: "은행·금융", subjects: savingsSubjects, lenses: savingsLenses, why: "저축상품의 실제 수익과 현금 사용 가능성을 비교하는 데 중요합니다.", caution: "세전·세후, 기본·우대금리와 보호 대상 여부를 구분하고 상품설명서의 최신 조건을 확인해야 합니다.", anchor: "저축상품" }),
  buildFamily({ category: "부동산·가계", subjects: loanSubjects, lenses: loanLenses, why: "가계가 매달 부담할 금액과 신용에 미치는 영향을 판단하는 데 중요합니다.", caution: "최저 광고금리만 보지 말고 본인 적용금리, 상환방식, 수수료와 금리변동 가능성을 함께 확인해야 합니다.", anchor: "가계부채" }),
  buildFamily({ category: "세금·연금", subjects: accountSubjects, lenses: accountLenses, why: "세제 혜택과 장기 운용 결과를 현재의 현금흐름과 함께 계산하는 데 중요합니다.", caution: "세법과 가입요건은 바뀔 수 있으므로 납입 연도와 수령 시점의 공식 기준을 확인해야 합니다.", anchor: "장기자산관리" }),
  buildFamily({ category: "거시경제", subjects: macroSubjects, lenses: macroLenses, why: "경제지표의 방향과 성장·물가·고용의 연결을 정확하게 읽는 데 중요합니다.", caution: "단위, 명목·실질, 계절조정, 비교기간과 잠정치 수정 여부를 확인하지 않으면 반대 결론을 낼 수 있습니다.", anchor: "경제지표" }),
  buildFamily({ category: "주식·투자", subjects: stockSubjects, lenses: stockLenses, why: "가격 상승만이 아니라 현금수익과 위험, 시장 참여 강도를 함께 판단하는 데 중요합니다.", caution: "과거 수익률과 변동성은 미래를 보장하지 않으며 상품 구조와 보유기간, 거래비용을 함께 확인해야 합니다.", anchor: "투자기초" }),
  buildFamily({ category: "기업·회계", subjects: businessSubjects, lenses: businessLenses, why: "기업의 회계수치가 실제 사업성과와 현금창출력으로 이어지는지 판단하는 데 중요합니다.", caution: "연결·별도, 누적·분기, 일회성 항목과 회계정책 차이를 확인하고 현금흐름표로 교차 검증해야 합니다.", anchor: "재무제표" }),
  buildFamily({ category: "지급결제·핀테크", subjects: paymentSubjects, lenses: paymentLenses, why: "일상적인 결제와 송금에서 비용·시간·보안 문제를 예방하는 데 중요합니다.", caution: "서비스별 약관과 금융회사 점검시간이 다르며 인증번호와 비밀번호를 타인에게 알려주면 안 됩니다.", anchor: "금융거래" })
];

const bondSubjects = [
  subject("국고채", "Korean Treasury Bond", "대한민국 정부가 재정자금을 조달하기 위해 발행하는 채권입니다."),
  subject("통안증권", "Monetary Stabilization Bond", "한국은행이 통화량과 유동성을 조절하기 위해 발행하는 증권입니다."),
  subject("지방채", "Municipal Bond", "지방자치단체가 공공사업 재원을 마련하기 위해 발행하는 채권입니다."),
  subject("특수채", "Agency Bond", "법률로 설립된 공공기관과 특수법인이 발행하는 채권입니다."),
  subject("은행채", "Bank Bond", "은행이 대출과 운영자금을 조달하기 위해 발행하는 채권입니다."),
  subject("금융채", "Financial Bond", "은행·카드·캐피탈 등 금융회사가 발행하는 채권입니다."),
  subject("회사채", "Corporate Bond", "기업이 사업과 투자자금을 조달하기 위해 발행하는 채권입니다."),
  subject("후순위채", "Subordinated Bond", "청산 때 일반채권보다 변제 순위가 뒤인 채권입니다."),
  subject("신종자본증권", "Hybrid Capital Security", "채권 성격과 자본 성격을 함께 지닌 장기 증권입니다."),
  subject("전환사채", "Convertible Bond", "정해진 조건에 따라 발행기업 주식으로 전환할 수 있는 채권입니다."),
  subject("교환사채", "Exchangeable Bond", "발행사가 보유한 다른 회사 주식 등으로 교환할 수 있는 채권입니다."),
  subject("신주인수권부사채", "Bond with Warrant", "신주를 정해진 가격에 살 권리가 붙은 채권입니다."),
  subject("자산유동화증권", "Asset-backed Security", "대출채권·매출채권 등 자산의 현금흐름을 기초로 발행한 증권입니다."),
  subject("주택저당증권", "Mortgage-backed Security", "주택담보대출 원리금 현금흐름을 기초로 발행한 증권입니다."),
  subject("물가연동국채", "Inflation-linked Government Bond", "원금과 이자가 물가지수에 연동되는 국채입니다."),
  subject("외화표시채권", "Foreign Currency Bond", "원화가 아닌 외국 통화로 원리금을 지급하는 채권입니다."),
  subject("영구채", "Perpetual Bond", "법적 만기가 없거나 매우 긴 만기를 가진 채권입니다."),
  subject("녹색채권", "Green Bond", "친환경 사업에 조달자금을 사용하도록 정한 채권입니다."),
  subject("사회적채권", "Social Bond", "사회문제 해결 사업에 자금을 사용하도록 정한 채권입니다."),
  subject("지속가능채권", "Sustainability Bond", "환경과 사회 목적 사업 모두에 자금을 사용하는 채권입니다."),
  subject("하이일드채권", "High-yield Bond", "신용등급이 낮아 높은 금리를 제공하는 회사채입니다."),
  subject("단기금융채", "Short-term Financial Bond", "금융회사가 짧은 만기로 발행하는 자금조달 채권입니다.")
];

const bondLenses = [
  lens("만기수익률", "Yield to Maturity", "현재 가격에 매수해 만기까지 보유할 때의 연환산 수익률입니다.", "쿠폰과 가격·만기를 하나의 수익률로 비교하게 합니다."),
  lens("듀레이션", "Macaulay Duration", "현금흐름을 받는 평균 시점을 현재가치로 가중한 기간입니다.", "금리위험과 자금 회수기간을 함께 파악하는 데 쓰입니다."),
  lens("수정듀레이션", "Modified Duration", "시장금리 변화에 대한 채권가격의 1차 민감도를 나타냅니다.", "금리가 움직일 때 예상 가격변화를 근사하게 해줍니다."),
  lens("컨벡서티", "Convexity", "금리와 채권가격 관계의 곡률을 측정하는 지표입니다.", "금리 변화가 클 때 듀레이션 오차를 보완합니다."),
  lens("신용스프레드", "Credit Spread", "동일 만기 안전채권보다 추가로 요구되는 금리 차이입니다.", "발행자의 부도위험과 시장 불안을 읽게 합니다."),
  lens("유동성프리미엄", "Liquidity Premium", "거래가 어렵거나 가격 충격이 큰 데 대해 요구되는 추가 수익입니다.", "표면금리 안에서 신용위험과 거래위험을 구분하게 합니다."),
  lens("금리민감도", "Interest Rate Sensitivity", "수익률곡선 변화가 채권가치에 미치는 영향의 크기입니다.", "만기만으로 알 수 없는 실제 가격위험을 비교하게 합니다."),
  lens("롤다운수익", "Roll-down Return", "시간 경과로 잔존만기가 짧아지며 수익률곡선을 따라 생기는 가격효과입니다.", "보유수익을 쿠폰·캐리·곡선효과로 나누어 보게 합니다.")
];

const derivativeSubjects = [
  subject("코스피200", "KOSPI 200", "한국 대형주 200개로 구성된 대표 주가지수입니다."),
  subject("코스닥150", "KOSDAQ 150", "코스닥시장의 대표 종목으로 구성된 주가지수입니다."),
  subject("S&P500", "S&P 500", "미국 대형주 500개로 구성된 대표 주가지수입니다."),
  subject("나스닥100", "NASDAQ 100", "나스닥의 대형 비금융주로 구성된 주가지수입니다."),
  subject("미국국채", "U.S. Treasury", "미국 연방정부가 발행하는 달러표시 채권입니다."),
  subject("한국국채", "Korean Government Bond", "대한민국 정부가 발행하는 원화표시 채권입니다."),
  subject("원달러환율", "USD KRW Exchange Rate", "미국 달러 1단위를 사는 데 필요한 원화 가격입니다."),
  subject("달러엔환율", "USD JPY Exchange Rate", "미국 달러와 일본 엔화 사이의 교환비율입니다."),
  subject("유로달러환율", "EUR USD Exchange Rate", "유로와 미국 달러 사이의 교환비율입니다."),
  subject("국제유가", "Crude Oil Price", "국제시장에서 거래되는 원유의 대표 가격입니다."),
  subject("천연가스", "Natural Gas", "발전·난방·산업원료에 사용되는 기체형 에너지 원자재입니다."),
  subject("금", "Gold", "귀금속이자 가치저장 수단으로 거래되는 원자재입니다."),
  subject("은", "Silver", "산업용과 귀금속 수요를 함께 가진 금속 원자재입니다."),
  subject("구리", "Copper", "전력망·건설·제조업에 널리 쓰이는 산업금속입니다."),
  subject("옥수수", "Corn", "식량·사료·바이오연료에 사용되는 대표 농산물입니다."),
  subject("밀", "Wheat", "세계 식량과 제분 산업의 핵심 곡물입니다."),
  subject("비트코인", "Bitcoin", "분산원장 네트워크에서 발행·거래되는 대표 가상자산입니다."),
  subject("탄소배출권", "Carbon Allowance", "정해진 양의 온실가스를 배출할 수 있는 거래 가능한 권리입니다.")
];

const derivativeLenses = [
  lens("선물베이시스", "Futures Basis", "현물가격과 선물가격 사이의 차이입니다.", "보유비용과 수급, 만기 구조를 확인하게 합니다."),
  lens("내재변동성", "Implied Volatility", "옵션가격에 반영된 미래 변동성 기대입니다.", "방향 전망과 별개로 시장이 예상하는 움직임의 크기를 보여줍니다."),
  lens("미결제약정", "Open Interest", "아직 반대매매나 만기정산되지 않은 계약 수입니다.", "파생시장에 남아 있는 포지션과 참여 강도를 읽게 합니다."),
  lens("증거금", "Margin Requirement", "계약 이행과 손실에 대비해 예치해야 하는 담보금입니다.", "레버리지와 강제청산 가능성을 계산하게 합니다."),
  lens("옵션델타", "Option Delta", "기초자산 가격 변화에 대한 옵션가격의 1차 민감도입니다.", "방향 노출과 헤지에 필요한 기초자산 수량을 추정하게 합니다."),
  lens("옵션감마", "Option Gamma", "기초자산 변화에 따라 델타가 바뀌는 속도입니다.", "큰 가격 움직임에서 헤지 수량이 얼마나 빨리 변하는지 보여줍니다."),
  lens("헤지비율", "Hedge Ratio", "현물 위험을 줄이기 위해 필요한 파생계약의 비율입니다.", "과소·과대 헤지를 피하고 순노출을 관리하게 합니다."),
  lens("롤오버비용", "Rollover Cost", "만기 계약을 청산하고 다음 만기 계약으로 옮길 때 생기는 비용입니다.", "장기 보유성과가 현물가격과 달라지는 이유를 설명합니다."),
  lens("만기스프레드", "Calendar Spread", "서로 다른 만기의 선물 또는 옵션 가격 차이입니다.", "재고·금리·계절성과 단기 수급을 읽는 데 쓰입니다.")
];

const bankPortfolioSubjects = [
  subject("주택담보대출포트폴리오", "Mortgage Loan Portfolio", "은행이 보유한 주택담보대출 채권의 묶음입니다."),
  subject("전세자금대출포트폴리오", "Jeonse Loan Portfolio", "은행이 보유한 전세자금대출 채권의 묶음입니다."),
  subject("개인신용대출포트폴리오", "Personal Credit Loan Portfolio", "개인 차주의 무담보 신용대출 채권 묶음입니다."),
  subject("중소기업대출포트폴리오", "SME Loan Portfolio", "중소기업 차주에 대한 대출채권 묶음입니다."),
  subject("대기업대출포트폴리오", "Large Corporate Loan Portfolio", "대기업 차주에 대한 대출채권 묶음입니다."),
  subject("PF대출포트폴리오", "Project Finance Loan Portfolio", "사업의 미래 현금흐름을 상환재원으로 보는 금융채권 묶음입니다."),
  subject("부동산담보대출포트폴리오", "Real Estate Secured Loan Portfolio", "상업용·사업용 부동산을 담보로 한 대출 묶음입니다."),
  subject("카드채권포트폴리오", "Credit Card Receivable Portfolio", "카드 이용대금과 카드대출 채권의 묶음입니다."),
  subject("자동차할부채권포트폴리오", "Auto Finance Portfolio", "자동차 할부와 대출에서 발생한 채권 묶음입니다."),
  subject("리스채권포트폴리오", "Lease Receivable Portfolio", "금융·운용리스 계약에서 발생한 채권 묶음입니다."),
  subject("매출채권금융포트폴리오", "Receivables Finance Portfolio", "기업 매출채권을 담보·매입해 제공한 금융채권 묶음입니다."),
  subject("무역금융포트폴리오", "Trade Finance Portfolio", "수출입 거래와 선적·결제를 지원한 금융채권 묶음입니다."),
  subject("외화대출포트폴리오", "Foreign Currency Loan Portfolio", "외국 통화로 실행된 대출채권 묶음입니다."),
  subject("정부보증대출포트폴리오", "Government-guaranteed Loan Portfolio", "정부나 공공기관의 보증이 붙은 대출채권 묶음입니다."),
  subject("후순위대출포트폴리오", "Subordinated Loan Portfolio", "상환순위가 일반채권보다 뒤인 대출 묶음입니다."),
  subject("브릿지론포트폴리오", "Bridge Loan Portfolio", "본격적인 장기조달 전 단기간 제공된 연결대출 묶음입니다."),
  subject("본PF포트폴리오", "Main Project Finance Portfolio", "인허가와 사업조건이 갖춰진 개발사업의 본 대출 묶음입니다."),
  subject("가계대출포트폴리오", "Household Loan Portfolio", "가계 차주에게 제공한 담보·신용대출 전체 묶음입니다.")
];

const bankRiskLenses = [
  lens("위험가중치", "Risk Weight", "규제자본 계산 때 자산 위험에 따라 적용하는 가중치입니다.", "같은 대출액이라도 필요한 자기자본이 달라지는 이유를 보여줍니다."),
  lens("예상신용손실", "Expected Credit Loss", "앞으로 발생할 가능성이 있는 신용손실의 현재 추정액입니다.", "부실이 확정되기 전에 충당금을 인식하게 합니다."),
  lens("부도확률", "Probability of Default", "정해진 기간 안에 차주가 부도날 가능성입니다.", "신용위험을 빈도로 측정하는 핵심 입력값입니다."),
  lens("부도시손실률", "Loss Given Default", "부도가 났을 때 익스포저 중 회수하지 못할 비율입니다.", "담보와 회수순위가 손실 규모에 미치는 영향을 보여줍니다."),
  lens("부도시익스포저", "Exposure at Default", "부도 시점에 금융회사가 실제로 노출될 것으로 예상되는 금액입니다.", "미사용 한도까지 포함한 잠재 손실 기반을 계산합니다."),
  lens("연체전이율", "Delinquency Roll Rate", "정상·연체 단계의 채권이 더 나쁜 단계로 이동하는 비율입니다.", "부실의 초기 확산 속도를 확인하게 합니다."),
  lens("충당금적립률", "Provision Coverage Ratio", "부실채권이나 예상손실 대비 쌓아둔 충당금 비율입니다.", "은행의 손실흡수 준비 정도를 보여줍니다."),
  lens("스트레스손실", "Stress Loss", "극단적 경기·금리·가격 시나리오에서 예상되는 손실입니다.", "평상시 지표가 놓치는 위기 취약성을 점검하게 합니다.")
];

const corporateSubjects = [
  subject("기업가치", "Enterprise Value", "주주와 채권자가 제공한 자금에 대해 시장이 평가한 사업 전체 가치입니다."),
  subject("시가총액", "Market Capitalization", "주가에 발행주식 수를 곱한 지분의 시장가치입니다."),
  subject("순차입금", "Net Debt", "총차입금에서 현금성자산을 뺀 실질 부채입니다."),
  subject("매출액", "Sales Revenue", "상품과 서비스 판매로 인식한 총수익입니다."),
  subject("EBITDA", "Earnings Before Interest Taxes Depreciation and Amortization", "이자·세금·감가상각 전 사업성과입니다."),
  subject("EBIT", "Earnings Before Interest and Taxes", "이자와 세금을 차감하기 전 이익입니다."),
  subject("세후영업이익", "Net Operating Profit After Tax", "영업이익에 영업 관련 세금을 반영한 이익입니다."),
  subject("잉여현금흐름", "Free Cash Flow", "영업현금에서 사업 유지·성장 투자를 뺀 현금입니다."),
  subject("기업잉여현금흐름", "Free Cash Flow to Firm", "채권자와 주주 모두에게 귀속될 수 있는 현금흐름입니다."),
  subject("주주잉여현금흐름", "Free Cash Flow to Equity", "부채 조달과 상환을 반영한 뒤 주주에게 귀속되는 현금흐름입니다."),
  subject("투하자본", "Invested Capital", "영업활동을 위해 주주와 채권자로부터 조달해 투입한 자본입니다."),
  subject("가중평균자본비용", "Weighted Average Cost of Capital", "부채와 자기자본 조달비용을 비중으로 가중한 할인율입니다."),
  subject("자기자본비용", "Cost of Equity", "주주가 위험을 감수하는 대가로 요구하는 기대수익률입니다."),
  subject("타인자본비용", "Cost of Debt", "기업이 차입과 채권 발행에 부담하는 세후 조달비용입니다."),
  subject("투하자본수익률", "Return on Invested Capital", "세후영업이익을 투하자본으로 나눈 자본효율 지표입니다."),
  subject("자기자본이익률", "Return on Equity", "순이익을 자기자본으로 나눈 주주자본 수익성 지표입니다."),
  subject("총자산이익률", "Return on Assets", "순이익을 총자산으로 나눈 자산효율 지표입니다."),
  subject("매출총이익률", "Gross Margin", "매출총이익을 매출액으로 나눈 제품·서비스 수익성입니다."),
  subject("영업이익률", "Operating Margin", "영업이익을 매출액으로 나눈 본업 수익성입니다."),
  subject("순이익률", "Net Profit Margin", "순이익을 매출액으로 나눈 최종 수익성입니다."),
  subject("순운전자본", "Net Working Capital", "영업에 필요한 유동자산에서 영업 유동부채를 뺀 금액입니다."),
  subject("자본적지출", "Capital Expenditure", "장기간 사용할 설비와 자산에 대한 투자지출입니다."),
  subject("연구개발투자", "Research and Development Investment", "새 기술·제품·공정을 만들기 위한 투자입니다."),
  subject("주주환원", "Shareholder Distribution", "배당과 자사주 매입·소각으로 주주에게 가치를 돌려주는 활동입니다.")
];

const corporateLenses = [
  lens("추세분석", "Trend Analysis", "여러 기간의 방향과 변화 속도를 연속해서 비교하는 분석입니다.", "한 분기의 특이값과 구조적 개선을 구분합니다."),
  lens("변동성분석", "Volatility Analysis", "경기와 계절에 따라 수치가 흔들리는 정도를 측정하는 분석입니다.", "예측 가능성과 실적 안정성을 판단하게 합니다."),
  lens("정상화조정", "Normalization Adjustment", "일회성 손익과 비정상적 항목을 제거해 평상시 수준을 추정하는 작업입니다.", "지속 가능한 이익과 현금흐름을 계산하게 합니다."),
  lens("민감도분석", "Sensitivity Analysis", "핵심 가정 변화가 결과에 미치는 영향을 계산하는 분석입니다.", "매출·마진·할인율 위험을 수치로 확인하게 합니다."),
  lens("동종기업비교", "Peer Comparison", "비슷한 사업과 규모의 기업 사이에서 상대 수준을 비교하는 방법입니다.", "업종 구조를 반영해 단순 절대값 비교를 보완합니다."),
  lens("시나리오분석", "Scenario Analysis", "낙관·기준·비관 가정별 결과를 따로 계산하는 분석입니다.", "단일 전망에 의존하지 않고 결과 범위를 보게 합니다."),
  lens("품질검증", "Quality Review", "회계수치가 현금과 반복 가능한 사업성과로 뒷받침되는지 확인하는 과정입니다.", "분식과 일회성 개선 가능성을 낮추는 데 쓰입니다."),
  lens("가치기여도", "Value Contribution", "해당 요소가 기업가치 증가 또는 감소에 기여한 정도입니다.", "성장과 자본비용을 함께 연결해 자본배분을 평가합니다.")
];

const macroAdvancedSubjects = [
  subject("잠재산출", "Potential Output", "물가 압력을 크게 높이지 않고 지속할 수 있는 경제의 생산 수준입니다."),
  subject("GDP갭", "Output Gap", "실제 산출과 잠재산출 사이의 차이입니다."),
  subject("중립금리", "Neutral Interest Rate", "경기를 자극하거나 억제하지 않는 이론적 실질금리입니다."),
  subject("기간프리미엄", "Term Premium", "장기채 보유의 금리위험에 대해 요구되는 추가 보상입니다."),
  subject("기대인플레이션", "Inflation Expectations", "가계·기업·시장이 예상하는 미래 물가상승률입니다."),
  subject("손익분기인플레이션", "Breakeven Inflation", "명목채와 물가연동채 수익률 차이로 추정한 물가기대입니다."),
  subject("실질실효환율", "Real Effective Exchange Rate", "물가와 교역 비중을 반영한 통화의 종합 실질가치입니다."),
  subject("경상수지갭", "Current Account Gap", "기초여건에 맞는 경상수지와 실제 수지의 차이입니다."),
  subject("재정충격", "Fiscal Impulse", "재정정책 변화가 총수요에 주는 단기 자극 또는 긴축 효과입니다."),
  subject("기초재정수지", "Primary Fiscal Balance", "이자지출을 제외한 정부 수입과 지출의 차이입니다."),
  subject("경기조정재정수지", "Cyclically Adjusted Fiscal Balance", "경기순환이 세입·지출에 미친 영향을 제거한 재정수지입니다."),
  subject("신용갭", "Credit-to-GDP Gap", "민간신용 비율이 장기 추세에서 벗어난 정도입니다."),
  subject("금융상황지수", "Financial Conditions Index", "금리·환율·주가·신용스프레드를 결합한 금융여건 지수입니다."),
  subject("노동소득분배율", "Labor Income Share", "국민소득 가운데 임금과 노동보상이 차지하는 비율입니다."),
  subject("총요소생산성", "Total Factor Productivity", "노동과 자본 투입만으로 설명되지 않는 생산효율입니다."),
  subject("자연실업률", "Natural Unemployment Rate", "경기 균형에서도 탐색과 구조 변화로 존재하는 실업률입니다."),
  subject("고용갭", "Employment Gap", "실제 고용과 지속 가능한 잠재 고용 사이의 차이입니다."),
  subject("임금갭", "Wage Gap", "실제 임금과 생산성·물가에 맞는 기준 임금 사이의 차이입니다."),
  subject("수입침투율", "Import Penetration Ratio", "국내 수요 가운데 수입품이 차지하는 비율입니다."),
  subject("수출경쟁력", "Export Competitiveness", "가격·품질·생산성으로 해외시장에서 경쟁하는 능력입니다."),
  subject("부채지속가능성", "Debt Sustainability", "장래 소득과 재정으로 부채를 안정적으로 감당할 수 있는 정도입니다."),
  subject("인구부양비", "Demographic Dependency Ratio", "생산연령인구 대비 유소년·고령인구의 비율입니다.")
];

const macroAdvancedLenses = [
  lens("모형추정", "Model Estimate", "직접 관측하기 어려운 값을 경제모형으로 계산한 결과입니다.", "가정과 모형 선택에 따른 불확실성을 드러냅니다."),
  lens("나우캐스트", "Nowcast", "공식 통계 전 고빈도 자료로 현재 상태를 추정한 값입니다.", "발표 시차를 줄이지만 수정 가능성이 큽니다."),
  lens("신뢰구간", "Confidence Interval", "추정치가 포함될 것으로 보는 통계적 범위입니다.", "점 하나가 아닌 불확실성의 폭을 보여줍니다."),
  lens("자료개정", "Data Revision", "새 자료와 계절조정으로 과거 추정치가 바뀌는 과정입니다.", "속보치와 확정치의 차이를 이해하게 합니다."),
  lens("정책시나리오", "Policy Scenario", "정책 가정을 달리해 미래 경로를 비교한 결과입니다.", "정책 효과를 단정이 아닌 조건부 결과로 보게 합니다."),
  lens("국가간비교", "Cross-country Comparison", "정의와 단위를 맞춰 여러 국가의 수준을 비교하는 방법입니다.", "제도와 인구구조 차이를 함께 고려하게 합니다."),
  lens("정책민감도", "Policy Sensitivity", "금리·재정·규제 변화에 지표가 반응하는 정도입니다.", "정책 전달경로와 시차를 점검하게 합니다.")
];

const portfolioSubjects = [
  subject("한국주식", "Korean Equities", "한국 거래소에 상장된 기업 지분자산입니다."),
  subject("미국주식", "U.S. Equities", "미국 거래소에 상장된 기업 지분자산입니다."),
  subject("유럽주식", "European Equities", "유럽 주요 국가에 상장된 기업 지분자산입니다."),
  subject("일본주식", "Japanese Equities", "일본 거래소에 상장된 기업 지분자산입니다."),
  subject("신흥국주식", "Emerging Market Equities", "신흥시장 국가의 상장기업 지분자산입니다."),
  subject("국채포트폴리오", "Government Bond Portfolio", "여러 만기와 국가의 정부채로 구성한 자산군입니다."),
  subject("회사채포트폴리오", "Corporate Bond Portfolio", "다양한 기업의 회사채로 구성한 자산군입니다."),
  subject("하이일드포트폴리오", "High-yield Portfolio", "낮은 신용등급의 고금리 채권으로 구성한 자산군입니다."),
  subject("물가연동채포트폴리오", "Inflation-linked Bond Portfolio", "원금과 이자가 물가에 연동되는 채권 자산군입니다."),
  subject("현금성자산포트폴리오", "Cash Portfolio", "예금과 단기금융상품으로 구성한 유동성 자산군입니다."),
  subject("금포트폴리오", "Gold Portfolio", "금 현물·ETF·선물 등에 대한 투자노출입니다."),
  subject("원유포트폴리오", "Crude Oil Portfolio", "원유 현물연계·선물·기업 등에 대한 투자노출입니다."),
  subject("원자재지수포트폴리오", "Commodity Index Portfolio", "여러 에너지·금속·농산물 가격을 묶은 자산군입니다."),
  subject("리츠포트폴리오", "REIT Portfolio", "상장·비상장 부동산투자회사로 구성한 자산군입니다."),
  subject("인프라펀드포트폴리오", "Infrastructure Fund Portfolio", "도로·에너지·통신 인프라 자산에 투자하는 자산군입니다."),
  subject("사모주식포트폴리오", "Private Equity Portfolio", "비상장기업 지분과 경영권에 투자하는 자산군입니다."),
  subject("사모대출포트폴리오", "Private Credit Portfolio", "비은행 방식으로 기업에 제공한 대출 자산군입니다."),
  subject("헤지펀드포트폴리오", "Hedge Fund Portfolio", "다양한 롱·숏·차익 전략을 사용하는 대체투자 자산군입니다."),
  subject("외환포트폴리오", "Currency Portfolio", "여러 통화의 가치 변동과 금리차에 대한 투자노출입니다."),
  subject("가상자산포트폴리오", "Crypto Asset Portfolio", "블록체인 기반 가상자산으로 구성한 고변동성 자산군입니다."),
  subject("탄소배출권포트폴리오", "Carbon Allowance Portfolio", "배출권 가격에 연동된 현물·선물·펀드 자산군입니다."),
  subject("농산물포트폴리오", "Agricultural Commodity Portfolio", "곡물·소프트 원자재 선물과 관련 자산으로 구성한 자산군입니다."),
  subject("해운자산포트폴리오", "Shipping Asset Portfolio", "선박·운임·해운기업에 연동된 투자자산군입니다."),
  subject("변동성포트폴리오", "Volatility Portfolio", "옵션과 변동성지수 상품으로 가격변동 자체에 투자하는 자산군입니다.")
];

const portfolioLenses = [
  lens("기대수익률", "Expected Return", "미래에 얻을 것으로 예상하는 평균 수익률입니다.", "과거 평균과 전망 가정을 구분해 목표수익을 세우게 합니다."),
  lens("표준편차", "Standard Deviation", "수익률이 평균 주변에서 흩어진 정도입니다.", "평균수익만으로 보이지 않는 변동위험을 수치화합니다."),
  lens("시장베타", "Market Beta", "시장 수익률 변화에 대한 자산 수익률의 민감도입니다.", "시장위험 노출이 큰 자산과 작은 자산을 구분합니다."),
  lens("최대낙폭", "Maximum Drawdown", "고점에서 이후 저점까지 발생한 최대 손실률입니다.", "보유자가 실제로 견뎌야 했던 손실 깊이를 보여줍니다."),
  lens("샤프비율", "Sharpe Ratio", "무위험수익을 넘는 수익을 변동성으로 나눈 위험조정 성과입니다.", "서로 변동성이 다른 자산의 효율을 비교하게 합니다."),
  lens("상관계수", "Correlation Coefficient", "두 자산 수익률이 함께 움직이는 정도입니다.", "분산투자 효과와 위기 때 동조화를 점검합니다."),
  lens("위험기여도", "Risk Contribution", "전체 포트폴리오 위험 가운데 해당 자산이 차지하는 몫입니다.", "투자금 비중과 실제 위험 비중의 차이를 보여줍니다.")
];

const econometricSubjects = [
  subject("GDP시계열", "GDP Time Series", "국내총생산을 시간 순서로 배열한 경제통계입니다."),
  subject("소비자물가시계열", "Consumer Price Time Series", "소비자물가지수를 시간 순서로 배열한 통계입니다."),
  subject("실업률시계열", "Unemployment Time Series", "실업률을 시간 순서로 배열한 노동통계입니다."),
  subject("정책금리시계열", "Policy Rate Time Series", "중앙은행 정책금리를 시간 순서로 배열한 통계입니다."),
  subject("환율시계열", "Exchange Rate Time Series", "통화 교환비율을 시간 순서로 배열한 금융통계입니다."),
  subject("주택가격시계열", "House Price Time Series", "주택가격지수를 시간 순서로 배열한 통계입니다."),
  subject("주식수익률시계열", "Equity Return Time Series", "주가지수나 종목 수익률을 시간 순서로 배열한 자료입니다."),
  subject("채권금리시계열", "Bond Yield Time Series", "채권 수익률을 시간 순서로 배열한 금융자료입니다."),
  subject("신용스프레드시계열", "Credit Spread Time Series", "신용채권과 안전채권 금리차를 시간 순서로 배열한 자료입니다."),
  subject("통화량시계열", "Money Supply Time Series", "통화지표를 시간 순서로 배열한 경제통계입니다."),
  subject("소비시계열", "Consumption Time Series", "민간 소비지출을 시간 순서로 배열한 통계입니다."),
  subject("투자시계열", "Investment Time Series", "설비·건설 등 투자지출을 시간 순서로 배열한 통계입니다."),
  subject("수출시계열", "Export Time Series", "수출 금액과 물량을 시간 순서로 배열한 통계입니다."),
  subject("수입시계열", "Import Time Series", "수입 금액과 물량을 시간 순서로 배열한 통계입니다."),
  subject("유가시계열", "Oil Price Time Series", "국제 원유가격을 시간 순서로 배열한 자료입니다."),
  subject("임금시계열", "Wage Time Series", "평균 임금과 임금지수를 시간 순서로 배열한 통계입니다."),
  subject("생산성시계열", "Productivity Time Series", "노동과 총요소생산성을 시간 순서로 배열한 통계입니다."),
  subject("인구시계열", "Population Time Series", "인구 규모와 구조를 시간 순서로 배열한 통계입니다.")
];

const econometricLenses = [
  lens("단위근검정", "Unit Root Test", "시계열이 안정적인지 추세 충격이 지속되는지 검사하는 방법입니다.", "잘못된 회귀관계와 과도한 통계적 유의성을 피하게 합니다."),
  lens("공적분검정", "Cointegration Test", "불안정한 여러 시계열 사이에 장기 균형관계가 있는지 검사합니다.", "단기 변동과 장기 연결을 구분하게 합니다."),
  lens("그랜저인과검정", "Granger Causality Test", "한 변수의 과거값이 다른 변수 예측에 도움 되는지 검사합니다.", "예측 선후관계를 보지만 진정한 원인을 뜻하지는 않습니다."),
  lens("VAR충격반응", "VAR Impulse Response", "한 변수의 충격이 여러 변수에 시간차를 두고 미치는 영향을 추정합니다.", "정책과 시장의 동태적 전달경로를 살펴봅니다."),
  lens("계절성검정", "Seasonality Test", "자료에 일정한 달·분기 패턴이 반복되는지 확인합니다.", "계절 요인을 경기 변화로 오해하지 않게 합니다."),
  lens("구조변화검정", "Structural Break Test", "관계나 평균이 특정 시점 전후로 달라졌는지 검사합니다.", "위기와 제도 변화 뒤 과거 모형이 유지되는지 확인합니다."),
  lens("예측구간", "Prediction Interval", "미래 관측값이 들어올 것으로 예상하는 범위입니다.", "점 전망보다 실제 결과의 불확실성을 넓게 보여줍니다.")
];

const advancedFamilies = [
  buildFamily({ category: "채권·신용", subjects: bondSubjects, lenses: bondLenses, why: "채권 수익을 쿠폰·금리·신용·유동성 요인으로 나누고 손실 가능성을 측정하는 데 중요합니다.", caution: "수익률과 가격은 반대로 움직이며 조기상환·전환 조건, 신용등급과 실제 거래유동성을 함께 확인해야 합니다.", anchor: "채권분석" }),
  buildFamily({ category: "파생·위험", subjects: derivativeSubjects, lenses: derivativeLenses, why: "레버리지 상품의 방향·변동성·만기 위험을 분리하고 필요한 헤지 규모를 계산하는 데 중요합니다.", caution: "파생상품은 원금을 넘는 손실과 강제청산이 가능하며 계약승수·만기·증거금·롤오버 조건을 확인해야 합니다.", anchor: "파생상품" }),
  buildFamily({ category: "은행·금융", subjects: bankPortfolioSubjects, lenses: bankRiskLenses, why: "은행의 대출자산이 경기충격을 얼마나 흡수할 수 있는지와 필요한 자본·충당금을 판단하는 데 중요합니다.", caution: "내부모형과 규제기준에 따라 계산값이 다르며 담보가치와 부도상관이 위기 때 함께 악화될 수 있습니다.", anchor: "신용위험" }),
  buildFamily({ category: "기업금융·M&A", subjects: corporateSubjects, lenses: corporateLenses, why: "기업의 성장과 수익성이 자본비용을 넘어 실제 가치 창출로 이어지는지 검증하는 데 중요합니다.", caution: "가정 하나가 가치평가를 크게 바꿀 수 있으므로 일회성 회계항목, 순환성, 희석과 부채를 함께 반영해야 합니다.", anchor: "기업가치평가" }),
  buildFamily({ category: "거시경제", subjects: macroAdvancedSubjects, lenses: macroAdvancedLenses, why: "직접 관측할 수 없는 경제의 균형 수준과 정책효과를 불확실성까지 포함해 해석하는 데 중요합니다.", caution: "모형 추정치는 확정된 사실이 아니며 자료개정, 표본기간, 정책체계와 국가별 구조 차이에 민감합니다.", anchor: "거시모형" }),
  buildFamily({ category: "주식·투자", subjects: portfolioSubjects, lenses: portfolioLenses, why: "자산별 기대수익보다 전체 포트폴리오에서 감당하는 위험과 분산효과를 계산하는 데 중요합니다.", caution: "과거 상관관계와 변동성은 위기 때 급변할 수 있으며 환율·세금·유동성·운용비용을 함께 반영해야 합니다.", anchor: "포트폴리오위험" }),
  buildFamily({ category: "데이터·통계", subjects: econometricSubjects, lenses: econometricLenses, why: "경제 변수 사이의 선후관계와 장단기 연결을 통계적으로 검증하고 예측 오차를 이해하는 데 중요합니다.", caution: "통계적 관계가 경제적 인과를 자동으로 증명하지 않으며 변수 정의·시차·표본과 모형 선택을 바꿔 재검증해야 합니다.", anchor: "계량경제" })
];

const coreCandidates = roundRobin(coreFamilies);
const advancedCandidates = roundRobin(advancedFamilies);

export function buildMasterGlossary(existingTerms = []) {
  const core = selectUnique(coreCandidates, MASTER_CORE_TARGET, existingTerms);
  const advanced = selectUnique(advancedCandidates, MASTER_ADVANCED_TARGET, [...existingTerms, ...core]);
  return { core, advanced };
}
