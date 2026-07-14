import test from "node:test";
import assert from "node:assert/strict";
import { historyEras, historyEvents } from "./history-data.js";
import { historyDeepDives, historyEraDetails } from "./history-detail-data.js";

test("every history event has a complete deep-dive explanation", () => {
  assert.equal(Object.keys(historyDeepDives).length, historyEvents.length);

  for (const event of historyEvents) {
    const detail = historyDeepDives[event.id];
    assert.ok(detail, `${event.id} is missing a deep dive`);
    assert.equal(detail.flow.length, 4, `${event.id} needs a four-step flow`);
    assert.ok(detail.policy.length >= 20, `${event.id} needs a policy explanation`);
    assert.ok(detail.korea.length >= 20, `${event.id} needs a Korea connection`);
    assert.ok(detail.misconception.length >= 20, `${event.id} needs a misconception note`);
  }
});

test("every history era has three reading lenses", () => {
  const eraIds = ["overview", ...historyEras.map((era) => era.id)];

  for (const eraId of eraIds) {
    const lenses = historyEraDetails[eraId];
    assert.equal(lenses?.length, 3, `${eraId} needs three reading lenses`);
    assert.ok(lenses.every((lens) => lens.label && lens.text.length >= 20));
  }
});

