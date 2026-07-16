export const financeIndicatorCategories = [
  { id: "finance", label: "물가·금융" },
  { id: "external", label: "대외·투자" }
];

export const financeIndicatorDefinitions = [
  {
    id: "consumer-inflation",
    code: "FP.CPI.TOTL.ZG",
    category: "finance",
    name: "소비자물가 상승률",
    shortName: "소비자물가",
    unit: "%",
    precision: 1,
    description: "소비자가 구입하는 상품과 서비스 가격이 전년보다 얼마나 변했는지 보여줍니다.",
    reading: "한국은행의 물가안정 목표와 비교하면 금리 인상·인하 압력을 이해하기 쉽습니다.",
    caution: "국가별 소비 바구니가 다르며 개인의 실제 체감물가와 차이가 날 수 있습니다."
  },
  {
    id: "real-interest-rate",
    code: "FR.INR.RINR",
    category: "finance",
    name: "실질금리",
    shortName: "실질금리",
    unit: "%",
    precision: 1,
    description: "명목 대출금리에서 물가 영향을 조정해 돈의 실제 조달비용을 나타냅니다.",
    reading: "높을수록 차입과 투자가 위축되고 현금·채권의 상대 매력이 커질 수 있습니다.",
    caution: "국가마다 대출금리와 물가 조정 방식이 달라 기준연도가 오래된 국가는 직접 비교에 주의해야 합니다."
  },
  {
    id: "private-credit",
    code: "FS.AST.PRVT.GD.ZS",
    category: "finance",
    name: "민간신용 비중",
    shortName: "민간신용",
    unit: "% GDP",
    precision: 1,
    description: "금융기관이 기업과 가계에 공급한 신용을 GDP와 비교한 비율입니다.",
    reading: "금융이 실물경제에 자금을 얼마나 공급하는지와 부채 민감도를 함께 보여줍니다.",
    caution: "높은 비율은 금융 접근성이 좋다는 뜻일 수도, 과도한 부채가 쌓였다는 뜻일 수도 있습니다."
  },
  {
    id: "broad-money",
    code: "FM.LBL.BMNY.GD.ZS",
    category: "finance",
    name: "광의통화 비중",
    shortName: "광의통화",
    unit: "% GDP",
    precision: 1,
    description: "현금과 예금 등 경제에서 넓게 쓰이는 통화량을 GDP와 비교한 비율입니다.",
    reading: "금융자산과 유동성이 실물경제 규모에 비해 얼마나 큰지 살펴볼 수 있습니다.",
    caution: "통화량이 많다고 곧바로 물가가 오르는 것은 아니며 유통속도와 신용수요를 함께 봐야 합니다."
  },
  {
    id: "market-capitalization",
    code: "CM.MKT.LCAP.GD.ZS",
    category: "finance",
    name: "주식시장 시가총액 비중",
    shortName: "증시 규모",
    unit: "% GDP",
    precision: 1,
    description: "상장된 국내 기업의 시가총액을 GDP와 비교한 값입니다.",
    reading: "주식시장이 국내 경제 규모와 비교해 얼마나 큰지 보여주는 금융시장 깊이 지표입니다.",
    caution: "주가 급등락과 해외 매출 비중 때문에 실물경제 상황과 크게 다르게 움직일 수 있습니다."
  },
  {
    id: "current-account",
    code: "BN.CAB.XOKA.GD.ZS",
    category: "external",
    name: "경상수지 비중",
    shortName: "경상수지",
    unit: "% GDP",
    precision: 1,
    description: "상품·서비스와 본원·이전소득의 대외 거래 결과를 GDP와 비교한 비율입니다.",
    reading: "플러스면 해외에서 번 소득이 지급한 소득보다 많아 대외 자금 여력이 커졌다는 뜻입니다.",
    caution: "흑자가 항상 좋은 것은 아니며 내수 부진으로 수입이 줄어 생긴 불황형 흑자일 수도 있습니다."
  },
  {
    id: "fdi-inflows",
    code: "BX.KLT.DINV.WD.GD.ZS",
    category: "external",
    name: "외국인직접투자 유입",
    shortName: "FDI 유입",
    unit: "% GDP",
    precision: 1,
    description: "해외 투자자가 국내 기업과 생산시설에 장기적으로 투자한 순유입액을 GDP와 비교합니다.",
    reading: "기술·공장·고용으로 이어질 수 있는 장기 해외자금의 유입 강도를 보여줍니다.",
    caution: "기업 인수 한 건이나 조세회피 목적의 자금 이동으로 특정 연도 수치가 크게 튈 수 있습니다."
  },
  {
    id: "reserve-cover",
    code: "FI.RES.TOTL.MO",
    category: "external",
    name: "외환보유액 수입 방어개월",
    shortName: "외환 방어력",
    unit: "개월",
    precision: 1,
    description: "외환보유액으로 상품과 서비스 수입대금을 몇 달 동안 지급할 수 있는지 나타냅니다.",
    reading: "기간이 길수록 외화 유동성 충격과 자본 유출을 버틸 완충력이 크다고 볼 수 있습니다.",
    caution: "단기외채 규모와 자본 이동 속도는 반영하지 않으므로 외채 만기구조도 함께 확인해야 합니다."
  },
  {
    id: "capital-formation",
    code: "NE.GDI.TOTL.ZS",
    category: "external",
    name: "총자본형성 비중",
    shortName: "투자율",
    unit: "% GDP",
    precision: 1,
    description: "설비·건설·재고 등 미래 생산에 쓰인 투자를 GDP와 비교한 비율입니다.",
    reading: "생산능력과 장기 성장 기반에 현재 소득을 얼마나 투입하는지 보여줍니다.",
    caution: "투자 비중이 높아도 부동산 과잉이나 비효율적 설비라면 생산성 향상으로 이어지지 않을 수 있습니다."
  },
  {
    id: "domestic-savings",
    code: "NY.GDS.TOTL.ZS",
    category: "external",
    name: "국내총저축률",
    shortName: "저축률",
    unit: "% GDP",
    precision: 1,
    description: "국민경제가 생산한 소득 중 소비하지 않고 남긴 부분을 GDP와 비교한 비율입니다.",
    reading: "국내 투자를 자체 자금으로 뒷받침할 수 있는 여력과 소비·투자 균형을 보여줍니다.",
    caution: "저축률이 지나치게 높으면 가계 소비와 내수가 약하다는 신호일 수도 있습니다."
  }
].map((indicator) => ({
  ...indicator,
  source: "세계은행 World Development Indicators",
  sourceUrl: `https://data.worldbank.org/indicator/${indicator.code}`
}));
