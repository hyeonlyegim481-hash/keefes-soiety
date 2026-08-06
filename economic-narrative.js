import { getMarketKnowledge } from "./economic-graph.js";

function isFiniteInput(value) {
  return value !== null
    && value !== undefined
    && value !== ""
    && Number.isFinite(Number(value));
}

function asNumber(value, fallback = 0) {
  return isFiniteInput(value) ? Number(value) : fallback;
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
  if (!market || !isFiniteInput(market.value)) return "--";
  const value = formatNumber(market.value);
  if (market.unit === "KRW") return `${value}원`;
  if (market.unit === "USD/bbl") return `${value}/배럴`;
  if (market.unit === "USD/oz") return `${value}/트로이온스`;
  if (market.unit === "pt") return `${value}포인트`;
  return value;
}

function macroValue(item) {
  if (!item || item.status !== "official") return "자료를 가져오지 못했습니다";
  const unit = item.unit ? ` ${item.unit}` : "";
  const period = item.periodLabel ? ` · ${item.periodLabel}` : "";
  return `${formatNumber(item.value)}${unit}${period}`;
}

function hasOfficialMacro(item) {
  return item?.status === "official" && Number.isFinite(Number(item.value));
}

const STAT_MARKET_LABELS = Object.freeze({
  kospi: "KOSPI",
  kosdaq: "KOSDAQ",
  usdkrw: "원/달러",
  sp500: "S&P 500",
  nasdaq: "NASDAQ",
  vix: "VIX",
  wti: "WTI",
  gold: "금"
});

function formatHorizonValue(horizon) {
  if (horizon?.status !== "available" || !isFiniteInput(horizon?.value)) return null;
  return `${horizon.label} ${signed(horizon.value)}%`;
}

function buildStatisticalSummary(statisticalAnalysis) {
  if (!statisticalAnalysis || !Object.keys(statisticalAnalysis).length) {
    return {
      available: false,
      currentRegime: "판단 자료 부족",
      markets: [],
      limitations: ["공통 통계 분석 결과가 연결되지 않았습니다."]
    };
  }
  const preferredIds = ["kospi", "kosdaq", "usdkrw", "nasdaq", "vix", "wti"];
  const markets = preferredIds
    .map((id) => {
      const statistics = statisticalAnalysis?.markets?.[id];
      if (!statistics) return null;
      const horizons = ["1d", "5d", "20d", "3m", "1y"]
        .map((horizonId) => formatHorizonValue(statistics.horizons?.[horizonId]))
        .filter(Boolean);
      return {
        id,
        label: STAT_MARKET_LABELS[id] || statistics.name || id,
        trend: statistics.assessment?.label || "추세 판단 자료 부족",
        persistenceRate: isFiniteInput(statistics.assessment?.persistenceRate)
          ? Number(statistics.assessment.persistenceRate)
          : null,
        position: statistics.assessment?.position?.label || "장기 위치 판단 자료 부족",
        horizons,
        analogs: statistics.analogs?.status === "available"
          ? statistics.analogs.matches || []
          : []
      };
    })
    .filter(Boolean);
  return {
    available: markets.some((market) => market.horizons.length),
    methodologyVersion: statisticalAnalysis.methodologyVersion || "확인 필요",
    currentRegime: statisticalAnalysis.currentRegime || "판단 자료 부족",
    confidence: statisticalAnalysis.confidence || { score: null, label: "자료 부족", components: [] },
    dataQuality: statisticalAnalysis.dataQuality || { score: null, label: "자료 부족", components: [] },
    agreement: statisticalAnalysis.directionAgreement || { rate: null, dominant: "판단 자료 부족" },
    drivers: statisticalAnalysis.drivers || { adverse: [], favorable: [], counter: [] },
    markets,
    limitations: Array.isArray(statisticalAnalysis.limitations)
      ? statisticalAnalysis.limitations
      : []
  };
}

