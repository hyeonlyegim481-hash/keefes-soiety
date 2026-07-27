import test from "node:test";
import assert from "node:assert/strict";
import {
  countrySnapshots,
  lawChanges,
  politicalCalendar,
  politicalTransmissionPaths,
  politicsMeta
} from "./politics-data.js";

test("keeps seven current political snapshots with official sources", () => {
  assert.equal(countrySnapshots.length, 7);
  assert.deepEqual(
    countrySnapshots.map((country) => country.id),
    ["korea", "us", "china", "japan", "russia", "eu", "india"]
  );

  for (const country of countrySnapshots) {
    assert.ok(country.name);
    assert.ok(country.system.length >= 8);
    assert.ok(country.leadership);
    assert.ok(country.currentState.length >= 55);
    assert.equal(country.agenda.length, 4);
    assert.equal(country.economyLinks.length, 3);
    assert.equal(country.watch.length, 4);
    assert.ok(country.sources.length >= 2);
    assert.ok(country.sources.every((source) => /^https:\/\//.test(source.url)));
  }
});

test("provides sourced law changes with transparent status and economic links", () => {
  assert.equal(lawChanges.length, 11);
  const ids = new Set();
  const statuses = new Set(["in-force", "upcoming", "rulemaking"]);

  for (const law of lawChanges) {
    assert.ok(!ids.has(law.id), `${law.id} must be unique`);
    ids.add(law.id);
    assert.ok(statuses.has(law.status));
    assert.ok(law.plain.length >= 55);
    assert.equal(law.changes.length, 3);
    assert.equal(law.verify.length, 2);
    assert.ok(law.economy.length >= 55);
    assert.match(law.source.url, /^https:\/\//);
  }

  assert.ok(lawChanges.some((law) => law.jurisdiction === "한국" && law.status === "upcoming"));
  assert.ok(lawChanges.some((law) => law.jurisdiction === "EU"));
  assert.ok(lawChanges.some((law) => law.jurisdiction === "중국"));
});

test("makes method, transmission paths, and calendar explicit", () => {
  assert.equal(politicsMeta.updatedAt, "2026-07-27");
  assert.match(politicsMeta.principle, /지지|반대/);
  assert.equal(politicalTransmissionPaths.length, 4);
  assert.ok(politicalTransmissionPaths.every((path) => path.path.length === 4));
  assert.ok(politicalCalendar.length >= 4);
  assert.ok(politicalCalendar.every((item) => /^\d{4}-\d{2}(?:-\d{2})?$/.test(item.date)));
});
