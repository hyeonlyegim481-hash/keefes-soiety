import test from "node:test";
import assert from "node:assert/strict";

import { resourceProductionIndicators, resourceProductionMetadata } from "./resource-production-data.js";
import { formatProductionCompact, formatProductionExact, renderResourceProductionDetail } from "./resource-production-ui.js";

test("adds six sourced 2025 mineral production indicators", () => {
  assert.equal(resourceProductionIndicators.length, 6);
  assert.equal(new Set(resourceProductionIndicators.map((indicator) => indicator.id)).size, 6);
  assert.equal(resourceProductionMetadata.year, 2025);
  assert.match(resourceProductionMetadata.sourceUrl, /^https:\/\/www\.sciencebase\.gov\//);

  for (const indicator of resourceProductionIndicators) {
    assert.equal(indicator.kind, "resource-production");
    assert.equal(indicator.category, "resources");
    assert.equal(indicator.year, 2025);
    assert.ok(indicator.worldTotal > 0);
    assert.ok(indicator.countries.length >= 9);
    assert.match(indicator.sourceUrl, /^https:\/\/www\.sciencebase\.gov\//);
    assert.ok(indicator.reading.length > 30);
    assert.ok(indicator.caution.length > 30);
    assert.ok(indicator.korea.length > 30);
  }
});

test("keeps mapped countries valid and reconciles rounded world totals", () => {
  for (const indicator of resourceProductionIndicators) {
    const mapped = indicator.countries.filter((country) => country.id !== "OTH");
    assert.equal(new Set(indicator.countries.map((country) => country.id)).size, indicator.countries.length);
    assert.ok(mapped.every((country) => Number.isFinite(country.lon) && country.lon >= -180 && country.lon <= 180));
    assert.ok(mapped.every((country) => Number.isFinite(country.lat) && country.lat >= -58 && country.lat <= 84));
    assert.ok(indicator.countries.every((country) => Number.isFinite(country.value) && country.value > 0));

    const reported = indicator.countries.reduce((sum, country) => sum + country.value, 0);
    const gap = Math.abs(reported - indicator.worldTotal) / indicator.worldTotal;
    assert.ok(gap < 0.03, `${indicator.id} rounded total gap ${gap}`);
  }
});

test("renders a map, rankings, exact quantities and clear units", () => {
  const lithium = resourceProductionIndicators.find((indicator) => indicator.id === "production-lithium");
  const html = renderResourceProductionDetail(lithium);

  assert.match(html, /world-production-map\.webp/);
  assert.match(html, /세계 생산 지도/);
  assert.match(html, /생산국 순위/);
  assert.match(html, /92,000톤/);
  assert.match(html, /미국 생산량은 비공개/);
  assert.equal(formatProductionExact(92_000), "92,000톤");
  assert.equal(formatProductionCompact(2_600_000_000), "26억 톤");
});
