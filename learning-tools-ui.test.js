import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCountryComparisonModel,
  countryComparisonGroups
} from "./learning-tools-ui.js";

test("country comparison provides five six-metric reading groups", () => {
  assert.equal(countryComparisonGroups.length, 5);
  countryComparisonGroups.forEach((group) => {
    assert.equal(group.indicatorIds.length, 6);
    assert.equal(new Set(group.indicatorIds).size, 6);
    assert.ok(group.description.length >= 30);
  });
});

test("country comparison uses two to five valid countries and keeps years", () => {
  const model = buildCountryComparisonModel("overview", [
    "KOR",
    "USA",
    "CHN",
    "JPN",
    "DEU"
  ]);
  assert.equal(model.countries.length, 5);
  assert.equal(model.metrics.length, 6);
  model.metrics.forEach((metric) => {
    assert.equal(metric.observations.length, 5);
    assert.ok(metric.observations.every((item) => item.observation?.year));
    assert.ok(metric.observations.every((item) => item.position >= 4));
    assert.ok(metric.highest);
    assert.ok(metric.lowest);
  });
});

test("invalid comparison selections fall back to a complete default", () => {
  const model = buildCountryComparisonModel("missing", ["BAD"]);
  assert.equal(model.group.id, "overview");
  assert.deepEqual(
    model.countries.map((country) => country.id),
    ["KOR", "USA", "JPN", "CHN"]
  );
});

test("country comparison supports fifteen choices and handles missing selections", async () => {
  const { indicatorCountries } = await import("./indicator-data.js");
  assert.equal(indicatorCountries.length, 15);
  assert.equal(new Set(indicatorCountries.map((country) => country.id)).size, 15);

  const model = buildCountryComparisonModel("overview");
  assert.deepEqual(
    model.countries.map((country) => country.id),
    ["KOR", "USA", "JPN", "CHN"]
  );
});