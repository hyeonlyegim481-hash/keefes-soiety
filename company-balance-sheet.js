export const YAHOO_BALANCE_SHEET_TYPES = Object.freeze([
  "quarterlyTotalAssets",
  "quarterlyCurrentAssets",
  "quarterlyTotalNonCurrentAssets",
  "quarterlyCurrentLiabilities",
  "quarterlyTotalNonCurrentLiabilitiesNetMinorityInterest",
  "quarterlyTotalLiabilitiesNetMinorityInterest",
  "quarterlyAccountsReceivable",
  "quarterlyReceivables",
  "quarterlyInventory",
  "quarterlyCashCashEquivalentsAndShortTermInvestments",
  "quarterlyCashAndCashEquivalents",
  "quarterlyOtherShortTermInvestments",
  "quarterlyPayables",
  "quarterlyAccountsPayable",
  "quarterlyTotalDebt"
]);

export const EMPTY_BALANCE_SHEET_METRICS = Object.freeze({
  totalAssets: null,
  currentAssets: null,
  nonCurrentAssets: null,
  currentLiabilities: null,
  nonCurrentLiabilities: null,
  totalLiabilities: null,
  accountsReceivable: null,
  inventory: null,
  cashAndShortTermInvestments: null,
  cashAndCashEquivalents: null,
  shortTermInvestments: null,
  payables: null,
  accountsPayable: null,
  totalDebt: null,
  stockholdersEquity: null,
  quickAssets: null,
  workingCapital: null,
  currentRatio: null,
  quickRatio: null,
  debtRatio: null
});

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function resultRows(payload, type) {
  const results = Array.isArray(payload?.timeseries?.result)
    ? payload.timeseries.result
    : [];
  const result = results.find((item) => item?.meta?.type?.includes(type));
  const rows = Array.isArray(result?.[type]) ? result[type] : [];
  return rows
    .map((row) => ({
      ...row,
      numericValue: finiteNumber(row?.reportedValue?.raw ?? row?.dataValue)
    }))
    .filter((row) => row.numericValue !== null)
    .sort((left, right) => Date.parse(left.asOfDate || 0) - Date.parse(right.asOfDate || 0));
}

function latestMetric(payload, type) {
  const row = resultRows(payload, type).at(-1);
  if (!row) return null;
  return {
    value: row.numericValue,
    asOf: row.asOfDate || null,
    periodType: row.periodType || "최근 분기",
    currency: row.currencyCode || null,
    calculated: false,
    formula: null
  };
}

function calculateAlignedMetric(inputs, calculator, details = {}) {
  if (!inputs.length || inputs.some((metric) => !Number.isFinite(metric?.value))) return null;
  const dates = new Set(inputs.map((metric) => metric.asOf).filter(Boolean));
  const currencies = new Set(inputs.map((metric) => metric.currency).filter(Boolean));
  if (dates.size !== 1 || currencies.size !== 1) return null;
  const value = calculator(...inputs.map((metric) => metric.value));
  if (!Number.isFinite(value) || Math.abs(value) > 1e18) return null;
  return {
    value,
    asOf: inputs[0].asOf,
    periodType: "최근 분기 계산",
    currency: details.ratio ? null : inputs[0].currency,
    calculated: true,
    formula: details.formula || null
  };
}

export function parseYahooBalanceSheet(payload = {}) {
  const direct = {
    totalAssets: latestMetric(payload, "quarterlyTotalAssets"),
    currentAssets: latestMetric(payload, "quarterlyCurrentAssets"),
    nonCurrentAssets: latestMetric(payload, "quarterlyTotalNonCurrentAssets"),
    currentLiabilities: latestMetric(payload, "quarterlyCurrentLiabilities"),
    nonCurrentLiabilities: latestMetric(payload, "quarterlyTotalNonCurrentLiabilitiesNetMinorityInterest"),
    totalLiabilities: latestMetric(payload, "quarterlyTotalLiabilitiesNetMinorityInterest"),
    accountsReceivable: latestMetric(payload, "quarterlyAccountsReceivable")
      || latestMetric(payload, "quarterlyReceivables"),
    inventory: latestMetric(payload, "quarterlyInventory"),
    cashAndShortTermInvestments: latestMetric(payload, "quarterlyCashCashEquivalentsAndShortTermInvestments"),
    cashAndCashEquivalents: latestMetric(payload, "quarterlyCashAndCashEquivalents"),
    shortTermInvestments: latestMetric(payload, "quarterlyOtherShortTermInvestments"),
    payables: latestMetric(payload, "quarterlyPayables"),
    accountsPayable: latestMetric(payload, "quarterlyAccountsPayable"),
    totalDebt: latestMetric(payload, "quarterlyTotalDebt"),
    stockholdersEquity: latestMetric(payload, "quarterlyStockholdersEquity")
  };
  const quickAssets = calculateAlignedMetric(
    [direct.cashAndShortTermInvestments, direct.accountsReceivable],
    (cash, receivables) => cash + receivables,
    { formula: "현금·현금성자산·단기투자 + 매출채권" }
  );
  return {
    ...EMPTY_BALANCE_SHEET_METRICS,
    ...direct,
    quickAssets,
    workingCapital: calculateAlignedMetric(
      [direct.currentAssets, direct.currentLiabilities],
      (assets, liabilities) => assets - liabilities,
      { formula: "유동자산 - 유동부채" }
    ),
    currentRatio: calculateAlignedMetric(
      [direct.currentAssets, direct.currentLiabilities],
      (assets, liabilities) => liabilities > 0 ? (assets / liabilities) * 100 : Number.NaN,
      { ratio: true, formula: "유동자산 ÷ 유동부채 × 100" }
    ),
    quickRatio: calculateAlignedMetric(
      [quickAssets, direct.currentLiabilities],
      (assets, liabilities) => liabilities > 0 ? (assets / liabilities) * 100 : Number.NaN,
      { ratio: true, formula: "계산 당좌자산 ÷ 유동부채 × 100" }
    ),
    debtRatio: calculateAlignedMetric(
      [direct.totalLiabilities, direct.stockholdersEquity],
      (liabilities, equity) => equity > 0 ? (liabilities / equity) * 100 : Number.NaN,
      { ratio: true, formula: "총부채 ÷ 자기자본 × 100" }
    )
  };
}

