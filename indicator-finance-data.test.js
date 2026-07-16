import test from "node:test";
import assert from "node:assert/strict";

import {
  financeIndicatorCategories,
  financeIndicatorDefinitions
} from "./indicator-finance-data.js";
import { indicatorSnapshot } from "./indicator-values.js";

test("adds ten economic indicators across finance and external sectors", () => {
  assert.deepEqual(
    financeIndicatorCategories.map((category) => category.id),
    ["finance", "external"]
  );
  assert.equal(financeIndicatorDefinitions.length, 10);
  assert.equal(new Set(financeIndicatorDefinitions.map((item) => item.id)).size, 10);
  assert.equal(new Set(financeIndicatorDefinitions.map((item) => item.code)).size, 10);
});

test("keeps every added indicator sourced and explanation-ready", () => {
  for (const indicator of financeIndicatorDefinitions) {
    assert.match(indicator.sourceUrl, /^https:\/\/data\.worldbank\.org\/indicator\//);
    assert.ok(indicator.description.length >= 30);
    assert.ok(indicator.reading.length >= 30);
    assert.ok(indicator.caution.length >= 30);
  }
});

test("provides Korea history and comparable country observations", () => {
  for (const indicator of financeIndicatorDefinitions) {
    const data = indicatorSnapshot.indicators[indicator.id];
    assert.ok(data, `missing ${indicator.id}`);
    assert.ok(data.countries.KOR);
    assert.ok(data.koreaTrend.length >= 10);
    assert.ok(
      Object.values(data.countries).filter(Boolean).length >= 4,
      `too few country observations for ${indicator.id}`
    );
    assert.ok(data.koreaTrend.every((point) => Number.isFinite(point.value)));
  }
});
