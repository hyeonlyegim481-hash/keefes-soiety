import test from "node:test";
import assert from "node:assert/strict";
import {
  filterOutlookRisks,
  getScenarioRangeStyle,
  normalizeCategoryId,
  normalizeScenarioId
} from "./future-outlook-ui.js";

test("future outlook filters risk domains without losing the full board", () => {
  assert.equal(filterOutlookRisks("all").length, 8);
  assert.equal(filterOutlookRisks("climate").length, 2);
  assert.equal(filterOutlookRisks("essentials").length, 3);
  assert.equal(filterOutlookRisks("society").length, 2);
  assert.equal(filterOutlookRisks("systems").length, 1);
  assert.equal(normalizeCategoryId("missing"), "all");
});

test("scenario helpers choose a safe default and bounded chart positions", () => {
  assert.equal(normalizeScenarioId("high"), "high");
  assert.equal(normalizeScenarioId("unknown"), "middle");
  assert.deepEqual(getScenarioRangeStyle({ min: 1.2, best: 1.5, max: 1.8 }), {
    start: 20,
    width: 10,
    best: 25
  });
  assert.deepEqual(getScenarioRangeStyle({ min: -2, best: 8, max: 9 }), {
    start: 0,
    width: 100,
    best: 100
  });
});
