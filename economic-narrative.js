const MARKET_GUIDES = {
  kospi: {
    definition: "한국 유가증권시장의 대형 상장기업 흐름을 보여주는 지수입니다.",
    up: "대형주 중심의 매수세가 우세했다는 뜻입니다.",
    down: "대형주 중심으로 매도 압력이 더 강했다는 뜻입니다.",
    caution: "KOSPI가 올라도 KOSDAQ이나 다수 종목이 내리면 시장 전체가 좋아진 것은 아닙니다.",
    peers: [
      { id: "kosdaq", question: "상승이 중소형주까지 넓게 퍼졌는가" },
      { id: "usdkrw", question: "환율이 외국인 수급을 돕고 있는가" },
      { id: "sp500", question: "미국 시장과 같은 방향인가" }
    ]
  },
  kosdaq: {
    definition: "기술·바이오·중소형 성장기업 비중이 높은 한국 시장 지수입니다.",
    up: "성장주와 중소형주를 감수하려는 투자심리가 강해졌다는 뜻입니다.",
    down: "투자자가 변동성이 큰 성장주와 중소형주 위험을 줄였다는 뜻입니다.",
    caution: "KOSDAQ은 업종 쏠림과 수급 영향을 크게 받으므로 하루 등락만으로 경기 전체를 판단하면 안 됩니다.",
    peers: [
      { id: "kospi", question: "대형주와 중소형주의 방향이 같은가" },
      { id: "nasdaq", question: "미국 기술주 약세가 함께 나타나는가" },
      { id: "usdkrw", question: "원화 약세가 성장주 수급을 압박하는가" }
    ]
  },
  usdkrw: {
    definition: "1달러를 사는 데 필요한 원화의 수입니다. 숫자가 오르면 원화 약세, 내리면 원화 강세입니다.",
    up: "달러가 강해지거나 원화 수요가 약해져 원화 가치가 떨어졌다는 뜻입니다.",
    down: "달러 부담이 줄거나 원화 수요가 살아나 원화 가치가 강해졌다는 뜻입니다.",
    caution: "하루 하락만 보고 환율이 안정됐다고 단정하면 안 됩니다. 전일 방향과 절대 수준을 함께 봐야 합니다.",
    peers: [
      { id: "kospi", question: "환율 변화가 국내 주가와 외국인 수급에 반영되는가" },
      { id: "vix", question: "글로벌 위험회피와 같이 움직이는가" },
      { id: "wti", question: "수입 에너지 비용까지 동시에 높아지는가" }
    ]
  },
  sp500: {
    definition: "미국 대표 대형기업 500개의 주가 흐름을 보여주는 지수입니다.",
    up: "미국 대형주 전반의 이익과 경기 기대가 우세했다는 뜻입니다.",
    down: "미국 대형주 전반에서 위험을 줄이려는 움직임이 강했다는 뜻입니다.",
    caution: "대형 기술주 몇 종목이 지수를 움직일 수 있으므로 NASDAQ과 VIX를 함께 봐야 합니다.",
    peers: [
      { id: "nasdaq", question: "기술주가 시장보다 강한가 약한가" },
      { id: "vix", question: "하락이 공포 확대로 번지고 있는가" },
      { id: "kospi", question: "미국 흐름이 한국으로 전달됐는가" }
    ]
  },
  nasdaq: {
    definition: "미국 기술·성장기업 비중이 높은 주가지수입니다.",
    up: "금리와 미래 성장에 민감한 기술주 선호가 강해졌다는 뜻입니다.",
    down: "기술주 이익 기대나 높은 평가가 조정받고 있다는 뜻입니다.",
    caution: "NASDAQ 하락이 곧 경기침체를 뜻하지는 않습니다. 금리, 실적, 차익실현 중 원인을 나눠 봐야 합니다.",
    peers: [
      { id: "sp500", question: "기술주만의 조정인가 시장 전체 약세인가" },
      { id: "vix", question: "공포성 매도로 확대되고 있는가" },
      { id: "kosdaq", question: "한국 성장주에도 같은 압력이 나타나는가" }
    ]
  },
  vix: {
    definition: "S&P 500 옵션 가격으로 계산한 향후 약 30일의 예상 변동성 지수입니다.",
    up: "시장 참여자가 주가 급변에 대비한 보험을 더 비싸게 사고 있다는 뜻입니다.",
    down: "단기 충격에 대비하려는 수요가 줄고 있다는 뜻입니다.",
    caution: "VIX가 낮다고 주가가 반드시 오르는 것은 아니며, 20 아래에서는 약세가 있어도 공황으로 보지 않는 경우가 많습니다.",
    peers: [
      { id: "sp500", question: "주가 방향과 공포가 서로 확인되는가" },
      { id: "nasdaq", question: "기술주 조정이 시장 공포로 확대되는가" },
      { id: "usdkrw", question: "위험회피가 달러와 원화에도 전달되는가" }
    ]
  },
  wti: {
    definition: "미국 서부텍사스산 원유 가격으로, 세계 에너지 비용의 대표 기준 중 하나입니다.",
    up: "에너지 수요가 강하거나 공급 차질 우려가 커졌다는 뜻입니다.",
    down: "수요 둔화 우려나 공급 여유가 커졌다는 뜻입니다.",
    caution: "유가 상승은 산유국과 에너지기업에는 호재일 수 있지만 에너지 수입국인 한국에는 비용 부담이 될 수 있습니다.",
    peers: [
      { id: "usdkrw", question: "달러와 유가가 한국의 수입비용을 함께 높이는가" },
      { id: "sp500", question: "수요 호조인지 공급 충격인지 구분할 단서가 있는가" },
      { id: "gold", question: "물가·지정학적 위험 신호가 함께 나타나는가" }
    ]
  },
  gold: {
    definition: "안전자산 수요, 실질금리, 달러, 물가 기대에 함께 반응하는 금 가격입니다.",
    up: "안전자산 수요나 물가 우려가 커졌거나 실질금리 부담이 줄었다는 뜻일 수 있습니다.",
    down: "안전자산 수요가 약해졌거나 금리·달러 부담이 커졌다는 뜻일 수 있습니다.",
    caution: "금 상승만으로 위험회피라고 단정할 수 없습니다. 달러와 금리 움직임이 같은 결과를 만들 수 있습니다.",
    peers: [
      { id: "vix", question: "안전자산 수요가 시장 공포와 함께 커지는가" },
      { id: "usdkrw", question: "달러 강세 속에서도 금이 오르는가" },
      { id: "wti", question: "원자재 전반의 물가 압력인가" }
    ]
  }
};

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: Math.abs(asNumber(value)) > 100 ? 1 : 2
  }).format(asNumber(value));
}

