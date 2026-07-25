import test from "node:test";
import assert from "node:assert/strict";
import {
  economicLabControls,
  economicLabPresets,
  evaluateEconomicScenario
} from "./economic-lab-data.js";

test("economic lab exposes nine aligned controls and fifteen complete presets", () => {
  assert.equal(economicLabControls.length, 9);
  assert.equal(economicLabPresets.length, 15);
  economicLabControls.forEach((control) => {
    assert.ok(control.min < 0);
    assert.ok(control.max > 0);
    assert.ok(control.step > 0);
    assert.equal(Math.abs(control.min), control.max);
    assert.ok(control.description.length >= 25);
  });
  economicLabPresets.forEach((preset) => {
    assert.equal(Object.keys(preset.values).length, 9);
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

test("global rates, debt burden, and confidence use distinct transmission paths", () => {
  const evaluation = evaluateEconomicScenario({
    globalRate: 1.25,
    debt: 1.5,
    confidence: -12
  });
  const byId = Object.fromEntries(evaluation.results.map((result) => [result.id, result]));
  assert.ok(byId.credit.score < 0);
  assert.ok(byId.housing.score < 0);
  assert.ok(byId.domesticBusiness.score < 0);
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
    assert.equal(evaluation.results.length, 12);
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

test("small effects contribute to the score even when their labels stay hidden", () => {
  const evaluation = evaluateEconomicScenario({
    rate: 0.1,
    fx: 1,
    oil: 1,
    exports: 0.5,
    fiscal: 0.1,
    productivity: 0.1
  });
  const growth = evaluation.results.find((result) => result.id === "growth");

  assert.equal(growth.score, 1);
  assert.equal(growth.rawScore, 1);
  assert.equal(growth.contributions.length, 0);
});

test("economic lab discloses score bounds and whether a result was capped", () => {
  const evaluation = evaluateEconomicScenario({
    rate: -2,
    fx: -15,
    oil: -40,
    exports: 20,
    fiscal: 2,
    productivity: 4
  });

  assert.equal(evaluation.methodology.scoreMinimum, -100);
  assert.equal(evaluation.methodology.scoreMaximum, 100);
  assert.ok(
    evaluation.results.some(
      (result) => result.wasCapped && Math.abs(result.score) === 100
    )
  );
});