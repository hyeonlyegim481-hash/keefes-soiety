import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCompanyProviderSymbol } from "./company-market-data.js";
import { futureCompanies } from "./future-industry-data.js";
import {
  kospiCatalogMetadata,
  kospiCompanyCatalog
} from "./kospi-company-catalog.js";

const updaterSource = readFileSync(
  new URL("./scripts/update-kospi-companies.mjs", import.meta.url),
  "utf8"
);

test("captures the complete official KOSPI company snapshot", () => {
  assert.equal(kospiCatalogMetadata.provider, "한국거래소 KIND");
  assert.equal(kospiCatalogMetadata.market, "KOSPI");
  assert.equal(kospiCatalogMetadata.count, 833);
  assert.equal(kospiCompanyCatalog.length, kospiCatalogMetadata.count);
  assert.equal(
    kospiCatalogMetadata.rawRowCount - kospiCatalogMetadata.duplicateRowsRemoved,
    kospiCatalogMetadata.count
  );
  assert.match(kospiCatalogMetadata.sourceUrl, /^https:\/\/kind\.krx\.co\.kr\//);
  assert.match(kospiCatalogMetadata.downloadUrl, /marketType=stockMkt/);
});

test("keeps every official representative ticker unique and auditable", () => {
  const tickers = new Set();
  const ids = new Set();

  for (const company of kospiCompanyCatalog) {
    assert.equal(company.country, "한국");
    assert.equal(company.market, "KOSPI");
    assert.equal(company.catalogOnly, true);
    assert.equal(company.snapshotStatus, "catalog-only");
    assert.match(company.ticker, /^[0-9A-Z]{6}$/);
    assert.equal(company.id, `kospi-${company.ticker.toLowerCase()}`);
    assert.ok(!tickers.has(company.ticker), `${company.ticker}: duplicate ticker`);
    assert.ok(!ids.has(company.id), `${company.id}: duplicate ID`);
    tickers.add(company.ticker);
    ids.add(company.id);
    assert.ok(company.name);
    assert.ok(company.krxIndustry);
    assert.ok(company.products);
    assert.match(company.listedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(company.source.url, /^https:\/\/kind\.krx\.co\.kr\//);
    assert.ok(company.revenue == null);
    assert.ok(company.revenueGrowth == null);
    assert.ok(company.margin == null);
    assert.ok(company.moat == null);
    assert.ok(company.risk == null);
    assert.equal(company.healthParts, null);
  }

  assert.equal(tickers.size, kospiCatalogMetadata.count);
  assert.equal(ids.size, kospiCatalogMetadata.count);
});

test("merges official KOSPI coverage without duplicating detailed Korean profiles", () => {
  const koreanCompanies = futureCompanies.filter((company) => company.country === "한국");
  const detailedCompanies = futureCompanies.filter((company) => !company.catalogOnly);
  const detailedKorean = detailedCompanies.filter((company) => company.country === "한국");
  const catalogOnly = futureCompanies.filter((company) => company.catalogOnly);

  assert.equal(koreanCompanies.length, 833);
  assert.equal(new Set(koreanCompanies.map((company) => company.ticker)).size, 833);
  assert.equal(detailedCompanies.length, 147);
  assert.equal(detailedKorean.length, 61);
  assert.equal(catalogOnly.length, 772);
  assert.equal(futureCompanies.length, 919);
  assert.equal(new Set(futureCompanies.map((company) => company.id)).size, 919);
});

test("supports the official alphanumeric KOSPI codes in price provider plans", () => {
  const alphanumeric = kospiCompanyCatalog.find((company) => /[A-Z]/.test(company.ticker));
  assert.ok(alphanumeric, "official snapshot should include an alphanumeric representative ticker");
  assert.equal(getCompanyProviderSymbol(alphanumeric, "naver"), alphanumeric.ticker);
  assert.equal(getCompanyProviderSymbol(alphanumeric, "yahoo"), `${alphanumeric.ticker}.KS`);
});

test("validates KIND headers, encoding, counts, and duplicate conflicts before generation", () => {
  assert.match(updaterSource, /TextDecoder\("euc-kr"\)/);
  assert.match(updaterSource, /EXPECTED_HEADERS/);
  assert.match(updaterSource, /companies\.length < 750 \|\| companies\.length > 950/);
  assert.match(updaterSource, /Conflicting KIND rows/);
  assert.match(updaterSource, /\^\[0-9A-Z\]\{6\}\$/);
  assert.doesNotMatch(updaterSource, /Object\.groupBy/);
});