function signed(value) {
  const number = asNumber(value);
  return `${number >= 0 ? "+" : ""}${formatNumber(number)}`;
}

function formatMarket(market) {
  if (!market) return "--";
  const value = formatNumber(market.value);
  return market.unit === "KRW" ? `${value}원` : value;
}

function macroValue(item) {
  if (!item || item.status !== "official") return "공식값 확인 필요";
  const unit = item.unit ? ` ${item.unit}` : "";
  const period = item.periodLabel ? ` · ${item.periodLabel}` : "";
  return `${formatNumber(item.value)}${unit}${period}`;
}

function magnitudeLabel(change) {
  const absolute = Math.abs(asNumber(change));
  if (absolute >= 5) return "매우 큰";
  if (absolute >= 2) return "큰";
  if (absolute >= 1) return "뚜렷한";
  if (absolute >= 0.5) return "보통";
  return "작은";
}

function toneFromChange(change) {
  return asNumber(change) > 0 ? "positive" : asNumber(change) < 0 ? "negative" : "neutral";
}

function toneForMarket(market) {
  if (!market) return "neutral";
  const change = asNumber(market.changePercent);
  if (market.id === "gold") return "neutral";
  if (["usdkrw", "vix", "wti"].includes(market.id)) {
    return change > 0 ? "negative" : change < 0 ? "positive" : "neutral";
  }
  return toneFromChange(change);
}

