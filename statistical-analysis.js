const DAY_MS = 86_400_000;

export const ANALYSIS_HORIZONS = Object.freeze([
  { id: "1d", label: "1일", days: 1 },
  { id: "5d", label: "5일", days: 5 },
  { id: "20d", label: "20일", days: 20 },
  { id: "3m", label: "3개월", days: 91 },
  { id: "1y", label: "1년", days: 365 }
]);

export const ECONOMIC_REGIME_RULES = Object.freeze([
  { id: "recovery", label: "경기회복", test: (s) => s.equityBreadth >= 0.6 && s.riskDirection < 0 },
  { id: "slowdown", label: "경기둔화", test: (s) => s.equityBreadth <= 0.4 && s.riskDirection > 0 },
  { id: "recession-risk", label: "침체위험", test: (s) => s.vix >= 25 && s.equityBreadth <= 0.4 },
  { id: "inflation-pressure", label: "물가압력", test: (s) => s.wtiChange > 1 && s.fxChange > 0 },
  { id: "disinflation", label: "디스인플레이션", test: (s) => s.wtiChange < -1 && s.vix < 20 },
  { id: "stagflation", label: "스태그플레이션", test: (s) => s.wtiChange > 2 && s.equityBreadth <= 0.4 },
  { id: "rate-hike-shock", label: "금리인상 충격", test: (s) => s.nasdaqChange < -1 && s.fxChange > 0 },
  { id: "rate-cut-hope", label: "금리인하 기대", test: (s) => s.nasdaqChange > 1 && s.vix < 20 },
  { id: "financial-stress", label: "금융불안", test: (s) => s.vix >= 25 || s.riskScore >= 66 },
  { id: "export-recovery", label: "수출회복", test: (s) => s.exportGrowth > 0 && s.kospiChange > 0 },
  { id: "domestic-weakness", label: "내수부진", test: (s) => s.domesticGrowth < 0 },
  { id: "supply-shock", label: "공급망 충격", test: (s) => s.wtiChange > 2 && s.riskDirection > 0 }
]);

function finite(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function cleanSeries(series) {
  const points = new Map();
  for (const point of Array.isArray(series) ? series : []) {
    const time = Date.parse(point?.time);
    const value = Number(point?.value);
    if (Number.isFinite(time) && Number.isFinite(value)) points.set(time, value);
  }
  return [...points.entries()]
    .sort(([left], [right]) => left - right)
    .map(([time, value]) => ({ time, value }));
}

function percentChange(current, previous) {
  if (!finite(current) || !finite(previous) || Number(previous) === 0) return null;
  return ((Number(current) - Number(previous)) / Math.abs(Number(previous))) * 100;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length < 2) return null;
  const average = mean(values);
  return Math.sqrt(
    values.reduce((sum, value) => sum + ((value - average) ** 2), 0) /
      (values.length - 1)
  );
}

function round(value, digits = 2) {
  return finite(value) ? Number(Number(value).toFixed(digits)) : null;
}

