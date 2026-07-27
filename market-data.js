export const MARKET_CONFIG = Object.freeze([
  market({
    id: "kospi",
    name: "KOSPI",
    symbol: "^KS11",
    group: "korea",
    unit: "pt",
    displayUnit: "포인트",
    instrumentType: "index",
    instrumentLabel: "한국 주가지수",
    fallbackTimezone: "Asia/Seoul",
    maxIsolatedChangePercent: 18,
    maxDailyChangePercent: 30,
    minimumChartRangePercent: 2
  }),
  market({
    id: "kosdaq",
    name: "KOSDAQ",
    symbol: "^KQ11",
    group: "korea",
    unit: "pt",
    displayUnit: "포인트",
    instrumentType: "index",
    instrumentLabel: "한국 주가지수",
    fallbackTimezone: "Asia/Seoul",
    maxIsolatedChangePercent: 22,
    maxDailyChangePercent: 35,
    minimumChartRangePercent: 2.5
  }),
  market({
    id: "usdkrw",
    name: "USD/KRW",
    symbol: "USDKRW=X",
    group: "korea",
    unit: "KRW",
    displayUnit: "1달러당 원",
    instrumentType: "spot-fx",
    instrumentLabel: "현물 환율",
    quoteDirection: "USD 1달러당 원화(KRW)",
    fallbackTimezone: "UTC",
    maxIsolatedChangePercent: 6,
    maxDailyChangePercent: 15,
    minimumChartRangePercent: 1
  }),
  market({
    id: "sp500",
    name: "S&P 500",
    symbol: "^GSPC",
    group: "global",
    unit: "pt",
    displayUnit: "포인트",
    instrumentType: "index",
    instrumentLabel: "미국 주가지수",
    fallbackTimezone: "America/New_York",
    maxIsolatedChangePercent: 15,
    maxDailyChangePercent: 30,
    minimumChartRangePercent: 2
  }),
  market({
    id: "nasdaq",
    name: "NASDAQ",
    symbol: "^IXIC",
    group: "global",
    unit: "pt",
    displayUnit: "포인트",
    instrumentType: "index",
    instrumentLabel: "미국 주가지수",
    fallbackTimezone: "America/New_York",
    maxIsolatedChangePercent: 18,
    maxDailyChangePercent: 35,
    minimumChartRangePercent: 2.5
  }),
  market({
    id: "vix",
    name: "VIX",
    symbol: "^VIX",
    group: "global",
    unit: "idx",
    displayUnit: "지수",
    instrumentType: "index",
    instrumentLabel: "변동성 지수",
    fallbackTimezone: "America/New_York",
    maxIsolatedChangePercent: 70,
    maxDailyChangePercent: 150,
    minimumChartRangePercent: 12
  }),
  market({
    id: "wti",
    name: "WTI 선물",
    symbol: "CL=F",
    group: "global",
    unit: "USD/bbl",
    displayUnit: "미국달러/배럴",
    instrumentType: "futures",
    instrumentLabel: "WTI 최근월물 연속 선물",
    fallbackTimezone: "America/New_York",
    maxIsolatedChangePercent: 28,
    maxDailyChangePercent: 65,
    minimumChartRangePercent: 4
  }),
  market({
    id: "gold",
    name: "Gold 선물",
    symbol: "GC=F",
    group: "global",
    unit: "USD/oz",
    displayUnit: "미국달러/트로이온스",
    instrumentType: "futures",
    instrumentLabel: "금 최근월물 연속 선물",
    fallbackTimezone: "America/New_York",
    maxIsolatedChangePercent: 12,
    maxDailyChangePercent: 25,
    minimumChartRangePercent: 2
  })
]);

export const MARKET_CHART_PERIODS = Object.freeze([
  Object.freeze({ id: "1m", label: "1개월", days: 31 }),
  Object.freeze({ id: "3m", label: "3개월", days: 93 }),
  Object.freeze({ id: "6m", label: "6개월", days: 186 }),
  Object.freeze({ id: "1y", label: "1년", days: 366 })
]);

