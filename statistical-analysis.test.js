import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStatisticalRuleAnalysis,
  calculateSeriesStatistics,
  evaluateEconomicRegimes
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
