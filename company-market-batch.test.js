import assert from "node:assert/strict";
import test from "node:test";

import {
  getCompanyMarketBatch,
  normalizeCompanyMarketIds
} from "./company-market-batch.js";

test("company market batch removes duplicates, rejects unknown ids, and caps requests", () => {
  const ids = normalizeCompanyMarketIds([
    "nvidia",
    "nvidia",
    "unknown-company",
    "samsung-electronics",
    "sk-hynix",
    "microsoft",
    "alphabet",
    "tesla",
    "tsmc"
  ]);
  assert.deepEqual(ids, [
    "nvidia",
    "samsung-electronics",
    "sk-hynix",
    "microsoft",
    "alphabet",
    "tesla"
  ]);
});

test("company market batch keeps partial success when one company fails", async () => {
  const result = await getCompanyMarketBatch("nvidia,samsung-electronics", {
    now: Date.parse("2026-07-31T03:00:00.000Z"),
    loader: async (id) => {
      if (id === "samsung-electronics") throw Object.assign(new Error("offline"), { code: "offline" });
      return { available: true, company: { id }, market: { value: 100, series: [{ time: 1, value: 100 }] } };
    }
  });
  assert.equal(result.companies.nvidia.ok, true);
  assert.equal(result.companies.nvidia.payload.market.value, 100);
  assert.equal("series" in result.companies.nvidia.payload.market, false);
  assert.equal(result.companies["samsung-electronics"].ok, false);
  assert.equal(result.companies["samsung-electronics"].code, "offline");
  assert.equal(result.servedAt, "2026-07-31T03:00:00.000Z");
});

