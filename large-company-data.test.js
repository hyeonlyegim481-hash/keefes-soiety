import test from "node:test";
import assert from "node:assert/strict";

import { largeCompanyDataA } from "./large-company-data-a.js";
import { largeCompanyDataB } from "./large-company-data-b.js";
import { futureCompanies, futureIndustries } from "./future-industry-data.js";

const addedCompanies = [...largeCompanyDataA, ...largeCompanyDataB];

test("keeps the 42-company global expansion inside the detailed company catalog", () => {
  assert.equal(largeCompanyDataA.length, 21);
  assert.equal(largeCompanyDataB.length, 21);
  assert.equal(addedCompanies.length, 42);
  assert.equal(futureCompanies.filter((company) => !company.catalogOnly).length, 147);
  assert.equal(new Set(addedCompanies.map((company) => company.id)).size, 42);
});

test("spreads added companies across regions and industries", () => {
  assert.ok(new Set(addedCompanies.map((company) => company.country)).size >= 8);
  assert.ok(new Set(addedCompanies.map((company) => company.sectorId)).size >= 8);
  assert.ok(addedCompanies.filter((company) => company.country === "한국").length >= 5);

  const linkedIds = new Set(futureIndustries.flatMap((industry) => industry.companyIds));
  for (const company of addedCompanies) {
    assert.ok(linkedIds.has(company.id), `${company.id}: not linked to an industry`);
  }
});

test("keeps every added company analysis-ready and officially sourced", () => {
  for (const company of addedCompanies) {
    assert.ok(company.business.length >= 35, `${company.id}: business`);
    assert.ok(company.moat.length >= 35, `${company.id}: moat`);
    assert.ok(company.risk.length >= 35, `${company.id}: risk`);
    assert.equal(company.watch.length, 3, `${company.id}: watch`);
    assert.equal(typeof company.revenueGrowth, "number", `${company.id}: growth`);
    assert.equal(typeof company.margin, "number", `${company.id}: margin`);
    assert.deepEqual(
      Object.keys(company.healthParts).sort(),
      ["cash", "growth", "position", "profitability"]
    );
    assert.match(company.source.url, /^https:\/\//, `${company.id}: source`);
  }
});
