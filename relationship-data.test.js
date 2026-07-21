import test from "node:test";
import assert from "node:assert/strict";
import { economicRelationships } from "./relationship-data.js";

test("provides twelve detailed economic relationship scenarios", () => {
  assert.equal(economicRelationships.length, 12);
  assert.equal(new Set(economicRelationships.map((item) => item.id)).size, 12);
  assert.ok(economicRelationships.some((item) => item.id === "us-slowdown"));
  assert.ok(economicRelationships.some((item) => item.id === "china-slowdown"));
  assert.ok(economicRelationships.some((item) => item.id === "household-debt-up"));
});

test("makes every transmission step explanation-ready", () => {
  economicRelationships.forEach((scenario) => {
    assert.equal(scenario.steps.length, 5, `${scenario.id} should have five steps`);
    assert.equal(scenario.impacts.length, 4, `${scenario.id} should compare four impact areas`);
    assert.equal(scenario.watch.length, 4, `${scenario.id} should expose four checkpoints`);
    assert.ok(scenario.coreQuestion.length >= 20);
    assert.ok(scenario.koreaContext.length >= 35);
    assert.ok(scenario.strongerWhen.length >= 3);
    assert.ok(scenario.weakerWhen.length >= 3);
    scenario.steps.forEach((step) => {
      assert.ok(step.detail.length >= 30);
      assert.ok(step.mechanism.length >= 30);
      assert.ok(step.firstAffected.length >= 8);
      assert.ok(step.indicators.length >= 3);
      assert.ok(step.example.length >= 25);
    });
  });
});
