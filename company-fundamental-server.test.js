import assert from "node:assert/strict";
import test from "node:test";
import { loadCompanyFundamentalsFromProviders } from "./company-market-server.js";

test("company fundamentals move to an independent provider after failure", async () => {
  const result = await loadCompanyFundamentalsFromProviders([
    { id: "primary", label: "기본", load: async () => { throw new Error("Provider HTTP 503"); } },
    {
      id: "alternate",
      label: "대체",
      load: async () => ({
        available: true,
        metricCount: 4,
        metrics: {
          marketCap: { value: 1_000 },
          per: { value: 15 },
          pbr: { value: 2 },
          psr: { value: 3 }
        }
      })
    }
  ]);
  assert.equal(result.fundamentals.metrics.per.value, 15);
  assert.deepEqual(result.attempts.map((attempt) => attempt.status), ["failed", "success"]);
});

test("company fundamentals never invent a ratio when all providers fail", async () => {
  const result = await loadCompanyFundamentalsFromProviders([
    { id: "one", label: "하나", load: async () => { throw new Error("No data"); } },
    { id: "two", label: "둘", load: async () => ({ available: false, metrics: {} }) }
  ]);
  assert.equal(result.fundamentals, null);
  assert.equal(result.attempts.length, 2);
});
