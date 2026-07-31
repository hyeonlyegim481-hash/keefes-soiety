import test from "node:test";
import assert from "node:assert/strict";

import {
  broadIndicatorCategories,
  broadIndicatorDefinitions
} from "./indicator-broad-data.js";
import { indicatorSnapshot } from "./indicator-values.js";
import {
  formatIndicatorDisplayValue
} from "./indicator-metadata.js";

test("adds 37 sourced indicators across broad economic and social fields", () => {
  assert.deepEqual(
    broadIndicatorCategories.map((category) => category.id),
    ["fiscal", "infrastructure"]
  );
  assert.equal(broadIndicatorDefinitions.length, 37);
  assert.equal(
    new Set(broadIndicatorDefinitions.map((indicator) => indicator.id)).size,
    broadIndicatorDefinitions.length
  );
  assert.equal(
    new Set(broadIndicatorDefinitions.map((indicator) => indicator.code)).size,
    broadIndicatorDefinitions.length
  );
});

test("keeps every broad indicator sourced and explanation-ready", () => {
  for (const indicator of broadIndicatorDefinitions) {
    assert.match(indicator.sourceUrl, /^https:\/\/data\.worldbank\.org\/indicator\//);
    assert.ok(indicator.description.length >= 35, `${indicator.id}: description`);
    assert.ok(indicator.reading.length >= 35, `${indicator.id}: reading`);
    assert.ok(indicator.caution.length >= 35, `${indicator.id}: caution`);
  }
});

test("provides Korea history and international observations without invented zeroes", () => {
  for (const indicator of broadIndicatorDefinitions) {
    const dataset = indicatorSnapshot.indicators[indicator.id];
    assert.ok(dataset, `${indicator.id}: missing dataset`);
    assert.ok(dataset.countries.KOR, `${indicator.id}: missing Korea`);
    assert.ok(dataset.koreaTrend.length >= 2, `${indicator.id}: too little Korea history`);
    assert.ok(
      Object.values(dataset.countries).filter(Boolean).length >= 4,
      `${indicator.id}: too few comparison countries`
    );
    assert.ok(dataset.koreaTrend.every((point) => Number.isFinite(point.value)));
  }
});

test("formats large totals compactly while keeping units explicit", () => {
  const population = broadIndicatorDefinitions.find((item) => item.id === "population-total");
  const nominalGdp = broadIndicatorDefinitions.find((item) => item.id === "nominal-gdp");
  assert.match(formatIndicatorDisplayValue(population, 51_700_000), /명$/);
  assert.match(formatIndicatorDisplayValue(nominalGdp, 1_700_000_000_000), /^US\$/);
  assert.ok(formatIndicatorDisplayValue(population, 51_700_000).length < 18);
  assert.ok(formatIndicatorDisplayValue(nominalGdp, 1_700_000_000_000).length < 18);
});