export function calculateSeriesStatistics(series) {
  const points = cleanSeries(series);
  if (!points.length) {
    return {
      sampleSize: 0,
      horizons: Object.fromEntries(
        ANALYSIS_HORIZONS.map(({ id, label }) => [
          id,
          { label, status: "insufficient", value: null, reason: "시계열 없음" }
        ])
      ),
      percentile: null,
      zScore: null,
      volatility: null,
      velocity: null
    };
  }

  const first = points[0];
  const last = points.at(-1);
  const coverageDays = (last.time - first.time) / DAY_MS;
  const horizons = {};
  for (const horizon of ANALYSIS_HORIZONS) {
    if (coverageDays < horizon.days * 0.75) {
      horizons[horizon.id] = {
        label: horizon.label,
        status: "insufficient",
        value: null,
        reason: `필요 ${horizon.days}일 · 확보 ${round(coverageDays, 1)}일`
      };
      continue;
    }
    const target = last.time - horizon.days * DAY_MS;
    const baseline = points.filter((point) => point.time <= target).at(-1) || first;
    horizons[horizon.id] = {
      label: horizon.label,
      status: "available",
      value: round(percentChange(last.value, baseline.value)),
      baselineAt: new Date(baseline.time).toISOString(),
      currentAt: new Date(last.time).toISOString()
    };
  }

  const values = points.map((point) => point.value);
  const deviation = standardDeviation(values);
  const returns = points
    .slice(1)
    .map((point, index) => percentChange(point.value, points[index].value))
    .filter(finite);
  const returnDeviation = standardDeviation(returns);
  const percentile = values.length >= 20
    ? (values.filter((value) => value <= last.value).length / values.length) * 100
    : null;
  const zScore = values.length >= 20 && deviation > 0
    ? (last.value - mean(values)) / deviation
    : null;
  const oneDay = horizons["1d"].value;
  const fiveDay = horizons["5d"].value;

  return {
    sampleSize: points.length,
    coverageDays: round(coverageDays, 1),
    startAt: new Date(first.time).toISOString(),
    endAt: new Date(last.time).toISOString(),
    horizons,
    percentile: round(percentile, 1),
    zScore: round(zScore),
    volatility: returns.length >= 10 ? round(returnDeviation) : null,
    velocity: finite(oneDay) && finite(fiveDay)
      ? round(Number(oneDay) - Number(fiveDay) / 5)
      : null
  };
}

function riskSign(marketId, change) {
  if (!finite(change) || Number(change) === 0 || marketId === "gold") return 0;
  const direction = Math.sign(Number(change));
  return ["usdkrw", "vix", "wti"].includes(marketId) ? direction : -direction;
}

function findMacroGrowth(macro, pattern) {
  const item = (macro || []).find(
    (entry) => entry?.status === "official" && pattern.test(entry?.label || "")
  );
  return finite(item?.changePercent) ? Number(item.changePercent) : null;
}

export function evaluateEconomicRegimes(signals, observationHistory = []) {
  const prior = Array.isArray(observationHistory) ? observationHistory.slice(-2) : [];
  return ECONOMIC_REGIME_RULES.map((rule) => {
    const current = Boolean(rule.test(signals));
    const previousMatches = prior.filter((item) => item?.[rule.id] === true).length;
    const consecutiveObservations = current ? previousMatches + 1 : 0;
    return {
      id: rule.id,
      label: rule.label,
      active: current,
      status:
        consecutiveObservations >= 3
          ? "confirmed"
          : current
            ? "candidate"
            : "inactive",
      consecutiveObservations,
      requiredObservations: 3
    };
  });
}

