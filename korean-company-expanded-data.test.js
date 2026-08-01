import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  companyIndustryCatalog,
  getCompanyIndustryId
} from "./company-industry-data.js";
import { getCompanyProviderSymbol } from "./company-market-data.js";
import { futureCompanies } from "./future-industry-data.js";
import { koreanExpandedCompanies } from "./korean-company-expanded-data.js";

const uiSource = await readFile(new URL("./company-ui.js", import.meta.url), "utf8");
const industryIds = new Set(companyIndustryCatalog.map((industry) => industry.id));

test("adds 45 Korean companies across diverse industries without duplicate IDs", () => {
  assert.equal(koreanExpandedCompanies.length, 45);
  assert.equal(new Set(koreanExpandedCompanies.map((company) => company.id)).size, 45);
  assert.equal(new Set(koreanExpandedCompanies.map((company) => company.industryId)).size, 13);
  assert.ok(koreanExpandedCompanies.filter((company) => company.industryId === "finance-insurance").length >= 6);
  assert.ok(koreanExpandedCompanies.filter((company) => company.industryId === "shipbuilding-defense").length >= 6);

  for (const company of koreanExpandedCompanies) {
    assert.equal(company.country, "한국");
    assert.match(company.ticker, /^\d{6}$/);
    assert.ok(industryIds.has(company.industryId), company.id);
    assert.equal(company.snapshotStatus, "profile-only");
    assert.equal(company.revenueGrowth, null);
    assert.equal(company.margin, null);
    assert.equal(company.healthParts, null);
    assert.ok(company.business.length >= 55, company.id);
    assert.ok(company.moat.length >= 35, company.id);
    assert.ok(company.risk.length >= 35, company.id);
    assert.equal(company.watch.length, 3);
    assert.match(company.source.url, /^https:\/\/dart\.fss\.or\.kr\//);
  }
});

test("expands the catalog to 147 companies including 61 Korean companies", () => {
  assert.equal(futureCompanies.length, 147);
  assert.equal(futureCompanies.filter((company) => company.country === "한국").length, 61);
  assert.equal(new Set(futureCompanies.map((company) => company.id)).size, 147);
  assert.ok(futureCompanies.every((company) => industryIds.has(getCompanyIndustryId(company))));
});

test("keeps new Korean company market requests lazy and provider-compatible", () => {
  const kb = koreanExpandedCompanies.find((company) => company.id === "kb-financial");
  assert.equal(getCompanyProviderSymbol(kb, "yahoo"), "105560.KS");
  assert.equal(getCompanyProviderSymbol(kb, "naver"), "105560");
  assert.match(uiSource, /void ensureCompanyQuote\(viewState\.companyId\)/);
  assert.match(uiSource, /getCompanyIndustryId\(company\) !== viewState\.sector/);
  assert.match(uiSource, /companyIndustryCatalog\.map/);
});
