import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStatisticalRuleAnalysis,
  calculateSeriesStatistics,
  evaluateEconomicRegimes,
  findSeriesPatternAnalogs
} from "./statistical-analysis.js";

function series(days = 5, stepHours = 1, start = 100) {
  const points = [];
  const end = Date.parse("2026-07-27T10:00:00Z");
  const count = Math.floor((days * 24) / stepHours) + 1;
  for (let index = 0; index < count; index += 1) {
    points.push({
      time: new Date(end - (count - 1 - index) * stepHours * 3_600_000).toISOString(),
      value: start + index
    });
  }
  return points;
}

function dailySeries(days = 370, valueAt = (index) => 100 + index * 0.1) {
  const start = Date.parse("2025-07-20T00:00:00Z");
  return Array.from({ length: days + 1 }, (_, index) => ({
    time: new Date(start + index * 86_400_000).toISOString(),
    value: valueAt(index)
  }));
}

function pointSum(components) {
  return Math.round(components.reduce((sum, item) => sum + item.points, 0));
}

test("five-day data calculates 1d and 5d but refuses longer horizons", () => {
  const result = calculateSeriesStatistics(series());
  assert.equal(result.horizons["1d"].status, "available");
  assert.equal(result.horizons["5d"].status, "available");
  assert.equal(result.horizons["20d"].status, "insufficient");
  assert.equal(result.horizons["3m"].value, null);
  assert.equal(result.horizons["1y"].value, null);
});

test("statistics expose percentile, z-score, volatility and velocity only with support", () => {
  const result = calculateSeriesStatistics(series());
  assert.equal(typeof result.percentile, "number");
  assert.equal(typeof result.zScore, "number");
  assert.equal(typeof result.volatility, "number");
  assert.equal(typeof result.velocity, "number");
  const empty = calculateSeriesStatistics([]);
  assert.equal(empty.zScore, null);
  assert.equal(empty.volatility, null);
});

test("regimes require three consecutive observations before confirmation", () => {
  const signals = {
    vix: 30,
    riskScore: 70,
    equityBreadth: 0.25,
    riskDirection: 1,
    wtiChange: 0,
    fxChange: 1,
    nasdaqChange: -2,
    kospiChange: -1,
    exportGrowth: null,
    domesticGrowth: null
  };
  const first = evaluateEconomicRegimes(signals, []);
  assert.equal(first.find((item) => item.id === "financial-stress").status, "candidate");
  const third = evaluateEconomicRegimes(signals, [
    { "financial-stress": true },
    { "financial-stress": true }
  ]);
  assert.equal(third.find((item) => item.id === "financial-stress").status, "confirmed");
  const interrupted = evaluateEconomicRegimes(signals, [
    { "financial-stress": true },
    { "financial-stress": false }
  ]);
  assert.equal(
    interrupted.find((item) => item.id === "financial-stress").consecutiveObservations,
    1
  );
});

test("market history can confirm a regime without a separate AI or fabricated value", () => {
  const ids = ["kospi", "kosdaq", "sp500", "nasdaq", "vix", "usdkrw", "wti", "gold"];
  const markets = ids.map((id, index) => ({
    id,
    name: id,
    value: id === "vix" ? 30 : 100 + index,
    asOf: "2026-07-27T10:00:00Z",
    series: series(5, 1, id === "vix" ? 30 : 100 + index).map((point) =>
      id === "vix" ? { ...point, value: 30 } : point
    )
  }));
  const result = buildStatisticalRuleAnalysis({
    markets,
    riskScore: 70,
    now: Date.parse("2026-07-27T10:05:00Z")
  });
  assert.equal(
    result.regimes.find((item) => item.id === "financial-stress").status,
    "confirmed"
  );
  assert.equal(result.regimeObservationBasis.historyCount, 2);
});

