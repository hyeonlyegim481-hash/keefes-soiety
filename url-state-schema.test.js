import assert from "node:assert/strict";
import test from "node:test";

import { futureIndustries } from "./future-industry-data.js";
import { indicatorDefinitions } from "./indicator-data.js";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js";
import { broadIndicatorDefinitions } from "./indicator-broad-data.js";
import { countrySnapshots } from "./politics-data.js";
import { resourceProductionIndicators } from "./resource-production-data.js";
import { URL_STATE_VALUES } from "./url-state.js";

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("URL indicator IDs match every indicator available in the interface", () => {
  const actualIds = [
    ...indicatorDefinitions,
    ...financeIndicatorDefinitions,
    ...expandedIndicatorDefinitions,
    ...broadIndicatorDefinitions,
    ...resourceProductionIndicators
  ].map((item) => item.id);
  assert.deepEqual(sorted(URL_STATE_VALUES.indicator), sorted(actualIds));
});

test("URL future-industry and politics-country IDs match their source data", () => {
  assert.deepEqual(
    sorted(URL_STATE_VALUES.industry),
    sorted(futureIndustries.map((item) => item.id))
  );
  assert.deepEqual(
    sorted(URL_STATE_VALUES.country),
    sorted(countrySnapshots.map((item) => item.id))
  );
});