function scoreComponents({ vix, usdkrw, kospiChange, spChange, wtiChange }) {
  return [
    { label: "기본값", points: 42, reason: "특별한 충격이 없을 때의 중립 출발점" },
    {
      label: "VIX",
      points: vix > 20 ? 18 : vix < 14 ? -8 : 3,
      reason: `VIX ${formatNumber(vix)}가 ${vix > 20 ? "20을 넘어 경계" : vix < 14 ? "14 아래로 안정" : "14~20의 중립"} 구간`
    },
    {
      label: "원/달러",
      points: usdkrw > 1380 ? 14 : usdkrw < 1320 ? -6 : 4,
      reason: `원/달러 ${formatNumber(usdkrw)}원이라는 절대 수준 반영`
    },
    {
      label: "KOSPI",
      points: kospiChange < -1 ? 9 : kospiChange > 1 ? -5 : 0,
      reason: `당일 등락 ${signed(kospiChange)}%`
    },
    {
      label: "S&P 500",
      points: spChange < -1 ? 8 : spChange > 1 ? -4 : 0,
      reason: `당일 등락 ${signed(spChange)}%`
    },
    {
      label: "WTI 변동",
      points: Math.abs(wtiChange) > 2 ? 5 : 0,
      reason: `당일 변동 ${signed(wtiChange)}%`
    }
  ];
}

