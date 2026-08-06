const DAY_MS = 86_400_000;

export const ANALYSIS_HORIZONS = Object.freeze([
  { id: "1d", label: "1일", days: 1 },
  { id: "5d", label: "5일", days: 5 },
  { id: "20d", label: "20일", days: 20 },
  { id: "3m", label: "3개월", days: 91 },
  { id: "1y", label: "1년", days: 365 }
]);

function finite(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function hasSignals(signals, ...keys) {
  return keys.every((key) => finite(signals?.[key]));
}

export const ECONOMIC_REGIME_RULES = Object.freeze([
  { id: "recovery", label: "경기회복", test: (s) => hasSignals(s, "equityBreadth", "riskDirection") && s.equityBreadth >= 0.6 && s.riskDirection < 0 },
  { id: "slowdown", label: "경기둔화", test: (s) => hasSignals(s, "equityBreadth", "riskDirection") && s.equityBreadth <= 0.4 && s.riskDirection > 0 },
  { id: "recession-risk", label: "침체위험", test: (s) => hasSignals(s, "vix", "equityBreadth") && s.vix >= 25 && s.equityBreadth <= 0.4 },
  { id: "inflation-pressure", label: "물가압력", test: (s) => hasSignals(s, "wtiChange", "fxChange") && s.wtiChange > 1 && s.fxChange > 0 },
  { id: "disinflation", label: "디스인플레이션", test: (s) => hasSignals(s, "wtiChange", "vix") && s.wtiChange < -1 && s.vix < 20 },
  { id: "stagflation", label: "스태그플레이션", test: (s) => hasSignals(s, "wtiChange", "equityBreadth") && s.wtiChange > 2 && s.equityBreadth <= 0.4 },
  { id: "rate-hike-shock", label: "금리인상 충격", test: (s) => hasSignals(s, "nasdaqChange", "fxChange") && s.nasdaqChange < -1 && s.fxChange > 0 },
  { id: "rate-cut-hope", label: "금리인하 기대", test: (s) => hasSignals(s, "nasdaqChange", "vix") && s.nasdaqChange > 1 && s.vix < 20 },
  { id: "financial-stress", label: "금융불안", test: (s) => (finite(s?.vix) && s.vix >= 25) || (finite(s?.riskScore) && s.riskScore >= 66) },
  { id: "export-recovery", label: "수출회복", test: (s) => hasSignals(s, "exportGrowth", "kospiChange") && s.exportGrowth > 0 && s.kospiChange > 0 },
  { id: "domestic-weakness", label: "내수부진", test: (s) => finite(s?.domesticGrowth) && s.domesticGrowth < 0 },
  { id: "supply-shock", label: "공급망 충격", test: (s) => hasSignals(s, "wtiChange", "riskDirection") && s.wtiChange > 2 && s.riskDirection > 0 }
]);

const MARKET_SIGNAL_CONTEXT = Object.freeze({
  kospi: { label: "KOSPI", scale: 1, transmission: "국내 대형주 수급과 기업 이익 기대" },
  kosdaq: { label: "KOSDAQ", scale: 1.2, transmission: "성장주 위험선호와 자금조달 여건" },
  usdkrw: { label: "원/달러", scale: 0.6, transmission: "수입 원가·외국인 수급·물가" },
  sp500: { label: "S&P 500", scale: 1, transmission: "미국 경기 기대와 글로벌 위험선호" },
  nasdaq: { label: "NASDAQ", scale: 1.2, transmission: "기술주·반도체·금리 민감도" },
  vix: { label: "VIX", scale: 5, transmission: "금융시장 불안과 위험회피" },
  wti: { label: "WTI", scale: 2, transmission: "에너지 수입비용·운송·물가" },
  gold: { label: "금", scale: 1, transmission: "실질금리·달러·안전자산 수요" }
});

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

const HORIZON_TREND_CONFIG = Object.freeze({
  "1d": { weight: 1, scale: 1 },
  "5d": { weight: 2, scale: 2.5 },
  "20d": { weight: 3, scale: 6 },
  "3m": { weight: 2, scale: 12 },
  "1y": { weight: 1, scale: 24 }
});

function buildTrendAssessment(statistics) {
  const available = Object.entries(statistics?.horizons || {})
    .filter(([, horizon]) => horizon?.status === "available" && finite(horizon.value))
    .map(([id, horizon]) => {
      const config = HORIZON_TREND_CONFIG[id] || { weight: 1, scale: 1 };
      const normalized = Math.tanh(Number(horizon.value) / config.scale) * 100;
      return {
        id,
        label: horizon.label,
        value: Number(horizon.value),
        weight: config.weight,
        contribution: normalized * config.weight
      };
    });
  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  const score = totalWeight
    ? available.reduce((sum, item) => sum + item.contribution, 0) / totalWeight
    : null;
  const direction = !finite(score) || Math.abs(score) < 12
    ? "mixed"
    : score > 0
      ? "up"
      : "down";
  const alignedCount = direction === "mixed"
    ? available.filter((item) => Math.abs(item.value) < 0.2).length
    : available.filter((item) => Math.sign(item.value) === (direction === "up" ? 1 : -1)).length;
  const persistenceRate = available.length ? (alignedCount / available.length) * 100 : null;
  const dominant = available
    .slice()
    .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))[0] || null;
  const label = !finite(score)
    ? "판단 자료 부족"
    : score >= 55
      ? "강한 상승 흐름"
      : score >= 18
        ? "상승 우위"
        : score <= -55
          ? "강한 하락 흐름"
          : score <= -18
            ? "하락 우위"
            : "기간별 신호 혼조";
  const percentile = statistics?.percentile;
  const positionLabel = !finite(percentile)
    ? "장기 위치 판단 자료 부족"
    : percentile >= 80
      ? "확보 구간 상단"
      : percentile <= 20
        ? "확보 구간 하단"
        : "확보 구간 중간";

  return {
    score: round(score, 1),
    label,
    direction,
    availableHorizonCount: available.length,
    totalHorizonCount: ANALYSIS_HORIZONS.length,
    persistenceRate: round(persistenceRate, 1),
    dominantHorizon: dominant
      ? { id: dominant.id, label: dominant.label, value: round(dominant.value) }
      : null,
    position: {
      percentile: finite(percentile) ? Number(percentile) : null,
      zScore: finite(statistics?.zScore) ? Number(statistics.zScore) : null,
      label: positionLabel
    }
  };
}

