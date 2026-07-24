import test from "node:test";
import assert from "node:assert/strict";
import {
  economicLabControls,
  economicLabPresets,
  evaluateEconomicScenario
} from "./economic-lab-data.js";

test("economic lab exposes six bounded controls and four complete presets", () => {
  assert.equal(economicLabControls.length, 6);
  assert.equal(economicLabPresets.length, 4);
  economicLabControls.forEach((control) => {
    assert.ok(control.min < 0);
    assert.ok(control.max > 0);
    assert.ok(control.step > 0);
    assert.ok(control.description.length >= 25);
  });
  economicLabPresets.forEach((preset) => {
    assert.equal(Object.keys(preset.values).length, 6);
    assert.ok(preset.description.length >= 25);
  });
});

test("neutral inputs produce a neutral baseline", () => {
  const evaluation = evaluateEconomicScenario();
  assert.equal(evaluation.isNeutral, true);
  assert.equal(evaluation.activeDrivers.length, 0);
  assert.ok(evaluation.results.every((result) => result.score === 0));
});

test("a rate increase applies the expected basic transmission directions", () => {
  const evaluation = evaluateEconomicScenario({ rate: 1.5 });
  const byId = Object.fromEntries(evaluation.results.map((result) => [result.id, result]));
  assert.ok(byId.growth.score < 0);
  assert.ok(byId.inflation.score < 0);
  assert.ok(byId.household.score < 0);
  assert.ok(byId.bonds.score < 0);
  assert.ok(byId.housing.score < 0);
});

test("won weakness and an oil shock raise costs without claiming certainty", () => {
  const evaluation = evaluateEconomicScenario({ fx: 12, oil: 35 });
  const byId = Object.fromEntries(evaluation.results.map((result) => [result.id, result]));
  assert.ok(byId.inflation.score > 0);
  assert.ok(byId.household.score < 0);
  assert.ok(byId.importers.score < 0);
  assert.ok(byId.inflation.contributions.length >= 2);
});

test("every output is bounded and explains its drivers, timing, and indicators", () => {
  economicLabPresets.forEach((preset) => {
    const evaluation = evaluateEconomicScenario(preset.values);
    assert.equal(evaluation.results.length, 9);
    evaluation.results.forEach((result) => {
      assert.ok(result.score >= -100 && result.score <= 100);
      assert.ok(result.labelText.length >= 4);
      assert.ok(result.explanation.length >= 40);
      assert.ok(result.timing.length >= 6);
      assert.ok(result.indicators.length >= 4);
      assert.ok(result.contributions.length >= 1);
    });
  });
});