export function filterMarketSeriesByPeriod(series = [], periodId = "1y") {
  const period = MARKET_CHART_PERIODS.find((item) => item.id === periodId)
    || MARKET_CHART_PERIODS.at(-1);
  const normalized = series
    .map((point) => ({
      point,
      timestamp: point?.time instanceof Date
        ? point.time.getTime()
        : Date.parse(point?.time)
    }))
    .filter(({ point, timestamp }) => Number.isFinite(timestamp) && Number.isFinite(Number(point?.value)))
    .sort((left, right) => left.timestamp - right.timestamp);
  if (normalized.length < 2) return normalized.map(({ point }) => point);

  const endAt = normalized.at(-1).timestamp;
  const threshold = endAt - period.days * 24 * 60 * 60 * 1000;
  const filtered = normalized.filter(({ timestamp }) => timestamp >= threshold);
  const selected = filtered.length >= 2 ? filtered : normalized.slice(-2);
  return selected.map(({ point }) => point);
}

export function sanitizeMarketSeries(
  timestamps = [],
  closes = [],
  options = {}
) {
  const {
    allowZero = true,
    maxIsolatedChangePercent = Number.POSITIVE_INFINITY,
    maxEndpointChangePercent = Number.POSITIVE_INFINITY
  } = options;
  const byTimestamp = new Map();
  const quality = {
    inputPointCount: Math.max(timestamps.length, closes.length),
    invalidPointCount: 0,
    duplicatePointCount: 0,
    nonPositivePointCount: 0,
    outlierPointCount: 0
  };

  for (let index = 0; index < quality.inputPointCount; index += 1) {
    const timestamp = Number(timestamps[index]);
    const rawValue = closes[index];
    if (
      !Number.isFinite(timestamp) ||
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ""
    ) {
      quality.invalidPointCount += 1;
      continue;
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      quality.invalidPointCount += 1;
      continue;
    }
    if (value < 0 || (!allowZero && value === 0)) {
      quality.nonPositivePointCount += 1;
      continue;
    }
    if (byTimestamp.has(timestamp)) quality.duplicatePointCount += 1;
    byTimestamp.set(timestamp, {
      time: new Date(timestamp * 1000).toISOString(),
      value
    });
  }

  const sorted = [...byTimestamp.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, point]) => point);
  const isolatedFiltered = removeIsolatedOutliers(
    sorted,
    maxIsolatedChangePercent,
    quality
  );
  const series = removeInvalidEndpointSpike(
    isolatedFiltered,
    maxEndpointChangePercent,
    quality
  );
  const intervals = series
    .slice(1)
    .map((point, index) =>
      (Date.parse(point.time) - Date.parse(series[index].time)) / 60_000
    )
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  return {
    series,
    quality: {
      ...quality,
      outputPointCount: series.length
    },
    startAt: series[0]?.time || null,
    endAt: series.at(-1)?.time || null,
    inferredIntervalMinutes: median(intervals)
  };
}

export function normalizeMarketSeries(timestamps = [], closes = [], options = {}) {
  return sanitizeMarketSeries(timestamps, closes, options).series;
}

export function getRegularTradingPeriod(meta = {}) {
  const regular = meta?.currentTradingPeriod?.regular;
  const start = Number(regular?.start) * 1000;
  const end = Number(regular?.end) * 1000;
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? { start, end }
    : null;
}

export function isRegularMarketOpen(meta = {}, now = Date.now()) {
  const period = getRegularTradingPeriod(meta);
  if (!period) return null;
  return now >= period.start && now < period.end;
}

export function resolveMarketPoint(meta = {}, series = [], now = Date.now()) {
  const lastPoint = series.at(-1);
  const marketOpen = isRegularMarketOpen(meta, now);
  const metaValue = Number(meta?.regularMarketPrice);
  const metaTime = Number(meta?.regularMarketTime);
  const metaPoint = {
    value: metaValue,
    time: Number.isFinite(metaTime)
      ? new Date(metaTime * 1000).toISOString()
      : ""
  };
  const hasMetaPoint =
    Number.isFinite(metaPoint.value) &&
    metaPoint.value > 0 &&
    Number.isFinite(Date.parse(metaPoint.time));

  if (marketOpen !== false && hasMetaPoint) {
    return { ...metaPoint, marketOpen };
  }
  return {
    value: lastPoint?.value,
    time: lastPoint?.time || metaPoint.time,
    marketOpen
  };
}

