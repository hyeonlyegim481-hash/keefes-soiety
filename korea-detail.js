const MARKET_LABELS = Object.freeze({
  kospi: "KOSPI",
  kosdaq: "KOSDAQ",
  usdkrw: "원/달러",
  vix: "VIX",
  wti: "WTI"
});

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function signed(value) {
  const number = finiteNumber(value);
  if (number === null) return "계산 불가";
  return `${number > 0 ? "+" : ""}${number.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%`;
}

function macroObservation(item) {
  const value = finiteNumber(item?.value);
  const available = item?.status === "official" && value !== null;
  if (!available) return { available: false, text: "자료 수집 실패", source: item?.source || "원자료 확인 필요" };
  const formatted = value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  const text = /^%\s*YoY$/i.test(String(item?.unit || ""))
    ? `전년 대비 ${formatted}%`
    : `${formatted}${item?.unit ? ` ${item.unit}` : ""}`;
  return {
    available: true,
    value,
    text,
    source: item?.source || "원자료 제공기관",
    period: item?.periodLabel || item?.asOf || "기준일 확인 필요",
    stale: Boolean(item?.stale)
  };
}

function marketObservation(item) {
  const value = finiteNumber(item?.value);
  const change = finiteNumber(item?.changePercent);
  const changeAvailable = change !== null
    && item?.changeAvailable !== false
    && (!("previousClose" in (item || {})) || finiteNumber(item?.previousClose) > 0);
  if (value === null) {
    return {
      available: false,
      changeAvailable: false,
      text: "자료 수집 실패",
      changeText: "등락률 계산 불가",
      source: item?.source || "시장 원자료",
      asOf: item?.asOf || item?.marketTime || "기준시각 확인 필요"
    };
  }
  const unit = item?.unit === "KRW"
    ? "원"
    : item?.unit === "USD/bbl"
      ? "/배럴"
      : item?.unit === "pt"
        ? "포인트"
        : "";
  return {
    available: true,
    value,
    change,
    changeAvailable,
    text: `${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${unit}`,
    changeText: changeAvailable ? signed(change) : "등락률 계산 불가",
    source: item?.source || "시장 원자료",
    asOf: item?.asOf || item?.marketTime || "기준시각 확인 필요"
  };
}

function findMacro(macro, pattern) {
  return (macro || []).find((item) => pattern.test(String(item?.label || "")));
}

function availableStatus(available, tone = "neutral") {
  return available ? tone : "unavailable";
}

