import test from "node:test";
import assert from "node:assert/strict";
import {
  getCompanyMarketConfig,
  getCompanyProviderSymbol,
  parseAlphaVantageSeries,
  parseNaverDailySeries,
  parseTwelveDataSeries
} from "./company-market-data.js";
import {
  clearCompanyMarketCache,
  getCompanyMarket,
  loadCompanyMarketFromProviders
} from "./company-market-server.js";
import { futureCompanies } from "./future-industry-data.js";

const byId = new Map(futureCompanies.map((company) => [company.id, company]));

test("maps company tickers to provider-specific exchange symbols", () => {
  assert.equal(getCompanyProviderSymbol(byId.get("samsung-electronics")), "005930.KS");
  assert.equal(getCompanyProviderSymbol(byId.get("samsung-electronics"), "naver"), "005930");
  assert.equal(getCompanyProviderSymbol(byId.get("toyota")), "7203.T");
  assert.equal(getCompanyProviderSymbol(byId.get("siemens")), "SIE.DE");
  assert.equal(getCompanyProviderSymbol(byId.get("schneider-electric")), "SU.PA");
  assert.equal(getCompanyProviderSymbol(byId.get("catl")), "300750.SZ");
  assert.equal(getCompanyMarketConfig(byId.get("samsung-electronics")).quoteCurrency, "KRW");
});

test("parses Naver daily rows without evaluating remote script text", () => {
  const parsed = parseNaverDailySeries(`
    [['날짜', '시가', '고가', '저가', '종가', '거래량'],
    ["20260728", 100, 112, 98, 110, 5000],
    ["20260729", 110, 116, 108, 115, 6000]]
  `);
  assert.deepEqual(parsed.closes, [110, 115]);
  assert.equal(parsed.timestamps.length, 2);
  assert.ok(parsed.timestamps[1] > parsed.timestamps[0]);
});

test("parses optional Twelve Data and Alpha Vantage fallbacks", () => {
  const twelve = parseTwelveDataSeries({
    status: "ok",
    meta: { currency: "USD", exchange_timezone: "America/New_York" },
    values: [
      { datetime: "2026-07-28", close: "10.5" },
      { datetime: "2026-07-29", close: "11.2" }
    ]
  });
  const alpha = parseAlphaVantageSeries({
    "Meta Data": { "2. Symbol": "NVDA", "5. Time Zone": "US/Eastern" },
    "Time Series (Daily)": {
      "2026-07-29": { "4. close": "11.2" },
      "2026-07-28": { "4. close": "10.5" }
    }
  });
  assert.deepEqual(twelve.closes, [10.5, 11.2]);
  assert.deepEqual(alpha.closes, [10.5, 11.2]);
});

test("moves to a different provider after the primary provider fails", async () => {
  const result = await loadCompanyMarketFromProviders([
    {
      id: "primary",
      label: "기본 API",
      load: async () => {
        throw new Error("Provider HTTP 503");
      }
    },
    {
      id: "alternate",
      label: "보조 API",
      load: async () => ({ value: 102, series: [{ time: "2026-07-28", value: 100 }, { time: "2026-07-29", value: 102 }] })
    }
  ]);
  assert.equal(result.market.value, 102);
  assert.deepEqual(result.attempts.map((item) => item.status), ["failed", "success"]);
  assert.equal(result.attempts[0].reason, "HTTP 503");
});

test("shows collection failure instead of inventing a company price", async () => {
  clearCompanyMarketCache();
  const result = await getCompanyMarket("nvidia", {
    now: Date.parse("2026-07-31T12:00:00Z"),
    providers: [
      { id: "one", label: "API 1", load: async () => { throw new Error("offline"); } },
      { id: "two", label: "API 2", load: async () => { throw new Error("offline"); } }
    ]
  });
  assert.equal(result.available, false);
  assert.equal(result.cacheState, "unavailable");
  assert.equal("market" in result, false);
  assert.equal(result.attempts.length, 2);
});