export function resolvePreviousCloseInfo(
  meta = {},
  series = [],
  currentPoint = {},
  options = {}
) {
  const timezone =
    meta?.exchangeTimezoneName || options.fallbackTimezone || "UTC";
  const current = Number(currentPoint?.value);
  const currentTime = Date.parse(currentPoint?.time);

  if (!Number.isFinite(current) || !Number.isFinite(currentTime)) {
    return unavailableBaseline("current-point-invalid");
  }

  const currentTradeDate = getDateKey(currentPoint.time, timezone);
  const priorSessionPoint = [...series]
    .filter(
      (point) =>
        Number.isFinite(Date.parse(point.time)) &&
        Date.parse(point.time) < currentTime &&
        getDateKey(point.time, timezone) !== currentTradeDate
    )
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time))
    .at(-1);
  const value = Number(priorSessionPoint?.value);
  if (!priorSessionPoint || !Number.isFinite(value) || value <= 0) {
    return unavailableBaseline("previous-close-missing");
  }

  const source = "series-previous-session";
  const previousCloseAsOf = priorSessionPoint?.time || null;
  const previousTradingDate = previousCloseAsOf
    ? getDateKey(previousCloseAsOf, timezone)
    : null;

  if (
    previousCloseAsOf &&
    currentTime - Date.parse(previousCloseAsOf) > 10 * 24 * 60 * 60 * 1000
  ) {
    return unavailableBaseline("previous-close-too-old", {
      source,
      previousCloseAsOf,
      previousTradingDate
    });
  }

  const changePercent = ((current - value) / value) * 100;
  const maximum = Number(options.maxDailyChangePercent);
  if (
    Number.isFinite(maximum) &&
    Number.isFinite(changePercent) &&
    Math.abs(changePercent) > maximum
  ) {
    return unavailableBaseline("abnormal-daily-change", {
      source,
      previousCloseAsOf,
      previousTradingDate
    });
  }

  return {
    available: true,
    value,
    source,
    previousCloseAsOf,
    previousTradingDate,
    reason: null
  };
}

export function resolvePreviousClose(meta = {}, series = [], current = 0) {
  const result = resolvePreviousCloseInfo(
    meta,
    series,
    {
      value: current,
      time:
        series.at(-1)?.time ||
        (
          Number.isFinite(Number(meta?.regularMarketTime))
            ? new Date(Number(meta.regularMarketTime) * 1000).toISOString()
            : ""
        )
    }
  );
  if (result.available) return result.value;

  // Legacy test/helper calls may omit timestamps. Production records use
  // resolvePreviousCloseInfo directly and never take this compatibility path.
  if (result.reason === "current-point-invalid") {
    const direct = [meta?.previousClose]
      .map(Number)
      .find((value) => Number.isFinite(value) && value > 0);
    return direct ?? null;
  }
  return null;
}

export function calculateMarketChange(
  current,
  previousClose,
  options = {}
) {
  const value = Number(current);
  const baseline = Number(
    typeof previousClose === "object" ? previousClose?.value : previousClose
  );
  const baselineAvailable =
    typeof previousClose === "object"
      ? previousClose?.available === true
      : Number.isFinite(baseline) && baseline > 0;

  if (
    !Number.isFinite(value) ||
    !baselineAvailable ||
    !Number.isFinite(baseline) ||
    baseline <= 0
  ) {
    return {
      available: false,
      change: null,
      changePercent: null,
      direction: "unknown",
      reason:
        typeof previousClose === "object"
          ? previousClose?.reason || "previous-close-missing"
          : "previous-close-missing"
    };
  }

  const change = value - baseline;
  const changePercent = (change / baseline) * 100;
  const maximum = Number(options.maxDailyChangePercent);
  if (
    !Number.isFinite(change) ||
    !Number.isFinite(changePercent) ||
    (Number.isFinite(maximum) && Math.abs(changePercent) > maximum)
  ) {
    return {
      available: false,
      change: null,
      changePercent: null,
      direction: "unknown",
      reason: "abnormal-daily-change"
    };
  }

  return {
    available: true,
    change,
    changePercent,
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    reason: null
  };
}