export function buildEconomicNarrative(snapshot) {
  const markets = snapshot?.markets || [];
  const macro = snapshot?.macro || [];
  const analysis = snapshot?.analysis || {};
  const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
  const findMacro = (pattern) => macro.find((item) => pattern.test(item.label || ""));

  const kospi = byId.kospi;
  const kosdaq = byId.kosdaq;
  const usdkrw = byId.usdkrw;
  const sp500 = byId.sp500;
  const nasdaq = byId.nasdaq;
  const vixMarket = byId.vix;
  const wti = byId.wti;
  const gold = byId.gold;
  const policyRate = findMacro(/금리/);
  const inflation = findMacro(/소비자|물가/);
  const exports = findMacro(/수출/);
  const credit = findMacro(/신용/);

  const kospiChange = asNumber(kospi?.changePercent);
  const kosdaqChange = asNumber(kosdaq?.changePercent);
  const usdkrwValue = asNumber(usdkrw?.value, 1360);
  const usdkrwChange = asNumber(usdkrw?.changePercent);
  const spChange = asNumber(sp500?.changePercent);
  const nasdaqChange = asNumber(nasdaq?.changePercent);
  const vix = asNumber(vixMarket?.value, 16);
  const vixChange = asNumber(vixMarket?.changePercent);
  const wtiChange = asNumber(wti?.changePercent);
  const koreaGap = kospiChange - kosdaqChange;
  const usTechGap = nasdaqChange - spChange;
  const risingCount = markets.filter((market) => asNumber(market.changePercent) > 0).length;
  const fallingCount = markets.length - risingCount;
  const splitKorea = kospiChange >= 0 && kosdaqChange <= -1.5 && koreaGap >= 2;
  const broadKoreaWeakness = kospiChange < -1 && kosdaqChange < -1;
  const broadKoreaStrength = kospiChange > 1 && kosdaqChange > 1;
  const calmVolatility = vix < 20;
  const importedCostPressure = usdkrwValue > 1380 && wtiChange > 2;

  let heroTitle;
  let title;
  let plainSummary;
  let meaning;
  if (splitKorea) {
    heroTitle = "대형주는 버티고, 중소형주는 크게 밀린 장";
    title = "KOSPI 상승만 보면 회복처럼 보이지만 실제로는 대형주 쏠림이 강합니다.";
    plainSummary = `KOSPI는 ${signed(kospiChange)}%인데 KOSDAQ은 ${signed(kosdaqChange)}%입니다. 한국 증시 전체가 좋아진 것이 아니라 자금이 상대적으로 대형주에 몰린 모습입니다.`;
    meaning = "지수 한 개만 보면 체감과 다른 결론을 낼 수 있습니다. 오늘은 KOSPI 방향보다 시장의 폭과 중소형주 낙폭을 먼저 봐야 합니다.";
  } else if (broadKoreaWeakness) {
    heroTitle = "대형주와 중소형주가 함께 약한 방어 장세";
    title = "한국 주식 전반에서 위험을 줄이려는 움직임이 나타납니다.";
    plainSummary = `KOSPI ${signed(kospiChange)}%, KOSDAQ ${signed(kosdaqChange)}%로 두 시장이 함께 밀렸습니다. 특정 업종보다 시장 전체의 수급 부담일 가능성이 큽니다.`;
    meaning = "환율과 글로벌 주가가 동시에 나쁜지 확인해야 합니다. 함께 악화되면 국내 요인보다 대외 위험의 전염 가능성이 커집니다.";
  } else if (broadKoreaStrength) {
    heroTitle = "대형주와 중소형주가 함께 오르는 넓은 회복";
    title = "상승이 일부 종목이 아니라 시장 전반으로 퍼지고 있습니다.";
    plainSummary = `KOSPI ${signed(kospiChange)}%, KOSDAQ ${signed(kosdaqChange)}%로 두 시장이 함께 올랐습니다. 상승 종목의 폭이 넓어지는지 확인하면 회복의 질을 판단할 수 있습니다.`;
    meaning = "환율 안정과 미국 증시가 함께 받쳐주면 단기 반등보다 지속 가능한 회복으로 볼 근거가 강해집니다.";
  } else {
    heroTitle = "좋은 신호와 나쁜 신호가 섞인 확인 구간";
    title = "시장 방향이 한쪽으로 모이지 않아 지표를 나눠 봐야 합니다.";
    plainSummary = `KOSPI ${signed(kospiChange)}%, KOSDAQ ${signed(kosdaqChange)}%, S&P 500 ${signed(spChange)}%, NASDAQ ${signed(nasdaqChange)}%로 신호가 엇갈립니다.`;
    meaning = "하루 방향을 예측하기보다 환율·변동성·시장 폭이 같은 방향으로 모이는지 확인하는 편이 낫습니다.";
  }

  const globalRead =
    nasdaqChange < spChange - 0.5
      ? `NASDAQ이 S&P 500보다 ${formatNumber(Math.abs(usTechGap))}%p 더 약해 기술·성장주 부담이 더 큽니다.`
      : spChange < 0 && calmVolatility
        ? `미국 주식은 약하지만 VIX가 ${formatNumber(vix)}로 20 아래여서 공황성 투매로 보기는 이릅니다.`
        : vix >= 20
          ? `VIX가 ${formatNumber(vix)}로 20을 넘어 주가 약세가 위험회피로 확대될 가능성을 경계해야 합니다.`
          : `VIX ${formatNumber(vix)}는 극단 공포 구간이 아니므로 지수 등락의 지속성을 더 확인해야 합니다.`;

  const costRead = importedCostPressure
    ? `원/달러 ${formatNumber(usdkrwValue)}원에 WTI가 ${signed(wtiChange)}% 올라 수입물가와 기업 비용이 동시에 압박받을 수 있습니다.`
    : usdkrwValue > 1380
      ? `원/달러가 당일 ${signed(usdkrwChange)}% 움직였지만 ${formatNumber(usdkrwValue)}원이라는 높은 수준 자체는 여전히 부담입니다.`
      : `환율과 유가가 동시에 급등하는 조합은 아니어서 수입비용 충격은 상대적으로 제한적입니다.`;

  const coreReasons = [
    {
      label: "한국 시장 폭",
      fact: `KOSPI ${signed(kospiChange)}% · KOSDAQ ${signed(kosdaqChange)}%`,
      meaning: splitKorea ? "대형주 상승과 중소형주 급락이 갈라져 시장 전체 회복이 아닙니다." : `두 시장의 차이는 ${signed(koreaGap)}%p입니다.`,
      confidence: Math.abs(koreaGap) >= 2 ? "근거 강함" : "추가 확인",
      tone: splitKorea || broadKoreaWeakness ? "negative" : "neutral"
    },
    {
      label: "미국 위험선호",
      fact: `S&P 500 ${signed(spChange)}% · NASDAQ ${signed(nasdaqChange)}% · VIX ${formatNumber(vix)}`,
      meaning: globalRead,
      confidence: vix >= 20 || Math.abs(usTechGap) >= 0.5 ? "근거 중간" : "추가 확인",
      tone: spChange < 0 || nasdaqChange < 0 ? "negative" : "positive"
    },
    {
      label: "한국 비용 압력",
      fact: `원/달러 ${formatNumber(usdkrwValue)}원 · WTI ${formatMarket(wti)} (${signed(wtiChange)}%)`,
      meaning: costRead,
      confidence: importedCostPressure ? "근거 강함" : "근거 중간",
      tone: importedCostPressure || usdkrwValue > 1380 ? "negative" : "neutral"
    }
  ];

  const components = scoreComponents({ vix, usdkrw: usdkrwValue, kospiChange, spChange, wtiChange });
  const rebuiltRisk = Math.max(12, Math.min(88, components.reduce((sum, item) => sum + item.points, 0)));
  const riskScore = asNumber(analysis.riskScore, rebuiltRisk);
  const riskBand = riskScore >= 81 ? "매우 높음" : riskScore >= 66 ? "높음" : riskScore >= 45 ? "주의" : riskScore >= 31 ? "낮음" : "안정";

  const exportValue = asNumber(exports?.value);
  const inflationValue = asNumber(inflation?.value);
  const rateValue = asNumber(policyRate?.value);
  const creditValue = asNumber(credit?.value);
  const koreaTitle =
    exportValue > 0 && (inflationValue > 2.5 || usdkrwValue > 1380)
      ? "수출 숫자는 강하지만 환율·물가 부담 때문에 체감경기는 덜 좋아질 수 있습니다."
      : exportValue > 0
        ? "수출 개선이 성장의 버팀목이지만 내수 회복 여부를 따로 확인해야 합니다."
        : "수출과 내수 모두에서 회복 근거를 더 확인해야 합니다.";
  const koreaSummary = `수출 증가율 ${macroValue(exports)}은 긍정적이지만, 소비자물가 ${macroValue(inflation)}, 원/달러 ${formatNumber(usdkrwValue)}원, WTI ${signed(wtiChange)}%를 같이 보면 가계와 기업의 비용 부담은 남아 있습니다.`;

  const koreaChains = [
    {
      label: "환율·유가 → 물가·금리",
      start: `원/달러 ${formatNumber(usdkrwValue)}원 + WTI ${signed(wtiChange)}%`,
      steps: ["원유·원자재 수입가격", "기업 운송·생산비", "소비자 가격", "금리 인하 여력"],
      result: importedCostPressure
        ? "달러와 유가가 함께 부담을 주면 물가가 천천히 내려가고 금리 인하도 조심스러워질 수 있습니다."
        : "당일 충격은 제한적이지만 환율의 높은 절대 수준이 계속 비용에 반영될 수 있습니다.",
      caution: "유가가 하루만 급등한 것인지 여러 날 이어지는지 확인해야 합니다."
    },
    {
      label: "수출 → 기업이익·고용",
      start: `수출 증가율 ${macroValue(exports)}`,
      steps: ["해외 주문", "공장 가동·매출", "기업이익", "설비투자·고용"],
      result: exportValue > 0
        ? "수출 개선은 제조업과 대형 수출기업 이익에 도움이 될 수 있습니다."
        : "수출 모멘텀이 약하면 한국 성장과 제조업 고용의 버팀목이 약해질 수 있습니다.",
      caution: "전년 대비 증가율은 기저효과가 섞입니다. 수출액·물량·단가·기업 이익률이 모두 같은 폭으로 늘었다는 뜻은 아닙니다."
    },
    {
      label: "금리·가계신용 → 소비",
      start: `기준금리 ${macroValue(policyRate)} + 가계신용 ${macroValue(credit)}`,
      steps: ["대출 이자", "가처분소득", "소비·주택거래", "내수기업 매출"],
      result: creditValue > 0
        ? "가계 빚의 규모가 큰 상태에서는 금리가 조금만 오래 높아도 소비 회복이 느려질 수 있습니다."
        : "가계신용 공식값을 확인해야 내수 부담을 정확히 판단할 수 있습니다.",
      caution: "기준금리와 실제 가계 대출금리는 같은 날 같은 폭으로 움직이지 않습니다."
    }
  ];

  const tensions = [
    splitKorea
      ? `KOSPI는 ${signed(kospiChange)}% 올랐지만 KOSDAQ은 ${signed(kosdaqChange)}% 내려 지수와 체감이 충돌합니다.`
      : `KOSPI와 KOSDAQ의 등락 차이는 ${signed(koreaGap)}%p입니다.`,
    calmVolatility
      ? `주가 약세에도 VIX는 ${formatNumber(vix)}로 20 아래입니다. 약세를 공황으로 과장하면 안 됩니다.`
      : `VIX ${formatNumber(vix)}는 공포가 실제로 커졌다는 쪽의 근거입니다.`,
    usdkrwChange < 0 && usdkrwValue > 1380
      ? `원/달러는 오늘 ${signed(usdkrwChange)}% 내렸지만 수준은 ${formatNumber(usdkrwValue)}원으로 높습니다. 방향과 수준이 다른 신호입니다.`
      : `원/달러의 당일 방향 ${signed(usdkrwChange)}%와 절대 수준 ${formatNumber(usdkrwValue)}원을 함께 봐야 합니다.`,
    exportValue > 20
      ? `수출 증가율 ${formatNumber(exportValue)}%는 매우 크지만 기저효과와 잠정치 여부 때문에 곧바로 체감경기 호황으로 해석하면 안 됩니다.`
      : "수출 증가율만으로 내수와 고용까지 좋아졌다고 단정할 수 없습니다."
  ];

  const facts = [
    {
      label: "확인된 가격",
      value: `KOSPI ${signed(kospiChange)}% · KOSDAQ ${signed(kosdaqChange)}%`,
      note: "두 지수의 당일 등락률"
    },
    {
      label: "확인된 글로벌 가격",
      value: `S&P 500 ${signed(spChange)}% · NASDAQ ${signed(nasdaqChange)}% · VIX ${formatNumber(vix)}`,
      note: "주가와 옵션시장이 보여주는 현재 값"
    },
    {
      label: "확인된 비용 신호",
      value: `원/달러 ${formatNumber(usdkrwValue)}원 · WTI ${formatMarket(wti)}`,
      note: "한국의 수입비용에 영향을 주는 시장가격"
    },
    {
      label: "확인된 한국 공표값",
      value: `물가 ${macroValue(inflation)} · 수출 ${macroValue(exports)}`,
      note: "실시간이 아닌 각 기준월의 공식 발표"
    }
  ];

  const inferences = [
    {
      label: "해석 1",
      title: splitKorea ? "한국 증시는 회복보다 대형주 쏠림에 가깝습니다." : "한국 시장의 폭을 더 확인해야 합니다.",
      basis: `KOSPI와 KOSDAQ 차이 ${signed(koreaGap)}%p`,
      confidence: Math.abs(koreaGap) >= 2 ? "높음" : "중간"
    },
    {
      label: "해석 2",
      title: nasdaqChange < spChange - 0.5 ? "미국 약세는 기술·성장주에 더 집중돼 있습니다." : "미국 약세가 특정 스타일에만 집중됐는지는 불분명합니다.",
      basis: `NASDAQ의 S&P 500 대비 차이 ${signed(usTechGap)}%p, VIX ${formatNumber(vix)}`,
      confidence: Math.abs(usTechGap) >= 0.5 ? "중간" : "낮음"
    },
    {
      label: "해석 3",
      title: importedCostPressure ? "한국은 수입물가와 통화정책 부담이 동시에 커질 수 있습니다." : "수입비용 충격은 추가 지속 여부를 확인해야 합니다.",
      basis: `원/달러 ${formatNumber(usdkrwValue)}원, WTI 당일 ${signed(wtiChange)}%`,
      confidence: importedCostPressure ? "중간" : "낮음"
    }
  ];

  const scenarios = [
    {
      id: "base",
      label: "기본 시나리오",
      title: splitKorea ? "대형주 방어와 중소형주 약세가 이어짐" : "엇갈린 신호가 이어지는 확인 구간",
      trigger: "KOSPI와 KOSDAQ 방향 차이가 유지되고 환율의 높은 수준도 계속될 때",
      meaning: "지수 상승만으로 경기와 시장 전체의 회복을 판단하기 어렵습니다.",
      checks: ["시장 폭", "원/달러 수준", "NASDAQ과 KOSDAQ의 동조"]
    },
    {
      id: "better",
      label: "개선 시나리오",
      title: "상승이 중소형주까지 넓어지고 비용 압력이 완화됨",
      trigger: "KOSDAQ 낙폭 축소·VIX 하락·원/달러 안정이 함께 나타날 때",
      meaning: "대형주 쏠림이 아니라 위험선호가 넓어졌다는 해석이 가능해집니다.",
      checks: ["KOSDAQ 반등", "VIX 20 아래 유지", "환율 추가 하락"]
    },
    {
      id: "worse",
      label: "악화 시나리오",
      title: "글로벌 기술주 약세가 한국 수급과 물가 부담으로 번짐",
      trigger: "NASDAQ 추가 하락·VIX 상승·원/달러와 유가 동반 상승이 나타날 때",
      meaning: "성장주 조정을 넘어 금융여건과 실물비용이 함께 악화될 수 있습니다.",
      checks: ["NASDAQ", "VIX 20 돌파 여부", "유가 상승 지속"]
    }
  ];

  return {
    heroTitle,
    title,
    plainSummary,
    meaning,
    globalRead,
    costRead,
    riskScore,
    riskBand,
    riskComponents: components,
    rebuiltRisk,
    breadth: { rising: risingCount, falling: fallingCount, total: markets.length },
    coreReasons,
    nextChecks: [
      splitKorea ? "KOSDAQ 낙폭이 줄고 KOSPI와 같은 방향으로 움직이는지" : "KOSPI와 KOSDAQ의 방향이 같아지는지",
      `VIX ${formatNumber(vix)}가 20 아래에 머무는지`,
      `원/달러 ${formatNumber(usdkrwValue)}원의 높은 수준이 실제로 낮아지는지`,
      `WTI ${signed(wtiChange)}% 상승이 하루 충격인지 이어지는 흐름인지`
    ],
    korea: {
      title: koreaTitle,
      summary: koreaSummary,
      good: exportValue > 0 ? `수출 증가율 ${macroValue(exports)}` : "뚜렷한 수출 개선 근거 부족",
      burden: `소비자물가 ${macroValue(inflation)} · 원/달러 ${formatNumber(usdkrwValue)}원`,
      household: `기준금리 ${macroValue(policyRate)}와 가계신용 ${macroValue(credit)}이 이자 부담과 소비 여력을 좌우합니다.`,
      business: `수출은 기업 매출에 도움이 될 수 있지만 원/달러 ${formatNumber(usdkrwValue)}원과 WTI ${signed(wtiChange)}%는 원가를 높일 수 있습니다.`,
      policy: inflationValue > 2.5 || usdkrwValue > 1380
        ? "물가와 환율 부담이 남아 있으면 기준금리를 빠르게 내리기 어려울 수 있습니다."
        : "물가와 환율이 안정되면 통화정책이 경기와 가계 부담을 더 고려할 여지가 생깁니다.",
      chains: koreaChains,
      values: { policyRate, inflation, exports, credit }
    },
    facts,
    inferences,
    tensions,
    scenarios,
    limitations: [
      "시장가격은 실시간 또는 최근 마감값이지만 한국 공표지표는 기준월과 발표 주기가 서로 다릅니다.",
      "가격의 동시 움직임은 원인과 결과를 확정하지 않습니다. 가능한 전파 경로를 보여주는 해석입니다.",
      "수출 증가율은 전년 대비 변화이며 수출액·물량·단가·기업이익이 같은 폭으로 늘었다는 뜻이 아닙니다.",
      "위험 온도는 정해진 규칙으로 시장 신호를 요약한 설명값이며 투자 수익률 예측이 아닙니다."
    ],
    marketSnapshot: { kospi, kosdaq, usdkrw, sp500, nasdaq, vix: vixMarket, wti, gold },
    metrics: {
      koreaGap,
      usTechGap,
      vix,
      vixChange,
      usdkrwValue,
      usdkrwChange,
      wtiChange,
      inflationValue,
      rateValue,
      exportValue,
      creditValue
    }
  };
}