export function buildStatisticalRuleAnalysis({
  markets = [],
  macro = [],
  riskScore = null,
  observationHistory = [],
  now = Date.now()
} = {}) {
  const marketStatistics = Object.fromEntries(
    markets.map((market) => [
      market.id,
      {
        id: market.id,
        name: market.name,
        ...calculateSeriesStatistics(market.series)
      }
    ])
  );
  const oneDayChanges = Object.fromEntries(
    Object.entries(marketStatistics).map(([id, stats]) => [
      id,
      stats.horizons["1d"].value
    ])
  );
  const riskSignals = Object.entries(oneDayChanges)
    .map(([id, change]) => ({ id, change, sign: riskSign(id, change) }))
    .filter((signal) => signal.sign !== 0);
  const adverse = riskSignals.filter((signal) => signal.sign > 0);
  const favorable = riskSignals.filter((signal) => signal.sign < 0);
  const dominantSign =
    adverse.length === favorable.length ? 0 : adverse.length > favorable.length ? 1 : -1;
  const agreementRate = riskSignals.length
    ? Math.max(adverse.length, favorable.length) / riskSignals.length
    : null;
  const latestTimestamp = Math.max(
    ...markets.map((market) => Date.parse(market.asOf)).filter(Number.isFinite)
  );
  const ageMinutes = Number.isFinite(latestTimestamp)
    ? Math.max(0, (Number(now) - latestTimestamp) / 60_000)
    : null;
  const availableRatio = markets.length
    ? markets.filter((market) => finite(market.value)).length / markets.length
    : 0;
  const enoughSamplesRatio = markets.length
    ? Object.values(marketStatistics).filter((stats) => stats.sampleSize >= 20).length /
      markets.length
    : 0;
  const freshnessScore =
    ageMinutes === null ? 0 : ageMinutes <= 15 ? 100 : ageMinutes <= 60 ? 75 : ageMinutes <= 360 ? 45 : 20;
  const dataQualityScore = Math.round(
    availableRatio * 50 + enoughSamplesRatio * 25 + freshnessScore * 0.25
  );
  const confidenceScore = Math.round(
    availableRatio * 40 +
      (agreementRate ?? 0) * 35 +
      enoughSamplesRatio * 25
  );
  const equityIds = ["kospi", "kosdaq", "sp500", "nasdaq"];
  const positiveEquities = equityIds.filter((id) => Number(oneDayChanges[id]) > 0).length;
  const knownEquities = equityIds.filter((id) => finite(oneDayChanges[id])).length;
  const signals = {
    riskScore: finite(riskScore) ? Number(riskScore) : null,
    riskDirection: dominantSign,
    equityBreadth: knownEquities ? positiveEquities / knownEquities : 0.5,
    vix: Number(markets.find((market) => market.id === "vix")?.value),
    wtiChange: oneDayChanges.wti,
    fxChange: oneDayChanges.usdkrw,
    nasdaqChange: oneDayChanges.nasdaq,
    kospiChange: oneDayChanges.kospi,
    exportGrowth: findMacroGrowth(macro, /수출/),
    domesticGrowth: findMacroGrowth(macro, /소매|소비|내수/)
  };
  const regimes = evaluateEconomicRegimes(signals, observationHistory);
  const confirmed = regimes.filter((regime) => regime.status === "confirmed");
  const candidates = regimes.filter((regime) => regime.status === "candidate");

  return {
    methodologyVersion: "1.0",
    horizons: ANALYSIS_HORIZONS,
    markets: marketStatistics,
    directionAgreement: {
      rate: round(agreementRate === null ? null : agreementRate * 100, 1),
      dominant: dominantSign > 0 ? "위험 확대" : dominantSign < 0 ? "위험 완화" : "혼조",
      agreeingSignals: riskSignals
        .filter((signal) => signal.sign === dominantSign)
        .map((signal) => signal.id),
      counterSignals: riskSignals
        .filter((signal) => dominantSign && signal.sign !== dominantSign)
        .map((signal) => signal.id)
    },
    risk: {
      score: finite(riskScore) ? Number(riskScore) : null,
      meaning: "단기 시장 스트레스를 정리한 설명값이며 발생확률이 아님"
    },
    confidence: {
      score: confidenceScore,
      label: confidenceScore >= 75 ? "높음" : confidenceScore >= 50 ? "보통" : "낮음"
    },
    dataQuality: {
      score: dataQualityScore,
      label: dataQualityScore >= 80 ? "양호" : dataQualityScore >= 55 ? "주의" : "부족",
      ageMinutes: round(ageMinutes, 1),
      availableRatio: round(availableRatio * 100, 1),
      sufficientSampleRatio: round(enoughSamplesRatio * 100, 1)
    },
    regimes,
    currentRegime:
      confirmed[0]?.label ||
      (candidates[0] ? `확정 전: ${candidates[0].label} (${candidates[0].consecutiveObservations}/3)` : "판단 자료 부족"),
    limitations: [
      "현재 시장 API 시계열은 5일 범위이므로 20일·3개월·1년 변화는 자료 부족으로 표시",
      "경제 국면은 같은 규칙이 3회 연속 관측되기 전까지 확정하지 않음",
      "위험도·분석 확실도·데이터 품질은 서로 다른 값"
    ]
  };
}