export function resolveMarketStatus(meta = {}, asOf, now = Date.now()) {
  const marketOpen = isRegularMarketOpen(meta, now);
  const ageMs = now - Date.parse(asOf);
  const recent =
    Number.isFinite(ageMs) &&
    ageMs >= -5 * 60 * 1000 &&
    ageMs <= 2.5 * 60 * 60 * 1000;
  const live = marketOpen === null ? recent : marketOpen && recent;
  return {
    live,
    status: live ? "live" : marketOpen ? "stale" : "closed"
  };
}

export function buildMarketTiming(meta = {}, asOf, now = Date.now(), options = {}) {
  const status = resolveMarketStatus(meta, asOf, now);
  const timezone =
    meta?.exchangeTimezoneName || options.fallbackTimezone || null;
  const providerDelay = Number(meta?.exchangeDataDelayedBy);
  const providerDelayMinutes = Number.isFinite(providerDelay)
    ? Math.max(0, providerDelay)
    : null;
  const ageMs = now - Date.parse(asOf);
  const dataAgeMinutes = Number.isFinite(ageMs)
    ? Math.max(0, Math.round(ageMs / 60_000))
    : null;

  return {
    ...status,
    marketOpen: isRegularMarketOpen(meta, now),
    marketStateLabel:
      status.status === "live"
        ? "장중"
        : status.status === "stale"
          ? "장중 데이터 지연"
          : "장 마감",
    timezone,
    tradingDate: Number.isFinite(Date.parse(asOf))
      ? getDateKey(asOf, timezone || "UTC")
      : null,
    providerDelayMinutes,
    dataAgeMinutes,
    delayed:
      status.status === "stale"
        ? true
        : providerDelayMinutes === null
          ? null
          : providerDelayMinutes > 0
  };
}