function forwardChangeAtObservation(points, observationIndex, days = 20) {
  const current = points[observationIndex];
  if (!current) return null;
  const target = current.time + days * DAY_MS;
  const future = points.slice(observationIndex + 1).find((point) => point.time >= target);
  return future ? percentChange(future.value, current.value) : null;
}

export function findSeriesPatternAnalogs(series, { limit = 3 } = {}) {
  const points = cleanSeries(series);
  if (points.length < 80) {
    return { status: "insufficient", reason: `최소 80개 관측 필요 · 확보 ${points.length}개`, matches: [] };
  }
  const latestIndex = points.length - 1;
  const coverageDays = (points.at(-1).time - points[0].time) / DAY_MS;
  const current5d = changeAtObservation(points, latestIndex, 5);
  const current20d = changeAtObservation(points, latestIndex, 20);
  if (coverageDays < 120 || !finite(current5d) || !finite(current20d)) {
    return { status: "insufficient", reason: `최소 120일과 5일·20일 변화 필요 · 확보 ${round(coverageDays, 1)}일`, matches: [] };
  }

  const cutoff = points.at(-1).time - 60 * DAY_MS;
  const candidates = [];
  for (let index = 0; index < latestIndex; index += 1) {
    if (points[index].time > cutoff) continue;
    const change5d = changeAtObservation(points, index, 5);
    const change20d = changeAtObservation(points, index, 20);
    const forward20d = forwardChangeAtObservation(points, index, 20);
    if (![change5d, change20d, forward20d].every(finite)) continue;
    const distance = Math.sqrt(
      ((Number(change5d) - Number(current5d)) / 2) ** 2
      + ((Number(change20d) - Number(current20d)) / 5) ** 2
    );
    const similarity = 100 / (1 + distance);
    if (similarity < 45) continue;
    candidates.push({
      date: new Date(points[index].time).toISOString(),
      similarity: round(similarity, 1),
      change5d: round(change5d),
      change20d: round(change20d),
      subsequent20d: round(forward20d)
    });
  }

  const matches = [];
  for (const candidate of candidates.sort((left, right) => right.similarity - left.similarity)) {
    if (matches.some((item) => Math.abs(Date.parse(item.date) - Date.parse(candidate.date)) < 14 * DAY_MS)) continue;
    matches.push(candidate);
    if (matches.length >= Math.max(1, Number(limit) || 3)) break;
  }
  return matches.length
    ? {
        status: "available",
        current: { change5d: round(current5d), change20d: round(current20d) },
        matches,
        methodology: "현재 5일·20일 가격 변화와 과거 구간을 비교한 유사도"
      }
    : {
        status: "insufficient",
        reason: "유사도 45점 이상이며 서로 14일 이상 떨어진 과거 구간 없음",
        matches: []
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
  if (finite(item?.changePercent)) return Number(item.changePercent);
  if (finite(item?.value) && /%\s*(YoY|MoM|QoQ)/i.test(String(item?.unit || ""))) {
    return Number(item.value);
  }
  return null;
}

function changeAtObservation(points, observationIndex, days = 1) {
  const current = points[observationIndex];
  if (!current) return null;
  const target = current.time - days * DAY_MS;
  const baseline = points
    .slice(0, observationIndex)
    .filter((point) => point.time <= target)
    .at(-1);
  return baseline ? percentChange(current.value, baseline.value) : null;
}

function buildSignalsAtOffset(markets, macro, offset) {
  const observations = Object.fromEntries(
    markets.map((market) => {
      const points = cleanSeries(market.series);
      const index = points.length - 1 - offset;
      return [
        market.id,
        {
          value: points[index]?.value ?? null,
          change: changeAtObservation(points, index)
        }
      ];
    })
  );
  const riskSignals = Object.entries(observations)
    .map(([id, observation]) => riskSign(id, observation.change))
    .filter((sign) => sign !== 0);
  const equityIds = ["kospi", "kosdaq", "sp500", "nasdaq"];
  const knownEquities = equityIds.filter((id) => finite(observations[id]?.change));
  const positiveEquities = knownEquities.filter(
    (id) => Number(observations[id].change) > 0
  );
  return {
    riskScore: null,
    riskDirection: riskSignals.length
      ? Math.sign(riskSignals.reduce((sum, sign) => sum + sign, 0))
      : null,
    equityBreadth: knownEquities.length
      ? positiveEquities.length / knownEquities.length
      : null,
    vix: observations.vix?.value ?? null,
    wtiChange: observations.wti?.change ?? null,
    fxChange: observations.usdkrw?.change ?? null,
    nasdaqChange: observations.nasdaq?.change ?? null,
    kospiChange: observations.kospi?.change ?? null,
    exportGrowth: findMacroGrowth(macro, /수출/),
    domesticGrowth: findMacroGrowth(macro, /소매|소비|내수/)
  };
}

function deriveRegimeObservationHistory(markets, macro) {
  return [2, 1].map((offset) => {
    const signals = buildSignalsAtOffset(markets, macro, offset);
    return Object.fromEntries(
      ECONOMIC_REGIME_RULES.map((rule) => [rule.id, Boolean(rule.test(signals))])
    );
  });
}

export function evaluateEconomicRegimes(signals, observationHistory = []) {
  const prior = Array.isArray(observationHistory) ? observationHistory.slice(-2) : [];
  return ECONOMIC_REGIME_RULES.map((rule) => {
    const current = Boolean(rule.test(signals));
    let previousMatches = 0;
    for (let index = prior.length - 1; index >= 0; index -= 1) {
      if (prior[index]?.[rule.id] !== true) break;
      previousMatches += 1;
    }
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

function getMarketAgeMinutes(market, now) {
  if (finite(market?.dataAgeMinutes)) return Math.max(0, Number(market.dataAgeMinutes));
  const timestamp = Date.parse(market?.asOf);
  return Number.isFinite(timestamp) ? Math.max(0, (Number(now) - timestamp) / 60_000) : null;
}

function scoreMarketFreshness(market, now) {
  const ageMinutes = getMarketAgeMinutes(market, now);
  if (!finite(ageMinutes)) return { score: 0, ageMinutes: null, status: "unknown" };
  const open = market?.marketOpen === true;
  const score = open
    ? ageMinutes <= 15 ? 100 : ageMinutes <= 60 ? 75 : ageMinutes <= 180 ? 40 : 10
    : ageMinutes <= 36 * 60 ? 100 : ageMinutes <= 96 * 60 ? 75 : ageMinutes <= 168 * 60 ? 40 : 10;
  return {
    score: market?.delayed === true ? Math.min(score, open ? 40 : 75) : score,
    ageMinutes: round(ageMinutes, 1),
    status: market?.delayed === true ? "delayed" : open ? "open" : "closed"
  };
}

function scoreComponent(id, label, score, weight, detail) {
  const safeScore = Math.max(0, Math.min(100, finite(score) ? Number(score) : 0));
  return {
    id,
    label,
    score: round(safeScore, 1),
    weight,
    points: round((safeScore * weight) / 100, 1),
    detail
  };
}

function buildMarketSignal(id, change, statistics) {
  if (!finite(change)) return null;
  const context = MARKET_SIGNAL_CONTEXT[id] || { label: id, scale: 1, transmission: "관련 시장과 경제주체" };
  const sign = riskSign(id, change);
  const mediumChange = statistics?.horizons?.["20d"]?.status === "available"
    ? statistics.horizons["20d"].value
    : statistics?.horizons?.["5d"]?.value;
  const mediumLabel = statistics?.horizons?.["20d"]?.status === "available" ? "20일" : "5일";
  const severity = Math.min(100, (Math.abs(Number(change)) / context.scale) * 55 + (finite(mediumChange) ? Math.min(30, Math.abs(Number(mediumChange)) / context.scale * 5) : 0));
  return {
    id,
    label: context.label,
    change1d: round(change),
    mediumChange: finite(mediumChange) ? round(mediumChange) : null,
    mediumLabel: finite(mediumChange) ? mediumLabel : null,
    riskDirection: sign > 0 ? "adverse" : sign < 0 ? "favorable" : "neutral",
    severity: round(severity, 1),
    aligned: finite(mediumChange) && Number(change) !== 0 && Number(mediumChange) !== 0
      ? Math.sign(Number(change)) === Math.sign(Number(mediumChange))
      : null,
    transmission: context.transmission,
    caveat: "가격 동시 움직임은 원인을 확정하지 않으며 뉴스·수급·업종 자료가 추가되면 해석이 바뀔 수 있음"
  };
}

export function buildStatisticalRuleAnalysis({
  markets = [],
  macro = [],
  riskScore = null,
  observationHistory = [],
  now = Date.now()
} = {}) {
  const marketStatistics = Object.fromEntries(
    markets.map((market) => {
      const statistics = calculateSeriesStatistics(market.series);
      return [market.id, {
        id: market.id,
        name: market.name,
        ...statistics,
        assessment: buildTrendAssessment(statistics),
        analogs: findSeriesPatternAnalogs(market.series)
      }
      ];
    })
  );
  const oneDayChanges = Object.fromEntries(
    Object.entries(marketStatistics).map(([id, stats]) => [
      id,
      stats.horizons["1d"].value
    ])
  );
  const eligibleRiskIds = ["kospi", "kosdaq", "sp500", "nasdaq", "usdkrw", "vix", "wti"];
  const signalUniverse = eligibleRiskIds.map((id) => ({
    id,
    change: oneDayChanges[id],
    known: finite(oneDayChanges[id]),
    sign: finite(oneDayChanges[id]) ? riskSign(id, oneDayChanges[id]) : null
  }));
  const knownRiskSignals = signalUniverse.filter((signal) => signal.known);
  const riskSignals = knownRiskSignals.filter((signal) => signal.sign !== 0);
  const adverse = riskSignals.filter((signal) => signal.sign > 0);
  const favorable = riskSignals.filter((signal) => signal.sign < 0);
  const dominantSign =
    !riskSignals.length || adverse.length === favorable.length
      ? null
      : adverse.length > favorable.length ? 1 : -1;
  const agreementRate = riskSignals.length
    ? Math.max(adverse.length, favorable.length) / riskSignals.length
    : null;
  const signalCoverageRate = eligibleRiskIds.length
    ? knownRiskSignals.length / eligibleRiskIds.length
    : 0;
  const freshnessByMarket = Object.fromEntries(markets.map((market) => [
    market.id,
    scoreMarketFreshness(market, now)
  ]));
  const freshnessRows = Object.values(freshnessByMarket);
  const freshnessScore = freshnessRows.length
    ? mean(freshnessRows.map((row) => row.score))
    : 0;
  const knownAges = freshnessRows.map((row) => row.ageMinutes).filter(finite);
  const ageMinutes = knownAges.length ? Math.max(...knownAges) : null;
  const availableRatio = markets.length
    ? markets.filter((market) => finite(market.value)).length / markets.length
    : 0;
  const enoughSamplesRatio = markets.length
    ? Object.values(marketStatistics).filter((stats) => stats.sampleSize >= 20).length /
      markets.length
    : 0;
  const horizonSummary = ANALYSIS_HORIZONS.map((horizon) => {
    const availableCount = Object.values(marketStatistics)
      .filter((statistics) => statistics.horizons[horizon.id]?.status === "available")
      .length;
    return {
      id: horizon.id,
      label: horizon.label,
      availableCount,
      totalCount: markets.length,
      coverageRate: markets.length ? round((availableCount / markets.length) * 100, 1) : 0
    };
  });
  const horizonCoverageRatio = markets.length
    ? horizonSummary.reduce((sum, item) => sum + item.availableCount, 0) /
      (markets.length * ANALYSIS_HORIZONS.length)
    : 0;
  const exportGrowth = findMacroGrowth(macro, /수출/);
  const domesticGrowth = findMacroGrowth(macro, /소매|소비|내수/);
  const macroCoverageRatio = [exportGrowth, domesticGrowth].filter(finite).length / 2;
  const agreementEvidenceScore = (agreementRate ?? 0) * signalCoverageRate * 100;
  const confidenceComponents = [
    scoreComponent("availability", "현재값 완전성", availableRatio * 100, 25, `${markets.filter((market) => finite(market.value)).length}/${markets.length}개 시장값 확인`),
    scoreComponent("history", "기간 자료 범위", ((enoughSamplesRatio + horizonCoverageRatio) / 2) * 100, 25, `전체 기간 조합 중 ${round(horizonCoverageRatio * 100, 1)}% 계산 가능`),
    scoreComponent("agreement", "교차 신호 일치", agreementEvidenceScore, 25, `${knownRiskSignals.length}/${eligibleRiskIds.length}개 확인 · ${riskSignals.length}개 방향 신호`),
    scoreComponent("freshness", "자료 최신성", freshnessScore, 15, `시장별 개장 상태를 반영한 최신성 평균 ${round(freshnessScore, 1)}점`),
    scoreComponent("macro", "실물지표 뒷받침", macroCoverageRatio * 100, 10, `수출·내수 신호 ${[exportGrowth, domesticGrowth].filter(finite).length}/2개 확인`)
  ];
  const confidenceScore = Math.round(confidenceComponents.reduce((sum, item) => sum + item.points, 0));
  const dataQualityComponents = [
    scoreComponent("availability", "시장값 수집", availableRatio * 100, 40, `${round(availableRatio * 100, 1)}% 사용 가능`),
    scoreComponent("samples", "표본 수", enoughSamplesRatio * 100, 20, `20개 이상 표본 ${round(enoughSamplesRatio * 100, 1)}%`),
    scoreComponent("horizons", "기간 범위", horizonCoverageRatio * 100, 20, `1일~1년 기간 계산 ${round(horizonCoverageRatio * 100, 1)}%`),
    scoreComponent("freshness", "기준시각", freshnessScore, 20, `휴장 여부를 반영한 평균 ${round(freshnessScore, 1)}점`)
  ];
  const dataQualityScore = Math.round(dataQualityComponents.reduce((sum, item) => sum + item.points, 0));
  const equityIds = ["kospi", "kosdaq", "sp500", "nasdaq"];
  const positiveEquities = equityIds.filter((id) => Number(oneDayChanges[id]) > 0).length;
  const knownEquities = equityIds.filter((id) => finite(oneDayChanges[id])).length;
  const signals = {
    riskScore: finite(riskScore) ? Number(riskScore) : null,
    riskDirection: dominantSign,
    equityBreadth: knownEquities ? positiveEquities / knownEquities : null,
    vix: finite(markets.find((market) => market.id === "vix")?.value) ? Number(markets.find((market) => market.id === "vix").value) : null,
    wtiChange: oneDayChanges.wti,
    fxChange: oneDayChanges.usdkrw,
    nasdaqChange: oneDayChanges.nasdaq,
    kospiChange: oneDayChanges.kospi,
    exportGrowth,
    domesticGrowth
  };
  const effectiveObservationHistory = observationHistory.length
    ? observationHistory
    : deriveRegimeObservationHistory(markets, macro);
  const regimes = evaluateEconomicRegimes(signals, effectiveObservationHistory);
  const confirmed = regimes.filter((regime) => regime.status === "confirmed");
  const candidates = regimes.filter((regime) => regime.status === "candidate");
  const marketSignals = Object.entries(oneDayChanges)
    .map(([id, change]) => buildMarketSignal(id, change, marketStatistics[id]))
    .filter(Boolean)
    .sort((left, right) => right.severity - left.severity);
  const adverseDrivers = marketSignals.filter((signal) => signal.riskDirection === "adverse").slice(0, 3);
  const favorableDrivers = marketSignals.filter((signal) => signal.riskDirection === "favorable").slice(0, 3);
  const marketsWithAnalogs = Object.values(marketStatistics)
    .filter((statistics) => statistics.analogs?.status === "available").length;
  const incompleteHorizons = horizonSummary.filter((item) => item.availableCount < item.totalCount);
  const limitations = [
    incompleteHorizons.length
      ? `기간별 확보 범위가 달라 ${incompleteHorizons.map((item) => `${item.label} ${item.availableCount}/${item.totalCount}개`).join(" · ")} 시장만 계산 가능`
      : `${markets.length}개 시장의 1일·5일·20일·3개월·1년 변화가 모두 계산 가능`,
    marketsWithAnalogs
      ? `과거 유사구간은 ${marketsWithAnalogs}개 시장에서 가격 모양만 비교하며 당시 경제 원인이 같다는 뜻이 아님`
      : "과거 유사구간은 충분한 장기 시계열이 없어 표시하지 않음",
    "경제 국면은 같은 규칙이 3회 연속 관측되기 전까지 확정하지 않음",
    "위험도·분석 확실도·데이터 품질은 서로 다른 값"
  ];

  return {
    methodologyVersion: "2.0",
    horizons: ANALYSIS_HORIZONS,
    horizonSummary,
    markets: marketStatistics,
    directionAgreement: {
      rate: round(agreementRate === null ? null : agreementRate * 100, 1),
      dominant: dominantSign > 0 ? "위험 확대" : dominantSign < 0 ? "위험 완화" : riskSignals.length ? "혼조" : "판단 자료 부족",
      knownSignalCount: knownRiskSignals.length,
      activeSignalCount: riskSignals.length,
      totalEligibleCount: eligibleRiskIds.length,
      coverageRate: round(signalCoverageRate * 100, 1),
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
      label: confidenceScore >= 75 ? "높음" : confidenceScore >= 50 ? "보통" : "낮음",
      components: confidenceComponents
    },
    dataQuality: {
      score: dataQualityScore,
      label: dataQualityScore >= 80 ? "양호" : dataQualityScore >= 55 ? "주의" : "부족",
      ageMinutes: round(ageMinutes, 1),
      availableRatio: round(availableRatio * 100, 1),
      sufficientSampleRatio: round(enoughSamplesRatio * 100, 1),
      horizonCoverageRatio: round(horizonCoverageRatio * 100, 1),
      freshnessScore: round(freshnessScore, 1),
      markets: freshnessByMarket,
      components: dataQualityComponents
    },
    drivers: {
      adverse: adverseDrivers,
      favorable: favorableDrivers,
      counter: dominantSign > 0 ? favorableDrivers.slice(0, 2) : dominantSign < 0 ? adverseDrivers.slice(0, 2) : marketSignals.slice(0, 2),
      methodology: "1일 변동의 위험 방향·크기와 5일 또는 20일 흐름을 함께 정렬한 영향 신호"
    },
    regimes,
    regimeObservationBasis: {
      required: 3,
      interval: "시장 시계열의 연속 관측",
      historyCount: effectiveObservationHistory.length
    },
    currentRegime:
      confirmed[0]?.label ||
      (candidates[0] ? `확정 전: ${candidates[0].label} (${candidates[0].consecutiveObservations}/3)` : "판단 자료 부족"),
    limitations
  };
}