test("risk, confidence and data quality remain separate", () => {
  const ids = ["kospi", "kosdaq", "sp500", "nasdaq", "vix", "usdkrw", "wti", "gold"];
  const markets = ids.map((id, index) => ({
    id,
    name: id,
    value: 100 + index,
    asOf: "2026-07-27T10:00:00Z",
    series: series(5, 1, 100 + index)
  }));
  const result = buildStatisticalRuleAnalysis({
    markets,
    riskScore: 61,
    now: Date.parse("2026-07-27T10:05:00Z")
  });
  assert.equal(result.risk.score, 61);
  assert.equal(typeof result.confidence.score, "number");
  assert.equal(typeof result.dataQuality.score, "number");
  assert.notEqual(result.currentRegime, "");
  assert.ok(result.directionAgreement.rate >= 0);
});

test("missing signals never satisfy a regime through numeric coercion", () => {
  const result = evaluateEconomicRegimes({
    vix: null,
    riskScore: null,
    equityBreadth: null,
    riskDirection: null,
    wtiChange: -2,
    fxChange: null,
    nasdaqChange: 2,
    kospiChange: null,
    exportGrowth: null,
    domesticGrowth: null
  });
  assert.equal(result.find((item) => item.id === "disinflation").status, "inactive");
  assert.equal(result.find((item) => item.id === "rate-cut-hope").status, "inactive");
  assert.equal(result.find((item) => item.id === "recovery").status, "inactive");
});

test("one-year data exposes all horizons and removes the stale five-day limitation", () => {
  const ids = ["kospi", "kosdaq", "sp500", "nasdaq", "vix", "usdkrw", "wti", "gold"];
  const markets = ids.map((id, index) => ({
    id,
    name: id,
    value: 100 + index,
    asOf: "2026-07-25T00:00:00Z",
    marketOpen: false,
    series: dailySeries(370, (day) => 100 + index + day * 0.1)
  }));
  const result = buildStatisticalRuleAnalysis({
    markets,
    now: Date.parse("2026-07-25T01:00:00Z")
  });
  assert.ok(result.horizonSummary.every((item) => item.availableCount === markets.length));
  assert.ok(Object.values(result.markets).every((item) => item.assessment.availableHorizonCount === 5));
  assert.doesNotMatch(result.limitations.join(" "), /현재 시장 API 시계열은 5일/);
  assert.match(result.limitations[0], /모두 계산 가능/);
  const oneMarket = buildStatisticalRuleAnalysis({
    markets: [markets[0]],
    now: Date.parse("2026-07-25T01:00:00Z")
  });
  assert.match(oneMarket.limitations[0], /^1개 시장/);
  assert.doesNotMatch(oneMarket.limitations[0], /^8개 시장/);
});

test("confidence and data-quality scores disclose weighted components", () => {
  const ids = ["kospi", "kosdaq", "sp500", "nasdaq", "vix", "usdkrw", "wti", "gold"];
  const markets = ids.map((id, index) => ({
    id,
    name: id,
    value: 100 + index,
    asOf: "2026-07-25T00:00:00Z",
    marketOpen: false,
    series: dailySeries(150, (day) => 100 + index + day * 0.05)
  }));
  const result = buildStatisticalRuleAnalysis({
    markets,
    macro: [
      { label: "수출 증가율", status: "official", value: 4.2, unit: "% YoY" },
      { label: "소매판매 증가율", status: "official", value: -0.8, unit: "% YoY" }
    ],
    now: Date.parse("2026-07-25T01:00:00Z")
  });
  assert.equal(pointSum(result.confidence.components), result.confidence.score);
  assert.equal(pointSum(result.dataQuality.components), result.dataQuality.score);
  assert.equal(result.directionAgreement.totalEligibleCount, 7);
  assert.equal(result.methodologyVersion, "2.0");
});

test("pattern analogs compare price shape without claiming the same cause", () => {
  const repeated = dailySeries(300, (index) => {
    const phase = index % 60;
    return 100 + (phase <= 30 ? phase * 0.6 : (60 - phase) * 0.6);
  });
  const result = findSeriesPatternAnalogs(repeated);
  assert.equal(result.status, "available");
  assert.ok(result.matches.length >= 1);
  assert.ok(result.matches.every((item) => typeof item.subsequent20d === "number"));
  assert.match(result.methodology, /가격 변화/);
});