export function buildMarketRecord({
  item,
  meta = {},
  timestamps = [],
  closes = [],
  now = Date.now(),
  fetchedAt = new Date(now).toISOString(),
  chartRange = "1y",
  chartInterval = "1d",
  maxSeriesPoints = 280
}) {
  const normalized = sanitizeMarketSeries(timestamps, closes, {
    allowZero: item.allowZero,
    maxIsolatedChangePercent: item.maxIsolatedChangePercent,
    maxEndpointChangePercent: item.maxDailyChangePercent
  });
  if (!normalized.series.length) {
    throw new Error(`No usable prices for ${item.symbol}`);
  }

  const marketPoint = resolveMarketPoint(meta, normalized.series, now);
  const fallbackPoint = normalized.series.at(-1);
  const current = isValidMarketValue(marketPoint.value, item.allowZero)
    ? Number(marketPoint.value)
    : fallbackPoint.value;
  const asOf =
    Number.isFinite(Date.parse(marketPoint.time))
      ? marketPoint.time
      : fallbackPoint.time;
  const currentPoint = { value: current, time: asOf };
  const previousCloseInfo = resolvePreviousCloseInfo(
    meta,
    normalized.series,
    currentPoint,
    item
  );
  const movement = calculateMarketChange(current, previousCloseInfo, item);
  const timing = buildMarketTiming(meta, asOf, now, item);
  const safePointLimit = Math.max(2, Math.floor(Number(maxSeriesPoints) || 280));
  const series = normalized.series.slice(-safePointLimit).map((point) => ({
    time: point.time,
    value: roundByMagnitude(point.value)
  }));

  return {
    ...item,
    value: roundByMagnitude(current),
    previousClose: previousCloseInfo.available
      ? roundByMagnitude(previousCloseInfo.value)
      : null,
    previousCloseAsOf: previousCloseInfo.previousCloseAsOf || null,
    previousTradingDate: previousCloseInfo.previousTradingDate || null,
    previousCloseSource: previousCloseInfo.source || null,
    change: movement.available ? roundByMagnitude(movement.change) : null,
    changePercent: movement.available
      ? round(movement.changePercent, 2)
      : null,
    changeAvailable: movement.available,
    changeUnavailableReason: movement.reason,
    direction: movement.direction,
    asOf,
    tradingDate: timing.tradingDate,
    marketOpen: timing.marketOpen,
    marketStateLabel: timing.marketStateLabel,
    timezone: timing.timezone,
    providerDelayMinutes: timing.providerDelayMinutes,
    dataAgeMinutes: timing.dataAgeMinutes,
    delayed: timing.delayed,
    series,
    seriesMeta: {
      startAt: series[0]?.time || null,
      endAt: series.at(-1)?.time || null,
      interval: chartInterval,
      intervalMinutes: normalized.inferredIntervalMinutes,
      pointCount: series.length,
      quality: normalized.quality
    },
    chartRange,
    chartInterval,
    chartSource: "Yahoo Finance",
    source: "Yahoo Finance chart endpoint",
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(item.symbol)}`,
    quoteCurrency: meta?.currency || item.quoteCurrency || null,
    contractName:
      item.instrumentType === "futures"
        ? meta?.shortName || meta?.longName || item.instrumentLabel
        : null,
    fetchedAt,
    live: timing.live,
    status: timing.status
  };
}

export function computeMarketChartScale(values = [], options = {}) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return null;
  const rawMin = Math.min(...finite);
  const rawMax = Math.max(...finite);
  const center = (rawMin + rawMax) / 2;
  const rawRange = rawMax - rawMin;
  const minimumRangePercent = Number(options.minimumChartRangePercent) || 2;
  const minimumRange = Math.max(
    Math.abs(center) * (minimumRangePercent / 100),
    Number.EPSILON
  );
  const visibleRange = Math.max(rawRange * 1.24, minimumRange);
  const min = center - visibleRange / 2;
  const max = center + visibleRange / 2;

  return {
    rawMin,
    rawMax,
    min,
    max,
    range: max - min,
    minimumRangeApplied: rawRange * 1.24 < minimumRange
  };
}

function market(config) {
  return Object.freeze({
    allowZero: false,
    quoteCurrency: config.unit === "KRW" ? "KRW" : "USD",
    ...config
  });
}

function removeIsolatedOutliers(points, threshold, quality) {
  if (!Number.isFinite(threshold) || points.length < 3) return points;
  return points.filter((point, index) => {
    if (index === 0 || index === points.length - 1) return true;
    const previous = points[index - 1];
    const next = points[index + 1];
    const jump = relativeChangePercent(previous.value, point.value);
    const returnToPrior = relativeChangePercent(previous.value, next.value);
    const isolated = jump > threshold && returnToPrior <= threshold;
    if (isolated) quality.outlierPointCount += 1;
    return !isolated;
  });
}

function removeInvalidEndpointSpike(points, threshold, quality) {
  if (!Number.isFinite(threshold) || points.length < 2) return points;
  const previous = points.at(-2);
  const latest = points.at(-1);
  if (relativeChangePercent(previous.value, latest.value) <= threshold) {
    return points;
  }
  quality.outlierPointCount += 1;
  return points.slice(0, -1);
}

function relativeChangePercent(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(((to - from) / from) * 100);
}

function unavailableBaseline(reason, details = {}) {
  return {
    available: false,
    value: null,
    source: details.source || null,
    previousCloseAsOf: details.previousCloseAsOf || null,
    previousTradingDate: details.previousTradingDate || null,
    reason
  };
}

function isValidMarketValue(value, allowZero) {
  const number = Number(value);
  return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0);
}

function getDateKey(value, timezone) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const options = {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  } catch {
    parts = new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: "UTC"
    }).formatToParts(date);
  }
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function median(values) {
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2
    ? values[middle]
    : (values[middle - 1] + values[middle]) / 2;
}

function round(value, digits = 1) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function roundByMagnitude(value) {
  const digits = Math.abs(value) > 100 ? 1 : 2;
  return round(value, digits);
}
