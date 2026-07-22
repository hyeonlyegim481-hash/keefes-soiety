import test from "node:test";
import assert from "node:assert/strict";

import { climateBusinessFramework } from "./climate-business-data.js";

test("climate business framework covers mitigation, adaptation, and recovery", () => {
  const phaseIds = new Set(climateBusinessFramework.opportunities.map((item) => item.phase));
  assert.deepEqual([...phaseIds].sort(), ["adaptation", "mitigation", "recovery"]);
  assert.ok(climateBusinessFramework.opportunities.length >= 8);
});

test("every climate opportunity explains the business and its risks", () => {
  for (const opportunity of climateBusinessFramework.opportunities) {
    assert.ok(opportunity.title);
    assert.ok(opportunity.plain);
    assert.ok(opportunity.buyers);
    assert.ok(opportunity.revenueModel);
    assert.ok(opportunity.demandTrigger);
    assert.ok(opportunity.moat);
    assert.ok(opportunity.kpis.length >= 3);
    assert.ok(opportunity.risks.length >= 3);
    assert.ok(opportunity.korea);
    assert.ok(opportunity.firstStep);
  }
});
