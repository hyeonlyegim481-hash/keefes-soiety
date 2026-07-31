import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  indicatorDefinitions as baseIndicatorDefinitions
} from "./indicator-data.js";
import {
  financeIndicatorDefinitions
} from "./indicator-finance-data.js";
import {
  expandedIndicatorDefinitions
} from "./indicator-expanded-data.js";
import { broadIndicatorDefinitions } from "./indicator-broad-data.js";
import { indicatorSnapshot } from "./indicator-values.js";
import {
  resourceProductionIndicators,
  resourceProductionMetadata
} from "./resource-production-data.js";
import { indicatorProviderMetadata } from "./indicator-provider-metadata.js";
import {
  INDICATOR_METADATA_FIELDS,
  buildIndicatorMetadata,
  buildResourceIndicatorMetadata,
  formatIndicatorDisplayDelta,
  formatIndicatorDisplayValue
} from "./indicator-metadata.js";

const wdiDefinitions = [
  ...baseIndicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions,
  ...broadIndicatorDefinitions
];

test("official provider metadata covers every WDI definition", () => {
  assert.equal(wdiDefinitions.length, 95);
  assert.equal(
    Object.keys(indicatorProviderMetadata.indicators).length,
    wdiDefinitions.length
  );

  for (const indicator of wdiDefinitions) {
    const provider = indicatorProviderMetadata.indicators[indicator.code];
    assert.ok(provider, `${indicator.id}: missing provider metadata`);
    assert.ok(provider.officialName.length > 5, `${indicator.id}: missing official name`);
    assert.ok(
      provider.sourceOrganization.length > 5,
      `${indicator.id}: missing source organization`
    );
  }
});

test("every WDI and resource indicator exposes the required metadata fields", () => {
  for (const indicator of wdiDefinitions) {
    const dataset = indicatorSnapshot.indicators[indicator.id];
    const observation = dataset?.countries?.KOR || null;
    const metadata = buildIndicatorMetadata(indicator, {
      observation,
      snapshot: indicatorSnapshot,
      dataset
    });
    for (const field of INDICATOR_METADATA_FIELDS) {
      assert.ok(
        Object.hasOwn(metadata, field),
        `${indicator.id}: missing metadata field ${field}`
      );
    }
    assert.equal(metadata.officialCode, indicator.code);
    assert.equal(metadata.multiplier, 1);
    assert.match(metadata.sourceUrl, /^https:\/\/data\.worldbank\.org\/indicator\//);
    assert.ok(metadata.sourceInstitution, `${indicator.id}: no source institution`);
  }

  for (const indicator of resourceProductionIndicators) {
    const metadata = buildResourceIndicatorMetadata(
      indicator,
      resourceProductionMetadata
    );
    for (const field of INDICATOR_METADATA_FIELDS) {
      assert.ok(
        Object.hasOwn(metadata, field),
        `${indicator.id}: missing metadata field ${field}`
      );
    }
    assert.equal(metadata.releaseStatus, "추정치");
    assert.equal(metadata.sourceInstitution, "미국 지질조사국(USGS)");
    assert.equal(metadata.multiplier, 1);
  }
});

test("fertility is displayed as children per woman rather than percent", () => {
  const indicator = wdiDefinitions.find((item) => item.id === "fertility");
  const metadata = buildIndicatorMetadata(indicator, {
    observation: { year: 2024, value: 0.75 },
    snapshot: indicatorSnapshot
  });

  assert.equal(metadata.displayUnit, "여성 1명당 기대 자녀 수");
  assert.equal(formatIndicatorDisplayValue(indicator, 0.75), "0.75명");
  assert.doesNotMatch(formatIndicatorDisplayValue(indicator, 0.75), /%/);
});

test("percentage levels and percentage-point changes remain distinct", () => {
  const inflation = wdiDefinitions.find(
    (item) => item.id === "consumer-inflation"
  );
  const healthShare = wdiDefinitions.find(
    (item) => item.id === "health-spending"
  );

  assert.equal(formatIndicatorDisplayValue(inflation, 2.4), "2.4%");
  assert.equal(formatIndicatorDisplayDelta(inflation, 0.3), "+0.3 %p");
  assert.equal(formatIndicatorDisplayValue(healthShare, 8.25), "8.3% GDP");
  assert.equal(formatIndicatorDisplayDelta(healthShare, -0.2), "-0.2 %p");
});

test("nominal, real, PPP, total, and per-capita meanings are explicit", () => {
  const byId = new Map(wdiDefinitions.map((indicator) => [indicator.id, indicator]));
  const nominal = buildIndicatorMetadata(byId.get("gdp-per-capita"));
  const growth = buildIndicatorMetadata(byId.get("gdp-growth"));
  const ppp = buildIndicatorMetadata(byId.get("gdp-per-capita-ppp"));
  const migration = buildIndicatorMetadata(byId.get("net-migration"));

  assert.equal(nominal.nominalReal, "명목");
  assert.equal(nominal.currency, "미국달러(USD)");
  assert.equal(nominal.priceBasis, "현재가격");
  assert.equal(nominal.valueScope, "1인당 값");
  assert.equal(growth.nominalReal, "실질");
  assert.equal(growth.changeBasis, "YoY");
  assert.equal(ppp.baseYear, "2021년");
  assert.equal(ppp.displayUnit, "2021 국제달러/명");
  assert.match(migration.valueScope, /국가 전체/);
  assert.equal(
    formatIndicatorDisplayValue(byId.get("gdp-per-capita"), 12000),
    "US$12,000/명"
  );
});

test("unknown release and final-status fields are not fabricated", () => {
  const indicator = wdiDefinitions.find((item) => item.id === "fertility");
  const metadata = buildIndicatorMetadata(indicator, {
    observation: { year: 2024, value: 0.75 },
    snapshot: { dataUpdatedAt: "2026-07-24" }
  });

  assert.equal(metadata.releaseDate, null);
  assert.equal(metadata.releaseStatus, null);
  assert.equal(metadata.collectedAt, "2026-07-24");
  assert.match(metadata.revisionStatus, /수정 가능/);
});

test("future indicator updates preserve collection time and provider status", async () => {
  const script = await readFile(
    new URL("./scripts/update-indicators.mjs", import.meta.url),
    "utf8"
  );
  assert.match(script, /collectedAt = new Date\(\)\.toISOString\(\)/);
  assert.match(script, /lastupdated/);
  assert.match(script, /obs_status/);
});