export function buildKoreaDetailModel({ macro = [], markets = [], analysis = {}, narrative = {} } = {}) {
  const byMarket = Object.fromEntries(markets.map((item) => [item.id, item]));
  const rate = macroObservation(findMacro(macro, /금리/));
  const inflation = macroObservation(findMacro(macro, /소비자|물가/));
  const exports = macroObservation(findMacro(macro, /수출/));
  const credit = macroObservation(findMacro(macro, /신용/));
  const employment = macroObservation(findMacro(macro, /고용|실업|취업/));
  const housing = macroObservation(findMacro(macro, /주택|부동산|매매|전세/));

  const kospi = marketObservation(byMarket.kospi);
  const kosdaq = marketObservation(byMarket.kosdaq);
  const usdkrw = marketObservation(byMarket.usdkrw);
  const vix = marketObservation(byMarket.vix);
  const wti = marketObservation(byMarket.wti);

  const marketPairAvailable = kospi.changeAvailable && kosdaq.changeAvailable;
  const marketGap = marketPairAvailable ? kospi.change - kosdaq.change : null;
  const marketTone = !marketPairAvailable
    ? "unavailable"
    : kospi.change > 0 && kosdaq.change > 0
      ? "positive"
      : kospi.change < 0 && kosdaq.change < 0
        ? "negative"
        : "watch";
  const costPressure = usdkrw.available && (usdkrw.value >= 1380 || (wti.changeAvailable && wti.change >= 2));
  const pricePressure = inflation.available && inflation.value > 2.5;
  const householdPressure = rate.available && credit.available && rate.value >= 3;

  const sectors = [
    {
      id: "exports",
      label: "수출·제조업",
      status: availableStatus(exports.available, exports.value > 0 ? "positive" : "negative"),
      verdict: exports.available ? (exports.value > 0 ? "해외 수요가 성장의 버팀목" : "수출 회복 근거가 약함") : "판단 자료 부족",
      evidence: `수출 ${exports.text}`,
      explanation: exports.available
        ? "수출 증가는 공장 가동과 대형 제조기업 매출에 도움이 될 수 있지만 물량·단가·품목별 기여도를 따로 봐야 합니다."
        : "수출 공식값이 연결되지 않아 제조업 방향을 판단하지 않습니다.",
      watch: "반도체 제외 수출, 일평균 수출, 수출물량지수, 제조업 생산"
    },
    {
      id: "households",
      label: "가계·내수",
      status: availableStatus(rate.available && credit.available, householdPressure ? "watch" : "neutral"),
      verdict: rate.available && credit.available ? (householdPressure ? "이자 부담이 소비 회복을 제약" : "가계 부담 완화 여부 확인") : "판단 자료 부족",
      evidence: `기준금리 ${rate.text} · 가계신용 ${credit.text}`,
      explanation: rate.available && credit.available
        ? "기준금리보다 실제 대출금리와 원리금 상환액이 소비에 더 직접적입니다. 부채가 큰 가계와 무차입 가계의 체감도 다릅니다."
        : "기준금리와 가계신용 중 하나 이상이 없어 내수 압력을 단정하지 않습니다.",
      watch: "소매판매, 서비스업 생산, 카드승인액, 가계대출 연체율"
    },
    {
      id: "prices",
      label: "물가·금리",
      status: availableStatus(inflation.available && rate.available, pricePressure ? "watch" : "neutral"),
      verdict: inflation.available && rate.available ? (pricePressure ? "물가가 정책 여력을 제한" : "물가 안정의 지속성 확인") : "판단 자료 부족",
      evidence: `소비자물가 ${inflation.text} · 기준금리 ${rate.text}`,
      explanation: inflation.available && rate.available
        ? "전체 물가뿐 아니라 근원물가와 서비스물가가 내려가야 금리 부담을 낮출 여지가 커집니다."
        : "물가 또는 기준금리 자료가 없어 통화정책 여력을 판단하지 않습니다.",
      watch: "근원물가, 서비스물가, 기대인플레이션, 예금·대출금리"
    },
    {
      id: "external",
      label: "환율·대외비용",
      status: availableStatus(usdkrw.available && wti.available, costPressure ? "negative" : "neutral"),
      verdict: usdkrw.available && wti.available ? (costPressure ? "수입 원가 압력을 경계" : "대외비용 충격은 제한적") : "판단 자료 부족",
      evidence: `원/달러 ${usdkrw.text} (${usdkrw.changeText}) · WTI ${wti.text} (${wti.changeText})`,
      explanation: usdkrw.available && wti.available
        ? "원화 약세와 유가 상승이 겹치면 에너지·원재료의 원화 환산 비용이 커져 기업 원가와 생활물가로 전달될 수 있습니다."
        : "환율 또는 유가 자료가 없어 수입비용 압력을 판단하지 않습니다.",
      watch: "달러지수, 원화 실효환율, 수입물가지수, 경상수지"
    },
    {
      id: "finance",
      label: "증시·금융여건",
      status: marketTone,
      verdict: !marketPairAvailable
        ? "판단 자료 부족"
        : marketTone === "positive"
          ? "대형주와 성장주가 함께 강함"
          : marketTone === "negative"
            ? "시장 전반의 위험선호가 약함"
            : "대형주와 성장주의 체감이 엇갈림",
      evidence: `KOSPI ${kospi.changeText} · KOSDAQ ${kosdaq.changeText}${marketGap === null ? "" : ` · 차이 ${signed(marketGap)}p`}`,
      explanation: marketPairAvailable
        ? "두 지수의 방향이 같아야 시장 회복의 폭이 넓다고 볼 근거가 생깁니다. 하루 등락만으로 경기 방향을 확정하지 않습니다."
        : "같은 거래일 기준의 두 지수 등락률이 없어 시장의 폭을 계산하지 않습니다.",
      watch: `외국인 순매수, 거래대금, 회사채 스프레드, VIX ${vix.available ? `${vix.text} (${vix.changeText})` : "자료 없음"}`
    },
    {
      id: "jobs-housing",
      label: "고용·주거",
      status: availableStatus(employment.available && housing.available),
      verdict: employment.available && housing.available ? "고용과 주거 흐름을 함께 확인" : "판단 자료 부족",
      evidence: employment.available || housing.available
        ? `고용 ${employment.text} · 주거 ${housing.text}`
        : "현재 핵심 스냅샷에 고용·주거 최신값이 연결되지 않음",
      explanation: employment.available && housing.available
        ? "고용의 양과 질, 주택가격과 거래량을 함께 봐야 가계의 실제 소득과 금융안정을 구분할 수 있습니다."
        : "없는 값을 추정하지 않습니다. 공식 고용동향과 주택 거래·가격·착공 자료가 연결되면 판단합니다.",
      watch: "취업자 수, 고용률, 실업률, 주택 거래량, 전세가, 착공, PF 연체"
    }
  ];

  const impacts = [
    {
      label: "원화 약세",
      signal: usdkrw.available ? `${usdkrw.text} · 당일 ${usdkrw.changeText}` : "자료 수집 실패",
      helps: "달러 매출 비중이 높고 수입 원가가 낮은 수출기업",
      burdens: "에너지·원재료 수입기업, 해외여행·직구, 외화부채 보유자",
      caution: "환헤지, 수입부품 비중과 해외 생산비용에 따라 기업별 효과가 달라집니다."
    },
    {
      label: "국제유가 변화",
      signal: wti.available ? `${wti.text} · 당일 ${wti.changeText}` : "자료 수집 실패",
      helps: "제품가격 전가와 재고 효과를 확보한 일부 에너지 기업",
      burdens: "항공·운송·화학, 냉난방비와 물류비를 부담하는 가계·소상공인",
      caution: "WTI는 선물가격이며 국내 도입가격과 소비자 가격에는 환율과 시차가 반영됩니다."
    },
    {
      label: "높은 금리",
      signal: rate.available ? `기준금리 ${rate.text}` : "자료 수집 실패",
      helps: "순현금이 많거나 예금 이자소득 비중이 높은 경제주체",
      burdens: "변동금리 대출 가계, 차입이 많은 중소기업·부동산 사업",
      caution: "기준금리와 실제 예금·대출금리는 같은 시점에 같은 폭으로 움직이지 않습니다."
    },
    {
      label: "수출 변화",
      signal: exports.available ? `수출 ${exports.text}` : "자료 수집 실패",
      helps: "해외 주문과 가동률이 실제로 증가한 제조업·물류 공급망",
      burdens: "내수 의존 업종은 수출 호조의 직접 효과가 제한될 수 있음",
      caution: "기저효과를 제외하고 수출액·물량·단가·품목 집중도를 함께 확인해야 합니다."
    }
  ];

  const qualityItems = [
    ["기준금리", rate.available, rate.period, rate.source],
    ["소비자물가", inflation.available, inflation.period, inflation.source],
    ["수출", exports.available, exports.period, exports.source],
    ["가계신용", credit.available, credit.period, credit.source],
    ...Object.entries({ kospi, kosdaq, usdkrw, vix, wti }).map(([id, item]) => [
      MARKET_LABELS[id],
      item.available,
      item.asOf,
      item.source
    ])
  ];
  const availableCount = qualityItems.filter(([, available]) => available).length;

  return {
    sectors,
    impacts,
    scenarios: Array.isArray(narrative?.scenarios) ? narrative.scenarios.slice(0, 3) : [],
    tensions: Array.isArray(narrative?.tensions) ? narrative.tensions.slice(0, 4) : [],
    limitations: Array.isArray(narrative?.limitations) ? narrative.limitations.slice(0, 4) : [],
    dataQuality: {
      availableCount,
      totalCount: qualityItems.length,
      label: availableCount === qualityItems.length ? "주요 자료 정상" : availableCount >= 6 ? "일부 자료 확인 필요" : "판단 자료 부족",
      items: qualityItems.map(([label, available, basis, source]) => ({ label, available, basis, source }))
    },
    methodology: `부문별 신호는 공식 거시자료와 시장가격 ${qualityItems.length}개를 규칙으로 묶은 설명입니다. 물가 2.5% 초과, 기준금리 3% 이상, 원/달러 1,380원 이상, WTI 당일 2% 이상을 부담 점검선으로 사용하며 경제성장률이나 투자수익률을 예측하지 않습니다.`,
    riskScore: finiteNumber(analysis?.riskScore)
  };
}
