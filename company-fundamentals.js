import {
  EMPTY_BALANCE_SHEET_METRICS,
  YAHOO_BALANCE_SHEET_TYPES,
  parseYahooBalanceSheet
} from "./company-balance-sheet.js";

export const YAHOO_FUNDAMENTAL_TYPES = Object.freeze([
  "trailingMarketCap",
  "trailingEnterpriseValue",
  "trailingPeRatio",
  "trailingForwardPeRatio",
  "trailingPbRatio",
  "trailingPsRatio",
  "trailingBasicEPS",
  "trailingDividendYield",
  "trailingTotalRevenue",
  "trailingNetIncomeCommonStockholders",
  "quarterlyStockholdersEquity",
  ...YAHOO_BALANCE_SHEET_TYPES
]);

const EMPTY_METRICS = Object.freeze({
  ...EMPTY_BALANCE_SHEET_METRICS,
  marketCap: null,
  enterpriseValue: null,
  per: null,
  forwardPer: null,
  pbr: null,
  psr: null,
  roe: null,
  eps: null,
  dividendYield: null,
  revenueTtm: null,
  netIncomeTtm: null,
  week52High: null,
  week52Low: null,
  dayHigh: null,
  dayLow: null,
  volume: null,
  beta: null,
  profitMargin: null
});

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function safeMetric(value, details = {}) {
  const number = finiteNumber(value);
  if (number === null) return null;
  return {
    value: number,
    asOf: details.asOf || null,
    periodType: details.periodType || null,
    currency: details.currency || null,
    calculated: Boolean(details.calculated),
    formula: details.formula || null
  };
}

function rowValue(row = {}) {
  return finiteNumber(row?.reportedValue?.raw ?? row?.dataValue);
}

function findYahooResult(payload, type) {
  const results = Array.isArray(payload?.timeseries?.result)
    ? payload.timeseries.result
    : [];
  return results.find((result) => result?.meta?.type?.includes(type)) || null;
}

function yahooRows(payload, type) {
  const result = findYahooResult(payload, type);
  const rows = Array.isArray(result?.[type]) ? result[type] : [];
  return rows
    .map((row) => ({ ...row, numericValue: rowValue(row) }))
    .filter((row) => row.numericValue !== null)
    .sort((left, right) => Date.parse(left.asOfDate || 0) - Date.parse(right.asOfDate || 0));
}

function latestYahooMetric(payload, type, overrides = {}) {
  const row = yahooRows(payload, type).at(-1);
  if (!row) return null;
  return safeMetric(row.numericValue * (overrides.multiplier || 1), {
    asOf: row.asOfDate,
    periodType: overrides.periodType || row.periodType,
    currency: row.currencyCode,
    ...overrides
  });
}

function calculateYahooRoe(payload) {
  const income = yahooRows(payload, "trailingNetIncomeCommonStockholders").at(-1);
  const equityRows = yahooRows(payload, "quarterlyStockholdersEquity")
    .filter((row) => row.numericValue > 0);
  const latestEquity = equityRows.at(-1);
  if (!income || !latestEquity) return null;
  const latestTime = Date.parse(latestEquity.asOfDate || 0);
  if (!Number.isFinite(latestTime)) return null;
  const priorCandidates = equityRows.filter((row) => {
    const timestamp = Date.parse(row.asOfDate || 0);
    return Number.isFinite(timestamp) && timestamp <= latestTime - 270 * 24 * 60 * 60_000;
  });
  const priorEquity = priorCandidates.at(-1);
  if (!priorEquity) return null;
  const averageEquity = (latestEquity.numericValue + priorEquity.numericValue) / 2;
  if (!Number.isFinite(averageEquity) || averageEquity <= 0) return null;
  const roe = (income.numericValue / averageEquity) * 100;
  if (!Number.isFinite(roe) || Math.abs(roe) > 500) return null;
  return safeMetric(roe, {
    asOf: income.asOfDate || latestEquity.asOfDate,
    periodType: "TTM / 평균자기자본",
    currency: null,
    calculated: true,
    formula: "TTM 지배주주순이익 ÷ 최근·약 1년 전 평균 자기자본 × 100"
  });
}

function calculateYahooProfitMargin(payload) {
  const revenue = yahooRows(payload, "trailingTotalRevenue").at(-1);
  const income = yahooRows(payload, "trailingNetIncomeCommonStockholders").at(-1);
  if (!revenue || !income || revenue.numericValue <= 0) return null;
  const margin = (income.numericValue / revenue.numericValue) * 100;
  if (!Number.isFinite(margin) || Math.abs(margin) > 500) return null;
  return safeMetric(margin, {
    asOf: income.asOfDate || revenue.asOfDate,
    periodType: "TTM",
    currency: null,
    calculated: true,
    formula: "TTM 지배주주순이익 ÷ TTM 매출 × 100"
  });
}

export function countFundamentalMetrics(metrics = {}) {
  return Object.values(metrics).filter((metric) => Number.isFinite(metric?.value)).length;
}

