import test from "node:test";
import assert from "node:assert/strict";
import {
  MARKET_CONFIG,
  buildMarketRecord,
  calculateMarketChange,
  computeMarketChartScale,
  resolvePreviousCloseInfo,
  sanitizeMarketSeries
} from "./market-data.js";

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const now = Date.UTC(2026, 6, 27, 6, 0, 0);

function unix(iso) {
  return Date.parse(iso) / 1000;
}

test("sorts market points and keeps only the latest duplicate timestamp", () => {
  const result = sanitizeMarketSeries(
    [unix("2026-07-27T03:00:00Z"), unix("2026-07-27T01:00:00Z"), unix("2026-07-27T03:00:00Z")],
    [103, 101, 104]
  );
  assert.deepEqual(result.series.map((point) => point.value), [101, 104]);
  assert.equal(result.quality.duplicatePointCount, 1);
  assert.equal(result.startAt, "2026-07-27T01:00:00.000Z");
  assert.equal(result.endAt, "2026-07-27T03:00:00.000Z");
  assert.equal(result.inferredIntervalMinutes, 120);
});

test("distinguishes an actual zero from missing and invalid values", () => {
  const timestamps = [1, 2, 3, 4, 5, 6];
  const closes = [0, null, "", Number.NaN, Number.POSITIVE_INFINITY, -1];
  const allowed = sanitizeMarketSeries(timestamps, closes, { allowZero: true });
  const disallowed = sanitizeMarketSeries(timestamps, closes, { allowZero: false });
  assert.deepEqual(allowed.series.map((point) => point.value), [0]);
  assert.equal(disallowed.series.length, 0);
  assert.equal(disallowed.quality.nonPositivePointCount, 2);
  assert.equal(disallowed.quality.invalidPointCount, 4);
});

test("removes an invalid last zero for positive-only market prices", () => {
  const result = sanitizeMarketSeries([1, 2, 3], [100, 101, 0], {
    allowZero: false
  });
  assert.deepEqual(result.series.map((point) => point.value), [100, 101]);
  assert.equal(result.endAt, "1970-01-01T00:00:02.000Z");
});

test("removes isolated and endpoint price spikes beyond configured limits", () => {
  const isolated = sanitizeMarketSeries([1, 2, 3], [100, 1000, 101], {
    maxIsolatedChangePercent: 20
  });
  const endpoint = sanitizeMarketSeries([1, 2, 3], [100, 101, 1000], {
    maxEndpointChangePercent: 50
  });
  assert.deepEqual(isolated.series.map((point) => point.value), [100, 101]);
  assert.deepEqual(endpoint.series.map((point) => point.value), [100, 101]);
  assert.equal(isolated.quality.outlierPointCount, 1);
  assert.equal(endpoint.quality.outlierPointCount, 1);
});

test("does not calculate a change when the previous close is missing", () => {
  const baseline = resolvePreviousCloseInfo(
    {},
    [{ time: "2026-07-27T05:00:00.000Z", value: 100 }],
    { time: "2026-07-27T06:00:00.000Z", value: 101 }
  );
  const movement = calculateMarketChange(101, baseline);
  assert.equal(baseline.available, false);
  assert.equal(movement.available, false);
  assert.equal(movement.change, null);
  assert.equal(movement.changePercent, null);
});

test("rejects a previous session that is too old", () => {
  const baseline = resolvePreviousCloseInfo(
    { previousClose: 100, exchangeTimezoneName: "UTC" },
    [
      { time: new Date(now - 12 * day).toISOString(), value: 100 },
      { time: new Date(now).toISOString(), value: 101 }
    ],
    { time: new Date(now).toISOString(), value: 101 }
  );
  assert.equal(baseline.available, false);
  assert.equal(baseline.reason, "previous-close-too-old");
});

test("rejects an implausible daily change instead of emitting Infinity or a fake value", () => {
  const baseline = resolvePreviousCloseInfo(
    { previousClose: 100, exchangeTimezoneName: "UTC" },
    [
      { time: new Date(now - day).toISOString(), value: 100 },
      { time: new Date(now).toISOString(), value: 1000 }
    ],
    { time: new Date(now).toISOString(), value: 1000 },
    { maxDailyChangePercent: 50 }
  );
  const movement = calculateMarketChange(1000, baseline, {
    maxDailyChangePercent: 50
  });
  assert.equal(baseline.available, false);
  assert.equal(baseline.reason, "abnormal-daily-change");
  assert.equal(movement.changePercent, null);
});

test("builds a complete market record with timing, source and interval metadata", () => {
  const item = MARKET_CONFIG.find((market) => market.id === "kospi");
  const record = buildMarketRecord({
    item,
    now,
    fetchedAt: new Date(now + 1_000).toISOString(),
    timestamps: [
      (now - day) / 1000,
      (now - hour) / 1000,
      now / 1000
    ],
    closes: [100, 102, 103],
    meta: {
      regularMarketPrice: 103,
      regularMarketTime: now / 1000,
      previousClose: 100,
      exchangeTimezoneName: "Asia/Seoul",
      exchangeDataDelayedBy: 0,
      currency: "KRW",
      currentTradingPeriod: {
        regular: {
          start: (now - 2 * hour) / 1000,
          end: (now + hour) / 1000
        }
      }
    }
  });
  assert.equal(record.value, 103);
  assert.equal(record.previousClose, 100);
  assert.equal(record.change, 3);
  assert.equal(record.changePercent, 3);
  assert.equal(record.changeAvailable, true);
  assert.equal(record.marketStateLabel, "장중");
  assert.equal(record.timezone, "Asia/Seoul");
  assert.equal(record.instrumentType, "index");
  assert.equal(record.source, "Yahoo Finance chart endpoint");
  assert.equal(record.seriesMeta.interval, "1h");
  assert.equal(record.seriesMeta.pointCount, 3);
});

test("identifies WTI and Gold as futures with explicit contract units", () => {
  const wti = MARKET_CONFIG.find((market) => market.id === "wti");
  const gold = MARKET_CONFIG.find((market) => market.id === "gold");
  assert.equal(wti.instrumentType, "futures");
  assert.match(wti.instrumentLabel, /선물/);
  assert.equal(wti.displayUnit, "미국달러/배럴");
  assert.equal(gold.instrumentType, "futures");
  assert.match(gold.instrumentLabel, /선물/);
  assert.equal(gold.displayUnit, "미국달러/트로이온스");
});

test("uses a minimum chart range so tiny moves are not visually exaggerated", () => {
  const scale = computeMarketChartScale([100, 100.1, 100.2], {
    minimumChartRangePercent: 2
  });
  assert.equal(scale.minimumRangeApplied, true);
  assert.ok(scale.range >= 2);
  assert.ok(scale.min < 100);
  assert.ok(scale.max > 100.2);
});

test("falls back to UTC when a provider returns an invalid timezone", () => {
  const item = {
    ...MARKET_CONFIG[0],
    fallbackTimezone: "Not/A-Timezone"
  };
  const record = buildMarketRecord({
    item,
    now,
    timestamps: [(now - day) / 1000, now / 1000],
    closes: [100, 101],
    meta: {
      regularMarketPrice: 101,
      regularMarketTime: now / 1000,
      previousClose: 100,
      exchangeTimezoneName: "Invalid/Timezone"
    }
  });
  assert.equal(record.tradingDate, "2026-07-27");
});
