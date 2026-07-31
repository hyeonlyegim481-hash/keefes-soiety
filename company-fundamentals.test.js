import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAlphaVantageFundamentals,
  parseKoreanMarketValue,
  parseNaverFundamentals,
  parseYahooFundamentals
} from "./company-fundamentals.js";

function yahooResult(type, rows) {
  return { meta: { symbol: ["TEST"], type: [type] }, [type]: rows };
}

test("Yahoo fundamentals preserve basis dates and calculate ROE transparently", () => {
  const payload = {
    timeseries: {
      result: [
        yahooResult("trailingMarketCap", [{ asOfDate: "2026-07-30", periodType: "TTM", currencyCode: "USD", reportedValue: { raw: 4_700_000_000_000 } }]),
        yahooResult("trailingPeRatio", [{ asOfDate: "2026-07-29", periodType: "TTM", reportedValue: { raw: 29.1 } }]),
        yahooResult("trailingPbRatio", [{ asOfDate: "2026-07-29", periodType: "TTM", reportedValue: { raw: 23.5 } }]),
        yahooResult("trailingPsRatio", [{ asOfDate: "2026-07-29", periodType: "TTM", reportedValue: { raw: 18.3 } }]),
        yahooResult("trailingDividendYield", [{ asOfDate: "2026-06-30", dataValue: 0.0014 }]),
        yahooResult("trailingTotalRevenue", [{ asOfDate: "2026-04-30", periodType: "TTM", currencyCode: "USD", reportedValue: { raw: 1_000 } }]),
        yahooResult("trailingNetIncomeCommonStockholders", [{ asOfDate: "2026-04-30", periodType: "TTM", currencyCode: "USD", reportedValue: { raw: 120 } }]),
        yahooResult("quarterlyStockholdersEquity", [
          { asOfDate: "2025-04-30", periodType: "3M", currencyCode: "USD", reportedValue: { raw: 800 } },
          { asOfDate: "2026-04-30", periodType: "3M", currencyCode: "USD", reportedValue: { raw: 1_200 } }
        ])
      ]
    }
  };
  const result = parseYahooFundamentals(payload);
  assert.equal(result.available, true);
  assert.equal(result.metrics.marketCap.value, 4_700_000_000_000);
  assert.equal(result.metrics.per.value, 29.1);
  assert.equal(result.metrics.pbr.value, 23.5);
  assert.equal(result.metrics.psr.value, 18.3);
  assert.ok(Math.abs(result.metrics.dividendYield.value - 0.14) < 1e-10);
  assert.equal(result.metrics.roe.value, 12);
  assert.equal(result.metrics.profitMargin.value, 12);
  assert.match(result.metrics.profitMargin.formula, /TTM 매출/);
  assert.equal(result.metrics.roe.calculated, true);
  assert.match(result.metrics.roe.formula, /평균 자기자본/);
});

test("Naver fundamentals parse Korean market cap without treating missing values as zero", () => {
  assert.equal(parseKoreanMarketValue("1,534조 6,481억"), 1_534_648_100_000_000);
  assert.equal(parseKoreanMarketValue("-"), null);
  const result = parseNaverFundamentals({
    totalInfos: [
      { code: "marketValue", value: "435조 2,100억" },
      { code: "per", value: "21.22배", valueDesc: "2026.03." },
      { code: "pbr", value: "3.65배", valueDesc: "2026.03." },
      { code: "dividendYieldRatio", value: "0.64%", valueDesc: "2025.12." }
    ]
  });
  assert.equal(result.available, true);
  assert.equal(result.metrics.marketCap.value, 435_210_000_000_000);
  assert.equal(result.metrics.per.value, 21.22);
  assert.equal(result.metrics.pbr.value, 3.65);
  assert.equal(result.metrics.psr, null);
});

test("Alpha Vantage overview remains an optional normalized fallback", () => {
  const result = parseAlphaVantageFundamentals({
    Currency: "USD",
    LatestQuarter: "2026-06-30",
    MarketCapitalization: "1000000000",
    PERatio: "20.5",
    PriceToBookRatio: "4.2",
    PriceToSalesRatioTTM: "3.1",
    ReturnOnEquityTTM: "0.18",
    DividendYield: "0.012"
  });
  assert.equal(result.available, true);
  assert.equal(result.metrics.roe.value, 18);
  assert.equal(result.metrics.dividendYield.value, 1.2);
  assert.equal(result.metrics.marketCap.currency, "USD");
});