function marketHorizonFact(statisticalSummary, ids, fallback) {
  if (!statisticalSummary?.available) return fallback;
  const parts = ids.map((id) => {
    const market = statisticalSummary.markets.find((item) => item.id === id);
    if (!market) return null;
    const short = market.horizons.find((item) => item.startsWith("1일 "));
    const medium = market.horizons.find((item) => item.startsWith("20일 "))
      || market.horizons.find((item) => item.startsWith("5일 "));
    const horizons = [short, medium].filter(Boolean).join(" · ");
    return horizons ? `${market.label} ${horizons}` : null;
  }).filter(Boolean);
  return parts.length ? parts.join(" / ") : fallback;
}

function marketTrendNote(statisticalSummary, ids) {
  const parts = ids.map((id) => {
    const market = statisticalSummary?.markets?.find((item) => item.id === id);
    return market ? `${market.label} ${market.trend}` : null;
  }).filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeNewsText(value) {
  return String(value || "")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^0-9a-z가-힣]/g, "");
}

function getCauseMarketBasis(reason, markets) {
  const marketIds = new Set(Array.isArray(reason?.marketIds) ? reason.marketIds : []);
  return (Array.isArray(markets) ? markets : [])
    .filter((market) => marketIds.has(market.id) && Number.isFinite(Date.parse(market.asOf)))
    .map((market) => ({
      timestamp: Date.parse(market.asOf),
      asOf: market.asOf,
      tradingDate: market.tradingDate || String(market.asOf).slice(0, 10)
    }))
    .sort((left, right) => right.timestamp - left.timestamp)[0] || null;
}

function connectNewsToCause(reason, headlines, markets, limit = 3) {
  const terms = Array.isArray(reason?.newsTerms) ? reason.newsTerms.filter(Boolean) : [];
  const allowedSections = new Set(Array.isArray(reason?.newsSections) ? reason.newsSections : []);
  const marketBasis = getCauseMarketBasis(reason, markets);
  const scored = (Array.isArray(headlines) ? headlines : [])
    .map((headline) => {
      const normalizedTitle = normalizeNewsText(headline?.title);
      const matchedTerms = terms.filter((term) => normalizedTitle.includes(normalizeNewsText(term)));
      const sectionMatch = allowedSections.has(headline?.section);
      if (!matchedTerms.length || (!sectionMatch && matchedTerms.length < 2)) return null;

      const publishedTimestamp = Date.parse(headline?.publishedAt);
      let timing = "unknown";
      let timingLabel = "시각 비교 불가";
      let timingRank = 0;
      if (marketBasis && Number.isFinite(publishedTimestamp)) {
        const marketDateEnd = marketBasis.timestamp + DAY_MS;
        if (publishedTimestamp > marketDateEnd) {
          timing = "after";
          timingLabel = "마감 후 후속 기사 · 원인 증거 아님";
          timingRank = 1;
        } else if (publishedTimestamp >= marketBasis.timestamp - (2 * DAY_MS)) {
          timing = "near";
          timingLabel = "같은 거래일 전후 기사 · 선후관계 미확인";
          timingRank = 3;
        } else {
          timing = "background";
          timingLabel = "사전 배경 기사 · 직접 원인 미확인";
          timingRank = 2;
        }
      }

      const sourceCount = Math.max(1, Number(headline?.relatedSourceCount) || 1);
      const score = (matchedTerms.length * 6)
        + (sectionMatch ? 3 : 0)
        + (headline?.importanceLabel === "최우선" ? 2 : headline?.importanceLabel === "주요" ? 1 : 0)
        + Math.min(2, sourceCount - 1);
      return {
        id: headline?.id || headline?.eventKey || headline?.title,
        title: headline?.title || "제목 확인 불가",
        source: headline?.source || "출처 확인 중",
        url: headline?.url || "",
        publishedAt: headline?.publishedAt || null,
        importanceLabel: headline?.importanceLabel || "선별",
        relatedSourceCount: sourceCount,
        matchedTerms: matchedTerms.slice(0, 3),
        timing,
        timingLabel,
        canSupportCause: timing === "near",
        score,
        timingRank,
        publishedTimestamp: Number.isFinite(publishedTimestamp) ? publishedTimestamp : 0
      };
    })
    .filter(Boolean)
    .sort((left, right) =>
      right.timingRank - left.timingRank
      || right.score - left.score
      || right.publishedTimestamp - left.publishedTimestamp
    )
    .slice(0, limit)
    .map(({ score, timingRank, publishedTimestamp, ...headline }) => headline);

  return {
    ...reason,
    newsBasisAt: marketBasis?.asOf || null,
    newsBasisLabel: marketBasis?.tradingDate || null,
    newsEvidence: scored
  };
}

