import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { historyEras, historyEvents } from "./history-data.js";
import { historyEraProfiles, historyEventPerspectives } from "./history-reading-data.js";

const eraIds = ["overview", ...historyEras.map((era) => era.id)];

test("gives every history era a detailed visual reading profile", () => {
  assert.deepEqual(Object.keys(historyEraProfiles), eraIds);

  for (const eraId of eraIds) {
    const profile = historyEraProfiles[eraId];
    assert.ok(profile.image.startsWith("/assets/history/"));
    assert.ok(profile.imageAlt.length >= 30, `${eraId} needs a useful image description`);
    assert.ok(profile.caption.includes("실제 기록사진이 아닙니다"));
    assert.equal(profile.narrative.length, 2);
    assert.ok(profile.narrative.every((paragraph) => paragraph.length >= 90));
    assert.equal(profile.structure.length, 4);
    assert.ok(profile.structure.every((item) => item.label && item.title && item.text.length >= 45));

    const imagePath = fileURLToPath(new URL(`.${profile.image}`, import.meta.url));
    assert.ok(existsSync(imagePath), `${profile.image} is missing`);
    assert.ok(statSync(imagePath).size > 100_000, `${profile.image} is too small`);
    assert.ok(statSync(imagePath).size < 600_000, `${profile.image} is too large for the web`);
  }
});

test("adds lived experience, legacy and comparison signals to every event", () => {
  assert.equal(Object.keys(historyEventPerspectives).length, historyEvents.length);

  for (const event of historyEvents) {
    const perspective = historyEventPerspectives[event.id];
    assert.ok(perspective, `${event.id} is missing a perspective`);
    assert.ok(perspective.people.length >= 65, `${event.id} needs a clearer lived-experience note`);
    assert.ok(perspective.legacy.length >= 55, `${event.id} needs a clearer legacy note`);
    assert.equal(perspective.checklist.length, 3, `${event.id} needs three comparison signals`);
    assert.ok(perspective.checklist.every((item) => item.length >= 18));
  }
});

test("uses four optimized illustrations across the seven reading profiles", () => {
  const images = new Set(Object.values(historyEraProfiles).map((profile) => profile.image));
  assert.equal(images.size, 4);
});