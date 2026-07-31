import test from "node:test";
import assert from "node:assert/strict";
import {
  climateScenarios,
  futureMilestones,
  futureOutlookMeta,
  humanityRisks,
  outlookSources,
  policyTemperaturePaths
} from "./future-outlook-data.js";

test("future outlook separates observations, projections, and scenarios", () => {
  assert.equal(futureOutlookMeta.updatedAt, "2026-07-27");
  assert.equal(policyTemperaturePaths.length, 3);
  assert.equal(climateScenarios.length, 3);

  for (const scenario of climateScenarios) {
    assert.equal(scenario.temperatures.length, 3);
    assert.ok(scenario.temperatures.every((point) =>
      point.min <= point.best && point.best <= point.max
    ));
    assert.ok(scenario.seaLevel2100.min < scenario.seaLevel2100.max);
  }

  assert.equal(climateScenarios.find((item) => item.id === "low").temperatures.at(-1).best, 1.4);
  assert.equal(climateScenarios.find((item) => item.id === "middle").temperatures.at(-1).best, 2.7);
  assert.equal(climateScenarios.find((item) => item.id === "high").temperatures.at(-1).best, 4.4);
});

test("humanity risk board has thirteen complete, sourced domains", () => {
  assert.equal(humanityRisks.length, 13);
  const sourceIds = new Set(outlookSources.map((source) => source.id));
  const riskIds = new Set();

  for (const risk of humanityRisks) {
    assert.ok(!riskIds.has(risk.id), risk.id);
    riskIds.add(risk.id);
    assert.ok(risk.plain.length >= 55);
    assert.equal(risk.chain.length, 4);
    assert.equal(risk.signals.length, 3);
    assert.ok(risk.current.kind);
    assert.ok(risk.outlook.kind);
    assert.ok(risk.current.note);
    assert.ok(risk.outlook.note);
    assert.ok(risk.limits.length >= 35);
    assert.ok(risk.sourceIds.length >= 1);
    assert.ok(risk.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
  }
});

test("all outlook sources and timeline milestones expose their basis", () => {
  assert.ok(outlookSources.length >= 16);
  for (const source of outlookSources) {
    assert.match(source.url, /^https:\/\//);
    assert.match(source.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(source.basis.length >= 15);
  }

  assert.equal(futureMilestones.length, 6);
  assert.deepEqual(futureMilestones.map((item) => item.period), [
    "2030",
    "2035",
    "2040",
    "2050",
    "2080s",
    "2100"
  ]);
  assert.ok(futureMilestones.every((item) => item.facts.length === 3));
});