function buildUnavailableNarrative(snapshot, missingIds, reason = "market-value") {
  const markets = snapshot?.markets || [];
  const names = {
    kospi: "KOSPI",
    kosdaq: "KOSDAQ",
    usdkrw: "원/달러",
    sp500: "S&P 500",
    nasdaq: "NASDAQ",
    vix: "VIX",
    wti: "WTI",
    gold: "금"
  };
  const missingLabel = missingIds.map((id) => names[id] || id).join(", ");
  const changeUnavailable = reason === "previous-close";
  const notice = changeUnavailable
    ? `${missingLabel}의 이전 종가를 확인하지 못해 등락률을 계산할 수 없습니다.`
    : `${missingLabel} 자료를 가져오지 못했습니다.`;
  return {
    dataComplete: false,
    missingMarketIds: missingIds,
    unavailableReason: reason,
    heroTitle: changeUnavailable
      ? "일부 시장의 당일 등락률을 계산할 수 없습니다"
      : "일부 시장 자료를 가져오지 못했습니다",
    title: "불완전한 숫자로 경제 방향을 예측하지 않습니다.",
    plainSummary: `${notice} 확인이 끝날 때까지 위험 온도와 시장 방향 분석을 표시하지 않습니다.`,
    meaning: "확인되지 않은 값을 0이나 임의 숫자로 바꾸면 반대 결론이 나올 수 있어 분석을 보류했습니다.",
    globalRead: notice,
    costRead: notice,
    riskScore: null,
    riskBand: "계산 보류",
    riskComponents: [],
    rebuiltRisk: null,
    breadth: {
      rising: markets.filter((market) => Number(market.changePercent) > 0).length,
      falling: markets.filter((market) => Number(market.changePercent) < 0).length,
      total: markets.length
    },
    coreReasons: [{
      label: "자료 연결 상태",
      fact: notice,
      meaning: "자료가 다시 수집된 뒤 분석을 제공합니다.",
      hypothesis: "필수 가격과 이전 종가가 확인되지 않아 원인 가설을 만들지 않습니다.",
      path: ["원자료 미수집", "가격 검증 불가", "원인 분석 보류"],
      koreaImpact: "확인되지 않은 값으로 한국 경제 영향을 추정하지 않습니다.",
      invalidation: "필수 시장 8개의 현재값·이전 종가·기준시각이 모두 확인될 때 분석을 재개합니다.",
      checks: ["시장 API 응답", "이전 종가", "기준시각"],
      confidence: "분석 보류",
      tone: "negative"
    }],
    nextChecks: ["자료 연결 복구 여부"],
    korea: {
      title: "시장 자료가 부족해 한국 경제 방향을 판단하지 않습니다.",
      summary: notice,
      good: "판단 보류",
      burden: "판단 보류",
      household: notice,
      business: notice,
      policy: notice,
      chains: [],
      values: {}
    },
    facts: [{ label: "미수집 자료", value: missingLabel, note: "임의 대체값을 사용하지 않음" }],
    inferences: [],
    tensions: [],
    scenarios: [],
    limitations: [notice, "자료가 복구되기 전에는 가격 간 관계와 위험 점수를 계산하지 않습니다."],
    statisticalSummary: buildStatisticalSummary(snapshot?.analysis?.statisticalAnalysis)
  };
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
  if (
    !market
    || !isFiniteInput(market.changePercent)
    || market.changeAvailable === false
  ) {
    return "neutral";
  }
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
  const statisticalSummary = buildStatisticalSummary(analysis?.statisticalAnalysis);
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

  const requiredMarketIds = ["kospi", "kosdaq", "usdkrw", "sp500", "nasdaq", "vix", "wti", "gold"];
  const missingMarketIds = requiredMarketIds.filter(
    (id) => !byId[id] || !isFiniteInput(byId[id].value)
  );
  if (missingMarketIds.length) {
    return buildUnavailableNarrative(snapshot, missingMarketIds);
  }
  const unavailableChangeIds = requiredMarketIds.filter(
    (id) =>
      !isFiniteInput(byId[id].changePercent)
      || byId[id].changeAvailable === false
  );
  if (unavailableChangeIds.length) {
    return buildUnavailableNarrative(
      snapshot,
      unavailableChangeIds,
      "previous-close"
    );
  }

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
      label: splitKorea ? "대형주·반도체 영향 가능성" : "한국 시장 폭",
      fact: marketHorizonFact(statisticalSummary, ["kospi", "kosdaq"], `KOSPI ${signed(kospiChange)}% · KOSDAQ ${signed(kosdaqChange)}%`),
      meaning: `${splitKorea ? "대형주 상승과 중소형주 급락이 갈라져 시장 전체 회복이 아닙니다." : `두 시장의 차이는 ${signed(koreaGap)}%p입니다.`}${marketTrendNote(statisticalSummary, ["kospi", "kosdaq"]) ? ` 기간 흐름은 ${marketTrendNote(statisticalSummary, ["kospi", "kosdaq"])}입니다.` : ""}`,
      hypothesis: splitKorea
        ? "시가총액 상위 대형주에 매수세가 집중돼 KOSPI가 방어됐을 가능성이 있습니다. 반도체 기여도는 별도 업종 자료가 필요하므로 가능성으로만 봅니다."
        : broadKoreaWeakness
          ? "특정 업종보다 한국 주식 전반에서 위험을 줄이는 수급이 우세했을 가능성이 있습니다."
          : "대형주와 중소형주의 방향 차이가 아직 뚜렷하지 않아 시장 전체 수급을 추가로 확인해야 합니다.",
      path: splitKorea
        ? ["시총 상위주 상대강세", "KOSPI 지수 방어", "중소형주 체감경기와 괴리"]
        : ["국내 주식 수급 변화", "KOSPI·KOSDAQ 등락", "기업 규모별 체감 차이"],
      koreaImpact: splitKorea
        ? "지수는 강해 보여도 중소형 성장기업의 자금조달과 투자심리는 약할 수 있습니다. 대형 수출주와 내수·성장주의 체감이 갈라질 수 있습니다."
        : "두 지수가 같은 방향으로 움직이면 국내 위험선호가 넓게 변하는 신호일 수 있지만, 업종별 차이는 따로 봐야 합니다.",
      invalidation: splitKorea
        ? "KOSDAQ 낙폭이 빠르게 줄고 상승 종목 수와 업종 기여도가 넓어지면 대형주 쏠림 해석은 약해집니다."
        : "KOSPI와 KOSDAQ의 방향 차이가 확대되면 시장 전체 흐름이라는 해석을 바꿔야 합니다.",
      checks: ["업종별 지수 기여도", "외국인 현물·선물 수급", "상승·하락 종목 수"],
      caveat: "반도체 중심 여부는 현재 가격만으로 확정할 수 없습니다. 업종 기여도와 외국인 순매수 자료가 추가되면 결론이 바뀔 수 있습니다.",
      confidence: Math.abs(koreaGap) >= 2 ? "근거 강함" : "추가 확인",
      tone: splitKorea || broadKoreaWeakness ? "negative" : "neutral",
      marketIds: ["kospi", "kosdaq"],
      newsTerms: ["코스피", "KOSPI", "코스닥", "KOSDAQ", "반도체", "대형주", "외국인", "증시", "수급", "숏커버"],
      newsSections: ["korea"]
    },
    {
      label: "미국 기술주와 위험선호",
      fact: `${marketHorizonFact(statisticalSummary, ["sp500", "nasdaq"], `S&P 500 ${signed(spChange)}% · NASDAQ ${signed(nasdaqChange)}%`)} · VIX ${formatNumber(vix)}`,
      meaning: `${globalRead}${marketTrendNote(statisticalSummary, ["sp500", "nasdaq"]) ? ` 기간 흐름은 ${marketTrendNote(statisticalSummary, ["sp500", "nasdaq"])}입니다.` : ""}`,
      hypothesis: nasdaqChange < spChange - 0.5
        ? "금리에 민감한 기술·성장주의 부담이 미국 시장 약세를 주도했을 가능성이 있습니다."
        : vix >= 20
          ? "특정 업종 조정보다 시장 전반의 위험회피가 강해졌을 가능성이 있습니다."
          : "미국 시장 신호가 한 방향으로 모이지 않아 단기 포지션 조정일 가능성도 남아 있습니다.",
      path: ["미국 금리·실적 기대", "NASDAQ·S&P 500 위험선호", "외국인 수급과 한국 성장주"],
      koreaImpact: "미국 기술주 약세가 이어지면 국내 반도체·인터넷·바이오 등 성장주 평가와 외국인 수급에 부담이 전달될 수 있습니다.",
      invalidation: "NASDAQ이 S&P 500보다 강해지고 VIX가 낮아지면 기술주 중심 위험회피 가설은 약해집니다.",
      checks: ["미국 국채금리", "NASDAQ 상대수익률", "VIX 20선", "반도체 지수"],
      caveat: "같은 날 함께 움직였다는 사실만으로 미국 시장이 한국 시장의 원인이라고 확정할 수 없습니다.",
      confidence: vix >= 20 || Math.abs(usTechGap) >= 0.5 ? "근거 중간" : "추가 확인",
      tone: spChange < 0 || nasdaqChange < 0 ? "negative" : "positive",
      marketIds: ["sp500", "nasdaq", "vix"],
      newsTerms: ["나스닥", "NASDAQ", "S&P", "SP500", "빅테크", "미국 증시", "기술주", "연준", "미 국채", "반도체"],
      newsSections: ["us", "industry", "fx-bonds"]
    },
    {
      label: "원화 가치와 수입 비용",
      fact: `${formatNumber(usdkrwValue)}원 · ${marketHorizonFact(statisticalSummary, ["usdkrw"], `당일 ${signed(usdkrwChange)}%`)}`,
      meaning: `${usdkrwValue > 1380
        ? `원/달러의 당일 방향과 별개로 ${formatNumber(usdkrwValue)}원이라는 높은 수준은 수입기업과 물가에 부담입니다.`
        : "환율 수준만으로 급격한 수입비용 충격을 단정하기는 어렵습니다."}${marketTrendNote(statisticalSummary, ["usdkrw"]) ? ` ${marketTrendNote(statisticalSummary, ["usdkrw"])}입니다.` : ""}`,
      hypothesis: usdkrwValue > 1380
        ? "달러 수요와 원화 약세가 이어져 수입 원가와 외국인 자금 흐름에 부담을 주고 있을 가능성이 있습니다."
        : "환율이 극단적으로 높은 구간은 아니며 당일 방향이 기업 비용에 실제로 전달되는지 확인해야 합니다.",
      path: ["달러 수요·원화 가치", "원유·원자재·부품 수입단가", "기업 원가·소비자물가·금리 여력"],
      koreaImpact: "항공·운송·유통·원재료 수입기업은 비용 부담이 커질 수 있고, 달러 매출이 많은 수출기업은 원화 환산 매출에 일부 도움이 될 수 있습니다.",
      invalidation: "원/달러가 여러 거래일 하락하고 수입물가와 외국인 순매도가 함께 안정되면 환율 부담 해석은 약해집니다.",
      checks: ["달러인덱스", "외국인 순매수", "수입물가지수", "환헤지 비용"],
      caveat: "환율 상승이 모든 수출기업에 유리한 것은 아닙니다. 달러 비용과 해외 생산 비중에 따라 영향이 달라집니다.",
      confidence: usdkrwValue > 1380 ? "근거 중간" : "추가 확인",
      tone: usdkrwValue > 1380 ? "negative" : "neutral",
      marketIds: ["usdkrw"],
      newsTerms: ["원/달러", "원달러", "환율", "원화", "달러", "외환", "수입물가", "달러인덱스"],
      newsSections: ["commodities-fx", "fx-bonds", "korea"]
    },
    {
      label: "유가와 에너지 비용",
      fact: `${formatMarket(wti)} · ${marketHorizonFact(statisticalSummary, ["wti"], `당일 ${signed(wtiChange)}%`)}`,
      meaning: `${Math.abs(wtiChange) > 2
        ? `유가가 하루 ${signed(wtiChange)}% 움직여 운송·화학·항공 비용 경로를 확인해야 합니다.`
        : "유가의 당일 움직임만으로 광범위한 물가 충격을 단정하기는 어렵습니다."}${marketTrendNote(statisticalSummary, ["wti"]) ? ` ${marketTrendNote(statisticalSummary, ["wti"])}입니다.` : ""}`,
      hypothesis: wtiChange > 2
        ? "공급 우려나 지정학적 위험이 에너지 가격을 밀어 올려 비용 부담을 키웠을 가능성이 있습니다."
        : wtiChange < -2
          ? "수요 둔화 우려 또는 공급 확대 기대가 유가를 낮췄을 가능성이 있습니다."
          : "유가는 뚜렷한 충격보다 기존 범위 안에서 움직였을 가능성이 큽니다.",
      path: ["원유 공급·수요 기대", "정유·운송·전력 비용", "기업 마진·소비자물가"],
      koreaImpact: "에너지 수입 비중이 큰 한국은 유가 상승이 무역수지와 물가에 부담이 될 수 있습니다. 정유사는 제품 가격과 정제마진에 따라 영향이 달라집니다.",
      invalidation: "유가가 며칠 안에 상승분을 되돌리고 해상운임·정제마진·기대인플레이션이 반응하지 않으면 비용 충격 가설은 약해집니다.",
      checks: ["브렌트유", "정제마진", "해상운임", "기대인플레이션"],
      caveat: "하루 유가 변화는 재고 발표나 선물 만기 같은 일시 요인일 수 있어 최소 며칠의 지속성을 확인해야 합니다.",
      confidence: Math.abs(wtiChange) > 2 ? "근거 중간" : "추가 확인",
      tone: wtiChange > 2 ? "negative" : wtiChange < -2 ? "positive" : "neutral",
      marketIds: ["wti"],
      newsTerms: ["WTI", "유가", "원유", "석유", "OPEC", "에너지", "중동", "호르무즈", "정제마진"],
      newsSections: ["commodities-fx", "security-disasters", "disasters-climate", "europe-global", "korea"]
    }
  ];

  const connectedCoreReasons = coreReasons.map((reason) =>
    connectNewsToCause(reason, snapshot?.headlines, markets)
  );

  const components = scoreComponents({ vix, usdkrw: usdkrwValue, kospiChange, spChange, wtiChange });
  const rebuiltRisk = Math.max(12, Math.min(88, components.reduce((sum, item) => sum + item.points, 0)));
  const riskScore = asNumber(analysis.riskScore, rebuiltRisk);
  const riskBand = riskScore >= 81 ? "매우 높음" : riskScore >= 66 ? "높음" : riskScore >= 45 ? "주의" : riskScore >= 31 ? "낮음" : "안정";

  const hasExports = hasOfficialMacro(exports);
  const hasInflation = hasOfficialMacro(inflation);
  const hasPolicyRate = hasOfficialMacro(policyRate);
  const hasCredit = hasOfficialMacro(credit);
  const exportValue = hasExports ? Number(exports.value) : null;
  const inflationValue = hasInflation ? Number(inflation.value) : null;
  const rateValue = hasPolicyRate ? Number(policyRate.value) : null;
  const creditValue = hasCredit ? Number(credit.value) : null;
  const koreaTitle =
    !hasExports
      ? "수출 공식자료를 가져오지 못해 경기 방향 판단을 보류합니다."
      : exportValue > 0 && (inflationValue > 2.5 || usdkrwValue > 1380)
        ? "수출 숫자는 강하지만 환율·물가 부담 때문에 체감경기는 덜 좋아질 수 있습니다."
        : exportValue > 0
          ? "수출 개선이 성장의 버팀목이지만 내수 회복 여부를 따로 확인해야 합니다."
          : "수출과 내수 모두에서 회복 근거를 더 확인해야 합니다.";
  const koreaSummary = !hasExports
    ? `수출 증가율 자료를 가져오지 못했습니다. 확인되지 않은 값으로 긍정·부정 판단을 만들지 않습니다. 소비자물가 ${macroValue(inflation)}, 원/달러 ${formatNumber(usdkrwValue)}원과 WTI ${signed(wtiChange)}%는 별도로 확인할 수 있습니다.`
    : exportValue > 0
      ? `수출 증가율 ${macroValue(exports)}은 개선 신호입니다. 다만 소비자물가 ${macroValue(inflation)}, 원/달러 ${formatNumber(usdkrwValue)}원, WTI ${signed(wtiChange)}%를 같이 보면 가계와 기업의 비용 부담은 남아 있습니다.`
      : `수출 증가율 ${macroValue(exports)}은 성장의 버팀목이 약해질 가능성을 보여줍니다. 물가와 환율을 함께 확인해야 합니다.`;

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
      result: !hasExports
        ? "수출 공식자료를 가져오지 못해 기업이익과 고용으로 이어지는 영향을 판단하지 않습니다."
        : exportValue > 0
          ? "수출 개선은 제조업과 대형 수출기업 이익에 도움이 될 수 있습니다."
          : "수출 모멘텀이 약하면 한국 성장과 제조업 고용의 버팀목이 약해질 수 있습니다.",
      caution: "전년 대비 증가율은 기저효과가 섞입니다. 수출액·물량·단가·기업 이익률이 모두 같은 폭으로 늘었다는 뜻은 아닙니다."
    },
    {
      label: "금리·가계신용 → 소비",
      start: `기준금리 ${macroValue(policyRate)} + 가계신용 ${macroValue(credit)}`,
      steps: ["대출 이자", "가처분소득", "소비·주택거래", "내수기업 매출"],
      result: hasCredit && creditValue > 0
        ? "가계 빚의 규모가 큰 상태에서는 금리가 조금만 오래 높아도 소비 회복이 느려질 수 있습니다."
        : "가계신용 자료를 가져오지 못해 내수 부담을 판단하지 않습니다.",
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
    !hasExports
      ? "수출 증가율 자료를 가져오지 못해 수출과 내수의 연결을 판단하지 않습니다."
      : exportValue > 20
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
    coreReasons: connectedCoreReasons,
    nextChecks: [
      splitKorea ? "KOSDAQ 낙폭이 줄고 KOSPI와 같은 방향으로 움직이는지" : "KOSPI와 KOSDAQ의 방향이 같아지는지",
      `VIX ${formatNumber(vix)}가 20 아래에 머무는지`,
      `원/달러 ${formatNumber(usdkrwValue)}원의 높은 수준이 실제로 낮아지는지`,
      `WTI ${signed(wtiChange)}% 상승이 하루 충격인지 이어지는 흐름인지`
    ],
    korea: {
      title: koreaTitle,
      summary: koreaSummary,
      good: !hasExports ? "수출 자료를 가져오지 못했습니다" : exportValue > 0 ? `수출 증가율 ${macroValue(exports)}` : "뚜렷한 수출 개선 근거 부족",
      burden: `소비자물가 ${macroValue(inflation)} · 원/달러 ${formatNumber(usdkrwValue)}원`,
      household: hasPolicyRate && hasCredit
        ? `기준금리 ${macroValue(policyRate)}와 가계신용 ${macroValue(credit)}이 이자 부담과 소비 여력을 좌우합니다.`
        : "기준금리 또는 가계신용 자료를 가져오지 못해 가계 부담 판단을 보류합니다.",
      business: hasExports
        ? `수출은 기업 매출에 도움이 될 수 있지만 원/달러 ${formatNumber(usdkrwValue)}원과 WTI ${signed(wtiChange)}%는 원가를 높일 수 있습니다.`
        : "수출 자료를 가져오지 못해 기업 매출 영향을 판단하지 않습니다.",
      policy: !hasInflation
        ? "소비자물가 자료를 가져오지 못해 통화정책 여력을 판단하지 않습니다."
        : inflationValue > 2.5 || usdkrwValue > 1380
          ? "물가와 환율 부담이 남아 있으면 기준금리를 빠르게 내리기 어려울 수 있습니다."
          : "물가와 환율이 안정되면 통화정책이 경기와 가계 부담을 더 고려할 여지가 생깁니다.",
      chains: koreaChains,
      values: { policyRate, inflation, exports, credit }
    },
    facts,
    inferences,
    tensions,
    scenarios,
    statisticalSummary,
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

  const guide = getMarketKnowledge(selected.id) || {
    definition: "시장의 가격 흐름을 보여주는 지표입니다.",
    up: "매수 우위 흐름입니다.",
    down: "매도 우위 흐름입니다.",
    caution: "한 지표만으로 시장 전체를 단정하면 안 됩니다.",
    peers: [],
    deepFocus: "선택 시장과 한국 경제의 연결",
    transmission: "시장 가격 변화 → 금융여건과 기대 변화 → 기업·가계 행동",
    koreaImpact: "한 시장지표만으로 한국 경제 전체의 방향을 단정하지 않습니다.",
    watch: []
  };
  const changeAvailable =
    isFiniteInput(selected.changePercent)
    && selected.changeAvailable !== false;
  const change = changeAvailable ? asNumber(selected.changePercent) : null;
  const direction =
    change > 0 ? "올랐고" : change < 0 ? "내렸고" : "변화가 없고";
  const movement = changeAvailable
    ? `${selected.name}은 전일 기준보다 ${signed(change)}% ${direction}, 이는 ${magnitudeLabel(change)} 움직임입니다.`
    : `${selected.name}의 현재값은 ${formatMarket(selected)}이지만 이전 종가를 확인하지 못해 당일 등락률은 계산하지 않습니다.`;
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
        value:
          isFiniteInput(market.changePercent)
          && market.changeAvailable !== false
            ? `${formatMarket(market)} · ${signed(market.changePercent)}%`
            : `${formatMarket(market)} · 등락률 계산 불가`,
        question: peer.question,
        tone: toneForMarket(market)
      };
    })
    .filter(Boolean);

  return {
    definition: guide.definition,
    movement,
    interpretation: changeAvailable
      ? `${change >= 0 ? guide.up : guide.down}${levelNote}`
      : `당일 방향은 단정하지 않습니다.${levelNote}`,
    caution: guide.caution,
    checks,
    overallContext: narrative?.title || "시장 전체 신호를 함께 확인해야 합니다.",
    deepFocus: guide.deepFocus,
    transmission: guide.transmission,
    koreaImpact: guide.koreaImpact,
    watch: guide.watch,
    tone: toneForMarket(selected)
  };
}