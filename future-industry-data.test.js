import test from "node:test";
import assert from "node:assert/strict";
import { futureCompanies, futureIndustries, futureIndustryMethod } from "./future-industry-data.js";

test("defines six complete future industries with valid company links", () => {
  assert.equal(futureIndustries.length, 6);
  const companyIds = new Set(futureCompanies.map((company) => company.id));
  const industryIds = new Set();

  for (const industry of futureIndustries) {
    assert.ok(!industryIds.has(industry.id), industry.id + " must be unique");
    industryIds.add(industry.id);
    assert.ok(industry.label);
    assert.ok(industry.thesis.length >= 45);
    assert.ok(industry.plain.length >= 35);
    assert.equal(industry.drivers.length, 3);
    assert.equal(industry.bottlenecks.length, 3);
    assert.equal(industry.valueChain.length, 5);
    assert.equal(industry.deepDive.length, 3);
    assert.equal(industry.signals.length, 3);
    assert.ok(industry.companyIds.length >= 1);
    for (const companyId of industry.companyIds) {
      assert.ok(companyIds.has(companyId), companyId + " must reference a company");
    }
  }
});

test("provides twelve sourced company snapshots and transparent health parts", () => {
  assert.equal(futureCompanies.length, 12);
  const ids = new Set();
  const partIds = futureIndustryMethod.parts.map((part) => part.id).sort();

  for (const company of futureCompanies) {
    assert.ok(!ids.has(company.id), company.id + " must be unique");
    ids.add(company.id);
    assert.ok(company.fiscal);
    assert.ok(company.revenue);
    assert.equal(typeof company.revenueGrowth, "number");
    assert.equal(typeof company.margin, "number");
    assert.ok(company.business.length >= 35);
    assert.ok(company.moat.length >= 35);
    assert.ok(company.risk.length >= 35);
    assert.equal(company.watch.length, 3);
    assert.match(company.source.url, /^https:\/\//);

    assert.deepEqual(Object.keys(company.healthParts).sort(), partIds);
    const score = Object.values(company.healthParts).reduce((sum, value) => sum + value, 0);
    assert.ok(score >= 0 && score <= 100);
    assert.ok(Object.values(company.healthParts).every((value) => value >= 0 && value <= 25));
  }
});

test("keeps the financial snapshot basis explicit", () => {
  assert.equal(futureIndustryMethod.updatedAt, "2026-07-15");
  assert.equal(futureIndustryMethod.parts.length, 4);
  assert.match(futureIndustryMethod.caution, /통화와 연결·별도 기준/);

  const byId = Object.fromEntries(futureCompanies.map((company) => [company.id, company]));
  assert.equal(byId.nvidia.revenue, "US$215.9B");
  assert.equal(byId["sk-hynix"].revenueGrowth, 47);
  assert.equal(byId["samsung-biologics"].margin, 45.4);
  assert.match(byId["doosan-enerbility"].fiscal, /별도재무제표/);
});