export function getMarketDeepRead(selected, markets, narrative) {
  if (!selected) {
    return {
      definition: "선택한 시장지표의 데이터를 확인할 수 없습니다.",
      movement: "현재 움직임을 계산할 수 없습니다.",
      interpretation: "다른 지표를 선택해 주세요.",
      caution: "데이터가 없을 때는 방향을 추정하지 않습니다.",
      checks: []
    };
  }

  const guide = MARKET_GUIDES[selected.id] || {
    definition: "시장의 가격 흐름을 보여주는 지표입니다.",
    up: "매수 우위 흐름입니다.",
    down: "매도 우위 흐름입니다.",
    caution: "한 지표만으로 시장 전체를 단정하면 안 됩니다.",
    peers: []
  };
  const change = asNumber(selected.changePercent);
  const direction = change > 0 ? "올랐고" : change < 0 ? "내렸고" : "변화가 없고";
  const movement = `${selected.name}은 전일 기준보다 ${signed(change)}% ${direction}, 이는 ${magnitudeLabel(change)} 움직임입니다.`;
  let levelNote = "";
  if (selected.id === "usdkrw") {
    levelNote = ` 당일 방향과 별개로 ${formatMarket(selected)}이라는 절대 수준도 함께 봐야 합니다.`;
  } else if (selected.id === "vix") {
    levelNote = ` 현재 ${formatMarket(selected)}는 ${asNumber(selected.value) >= 30 ? "공포가 큰 구간" : asNumber(selected.value) >= 20 ? "경계 구간" : "20 아래의 비공황 구간"}입니다.`;
  } else if (selected.id === "wti") {
    levelNote = " 한국은 원유 수입국이므로 상승이 이어지면 기업 비용과 생활물가에 불리할 수 있습니다.";
  }

  const byId = Object.fromEntries((markets || []).map((market) => [market.id, market]));
  const checks = (guide.peers || [])
    .map((peer) => {
      const market = byId[peer.id];
      if (!market) return null;
      return {
        name: market.name,
        value: `${formatMarket(market)} · ${signed(market.changePercent)}%`,
        question: peer.question,
        tone: toneForMarket(market)
      };
    })
    .filter(Boolean);

  return {
    definition: guide.definition,
    movement,
    interpretation: `${change >= 0 ? guide.up : guide.down}${levelNote}`,
    caution: guide.caution,
    checks,
    overallContext: narrative?.title || "시장 전체 신호를 함께 확인해야 합니다.",
    tone: toneForMarket(selected)
  };
}