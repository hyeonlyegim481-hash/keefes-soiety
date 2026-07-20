import test from "node:test";
import assert from "node:assert/strict";

import { indicatorDefinitions as baseIndicatorDefinitions } from "./indicator-data.js";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js";
import { indicatorSnapshot } from "./indicator-values.js";

test("adds twenty sourced indicators for a 58-indicator WDI collection", () => {
  const allDefinitions = [
    ...baseIndicatorDefinitions,
    ...financeIndicatorDefinitions,
    ...expandedIndicatorDefinitions
  ];

  assert.equal(expandedIndicatorDefinitions.length, 20);
  assert.equal(allDefinitions.length, 58);
  assert.equal(new Set(allDefinitions.map((item) => item.id)).size, allDefinitions.length);
  assert.equal(new Set(allDefinitions.map((item) => item.code)).size, allDefinitions.length);
});

test("keeps every expanded indicator explanation-ready", () => {
  for (const indicator of expandedIndicatorDefinitions) {
    assert.match(indicator.sourceUrl, /^https:\/\/data\.worldbank\.org\/indicator\//);
    assert.ok(indicator.description.length >= 35, `${indicator.id} description is too short`);
    assert.ok(indicator.reading.length >= 35, `${indicator.id} reading is too short`);
    assert.ok(indicator.caution.length >= 35, `${indicator.id} caution is too short`);
  }
});

test("provides Korea trends and international comparisons for every new indicator", () => {
  for (const indicator of expandedIndicatorDefinitions) {
    const data = indicatorSnapshot.indicators[indicator.id];
    assert.ok(data, `missing ${indicator.id}`);
    assert.ok(data.countries.KOR, `missing Korea for ${indicator.id}`);
    assert.ok(data.koreaTrend.length >= 2, `too little history for ${indicator.id}`);
    assert.ok(
      Object.values(data.countries).filter(Boolean).length >= 4,
      `too few country observations for ${indicator.id}`
    );
    assert.ok(data.koreaTrend.every((point) => Number.isFinite(point.value)));
  }
});