export function parseYahooFundamentals(payload = {}) {
  const balanceSheetMetrics = parseYahooBalanceSheet(payload);
  const metrics = {
    ...EMPTY_METRICS,
    marketCap: latestYahooMetric(payload, "trailingMarketCap"),
    enterpriseValue: latestYahooMetric(payload, "trailingEnterpriseValue"),
    per: latestYahooMetric(payload, "trailingPeRatio"),
    forwardPer: latestYahooMetric(payload, "trailingForwardPeRatio", { periodType: "예상" }),
    pbr: latestYahooMetric(payload, "trailingPbRatio"),
    psr: latestYahooMetric(payload, "trailingPsRatio"),
    roe: calculateYahooRoe(payload),
    eps: latestYahooMetric(payload, "trailingBasicEPS"),
    dividendYield: latestYahooMetric(payload, "trailingDividendYield", { multiplier: 100 }),
    revenueTtm: latestYahooMetric(payload, "trailingTotalRevenue"),
    netIncomeTtm: latestYahooMetric(payload, "trailingNetIncomeCommonStockholders"),
    profitMargin: calculateYahooProfitMargin(payload),
    ...balanceSheetMetrics
  };
  return {
    available: countFundamentalMetrics(metrics) >= 2,
    metrics,
    basisLabel: "최근 12개월(TTM) 가치평가 및 최근 공표 분기 재무상태표",
    metricCount: countFundamentalMetrics(metrics)
  };
}

function parseRatioText(value) {
  const matched = String(value || "").replace(/,/g, "").match(/-?[\d.]+/);
  return matched ? finiteNumber(matched[0]) : null;
}

export function parseKoreanMarketValue(value) {
  const text = String(value || "").replace(/,/g, "");
  const trillion = finiteNumber(text.match(/(-?[\d.]+)조/)?.[1]) || 0;
  const hundredMillion = finiteNumber(text.match(/(-?[\d.]+)억/)?.[1]) || 0;
  const total = trillion * 1_000_000_000_000 + hundredMillion * 100_000_000;
  return total > 0 ? total : null;
}

export function parseNaverFundamentals(payload = {}) {
  const infos = new Map(
    (Array.isArray(payload?.totalInfos) ? payload.totalInfos : [])
      .filter((item) => item?.code)
      .map((item) => [item.code, item])
  );
  const metric = (code, options = {}) => {
    const item = infos.get(code);
    if (!item) return null;
    const value = options.marketValue
      ? parseKoreanMarketValue(item.value)
      : parseRatioText(item.value);
    return safeMetric(value, {
      asOf: item.valueDesc || null,
      periodType: options.periodType || item.valueDesc || null,
      currency: options.currency || null
    });
  };
  const metrics = {
    ...EMPTY_METRICS,
    marketCap: metric("marketValue", { marketValue: true, currency: "KRW", periodType: "현재" }),
    per: metric("per"),
    forwardPer: metric("cnsPer", { periodType: "예상" }),
    pbr: metric("pbr"),
    eps: metric("eps", { currency: "KRW" }),
    dividendYield: metric("dividendYieldRatio"),
    week52High: metric("highPriceOf52Weeks", { currency: "KRW", periodType: "52주" }),
    week52Low: metric("lowPriceOf52Weeks", { currency: "KRW", periodType: "52주" }),
    dayHigh: metric("highPrice", { currency: "KRW", periodType: "당일" }),
    dayLow: metric("lowPrice", { currency: "KRW", periodType: "당일" }),
    volume: metric("accumulatedTradingVolume", { periodType: "당일" })
  };
  return {
    available: countFundamentalMetrics(metrics) >= 2,
    metrics,
    basisLabel: "네이버 증권 표시 기준",
    metricCount: countFundamentalMetrics(metrics)
  };
}

function alphaMetric(payload, key, options = {}) {
  const value = finiteNumber(payload?.[key]);
  if (value === null) return null;
  return safeMetric(value * (options.multiplier || 1), {
    asOf: payload?.LatestQuarter || null,
    periodType: options.periodType || "TTM",
    currency: options.currency === false ? null : payload?.Currency || null
  });
}

export function parseAlphaVantageFundamentals(payload = {}) {
  if (payload?.Note || payload?.Information || payload?.["Error Message"]) {
    throw new Error(payload.Note || payload.Information || payload["Error Message"]);
  }
  const metrics = {
    ...EMPTY_METRICS,
    marketCap: alphaMetric(payload, "MarketCapitalization"),
    enterpriseValue: null,
    per: alphaMetric(payload, "PERatio", { currency: false }),
    forwardPer: alphaMetric(payload, "ForwardPE", { currency: false, periodType: "예상" }),
    pbr: alphaMetric(payload, "PriceToBookRatio", { currency: false }),
    psr: alphaMetric(payload, "PriceToSalesRatioTTM", { currency: false }),
    roe: alphaMetric(payload, "ReturnOnEquityTTM", { currency: false, multiplier: 100 }),
    eps: alphaMetric(payload, "EPS"),
    dividendYield: alphaMetric(payload, "DividendYield", { currency: false, multiplier: 100 }),
    revenueTtm: alphaMetric(payload, "RevenueTTM"),
    week52High: alphaMetric(payload, "52WeekHigh"),
    week52Low: alphaMetric(payload, "52WeekLow"),
    beta: alphaMetric(payload, "Beta", { currency: false }),
    profitMargin: alphaMetric(payload, "ProfitMargin", { currency: false, multiplier: 100 })
  };
  return {
    available: countFundamentalMetrics(metrics) >= 2,
    metrics,
    basisLabel: "최근 12개월(TTM) 및 최근 분기",
    metricCount: countFundamentalMetrics(metrics)
  };
}
