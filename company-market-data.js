const YAHOO_SYMBOL_OVERRIDES = Object.freeze({
  abb: "ABBN.SW",
  catl: "300750.SZ",
  roche: "ROG.SW",
  siemens: "SIE.DE",
  "schneider-electric": "SU.PA",
  veolia: "VIE.PA",
  mediatek: "2454.TW",
  bmw: "BMW.DE",
  "mercedes-benz": "MBG.DE",
  vestas: "VWS.CO",
  "siemens-energy": "ENR.DE"
});

const SYMBOL_SUFFIX_META = Object.freeze([
  [".KS", { currency: "KRW", timezone: "Asia/Seoul" }],
  [".KQ", { currency: "KRW", timezone: "Asia/Seoul" }],
  [".T", { currency: "JPY", timezone: "Asia/Tokyo" }],
  [".TW", { currency: "TWD", timezone: "Asia/Taipei" }],
  [".SZ", { currency: "CNY", timezone: "Asia/Shanghai" }],
  [".SS", { currency: "CNY", timezone: "Asia/Shanghai" }],
  [".HK", { currency: "HKD", timezone: "Asia/Hong_Kong" }],
  [".SW", { currency: "CHF", timezone: "Europe/Zurich" }],
  [".DE", { currency: "EUR", timezone: "Europe/Berlin" }],
  [".PA", { currency: "EUR", timezone: "Europe/Paris" }],
  [".AS", { currency: "EUR", timezone: "Europe/Amsterdam" }],
  [".CO", { currency: "DKK", timezone: "Europe/Copenhagen" }]
]);

const COUNTRY_MARKET_META = Object.freeze({
  한국: { currency: "KRW", timezone: "Asia/Seoul" },
  미국: { currency: "USD", timezone: "America/New_York" },
  대만: { currency: "USD", timezone: "America/New_York" },
  일본: { currency: "JPY", timezone: "Asia/Tokyo" },
  중국: { currency: "CNY", timezone: "Asia/Shanghai" },
  스위스: { currency: "CHF", timezone: "Europe/Zurich" },
  독일: { currency: "EUR", timezone: "Europe/Berlin" },
  프랑스: { currency: "EUR", timezone: "Europe/Paris" },
  네덜란드: { currency: "USD", timezone: "America/New_York" },
  덴마크: { currency: "USD", timezone: "America/New_York" },
  영국: { currency: "USD", timezone: "America/New_York" },
  아일랜드: { currency: "USD", timezone: "America/New_York" },
  이스라엘: { currency: "USD", timezone: "America/New_York" }
});

function compactTicker(value) {
  return String(value || "")
    .split(/[·,/]/)[0]
    .trim()
    .toUpperCase();
}

export function getCompanyProviderSymbol(company = {}, provider = "yahoo") {
  const ticker = compactTicker(company.ticker);
  if (!ticker) return "";
  if (provider === "naver") {
    return company.country === "한국" && /^[0-9A-Z]{6}$/.test(ticker) ? ticker : "";
  }
  if (provider === "alpha-vantage" || provider === "twelve-data") {
    return getCompanyProviderSymbol(company, "yahoo");
  }
  if (YAHOO_SYMBOL_OVERRIDES[company.id]) return YAHOO_SYMBOL_OVERRIDES[company.id];
  if (company.country === "한국" && /^[0-9A-Z]{6}$/.test(ticker)) return `${ticker}.KS`;
  if (company.country === "일본" && /^\d{4}$/.test(ticker)) return `${ticker}.T`;
  if (company.id === "byd" && ticker.endsWith(".HK")) return ticker;
  return ticker;
}

export function getCompanyMarketConfig(company = {}) {
  const symbol = getCompanyProviderSymbol(company, "yahoo");
  const suffixMeta = SYMBOL_SUFFIX_META.find(([suffix]) => symbol.endsWith(suffix))?.[1];
  const marketMeta = suffixMeta
    || (/^[A-Z][A-Z0-9-]*$/.test(symbol)
      ? { currency: "USD", timezone: "America/New_York" }
      : COUNTRY_MARKET_META[company.country] || { currency: "USD", timezone: "UTC" });
  return {
    id: company.id,
    name: company.name,
    symbol,
    unit: marketMeta.currency,
    displayUnit: marketMeta.currency,
    quoteCurrency: marketMeta.currency,
    instrumentType: "equity",
    instrumentLabel: "상장주식",
    fallbackTimezone: marketMeta.timezone,
    allowZero: false,
    maxIsolatedChangePercent: 55,
    maxDailyChangePercent: 85,
    minimumChartRangePercent: 3
  };
}

function toUnixSeconds(dateText) {
  const value = String(dateText || "").trim();
  const matched = value.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  if (!matched) return null;
  const timestamp = Date.UTC(
    Number(matched[1]),
    Number(matched[2]) - 1,
    Number(matched[3]),
    12
  );
  return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : null;
}

export function parseNaverDailySeries(text = "") {
  const timestamps = [];
  const closes = [];
  const pattern = /\[\s*"(\d{8})"\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/g;
  let match;
  while ((match = pattern.exec(String(text)))) {
    const timestamp = toUnixSeconds(match[1]);
    const close = Number(match[5]);
    if (!Number.isFinite(timestamp) || !Number.isFinite(close) || close <= 0) continue;
    timestamps.push(timestamp);
    closes.push(close);
  }
  return { timestamps, closes };
}

export function parseTwelveDataSeries(payload = {}) {
  if (payload?.status === "error" || !Array.isArray(payload?.values)) {
    throw new Error(payload?.message || "Twelve Data returned no daily series");
  }
  const rows = payload.values
    .map((row) => ({ timestamp: toUnixSeconds(row?.datetime), close: Number(row?.close) }))
    .filter((row) => Number.isFinite(row.timestamp) && Number.isFinite(row.close) && row.close > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
  return {
    timestamps: rows.map((row) => row.timestamp),
    closes: rows.map((row) => row.close),
    meta: {
      currency: payload?.meta?.currency || null,
      exchangeTimezoneName: payload?.meta?.exchange_timezone || null,
      shortName: payload?.meta?.symbol || null
    }
  };
}

export function parseAlphaVantageSeries(payload = {}) {
  const series = payload?.["Time Series (Daily)"];
  if (!series || typeof series !== "object") {
    throw new Error(
      payload?.Note
      || payload?.Information
      || payload?.["Error Message"]
      || "Alpha Vantage returned no daily series"
    );
  }
  const rows = Object.entries(series)
    .map(([date, row]) => ({
      timestamp: toUnixSeconds(date),
      close: Number(row?.["4. close"])
    }))
    .filter((row) => Number.isFinite(row.timestamp) && Number.isFinite(row.close) && row.close > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
  return {
    timestamps: rows.map((row) => row.timestamp),
    closes: rows.map((row) => row.close),
    meta: {
      shortName: payload?.["Meta Data"]?.["2. Symbol"] || null,
      exchangeTimezoneName: payload?.["Meta Data"]?.["5. Time Zone"] || null
    }
  };
}

export function describeCompanyProviderPlan(company = {}, environment = {}) {
  const plan = [
    { id: "yahoo-primary", label: "Yahoo Finance 기본", enabled: true },
    { id: "yahoo-secondary", label: "Yahoo Finance 보조 호스트", enabled: true }
  ];
  if (company.country === "한국" && getCompanyProviderSymbol(company, "naver")) {
    plan.push({ id: "naver-finance", label: "네이버 금융 보조", enabled: true });
  }
  plan.push({
    id: "twelve-data",
    label: "Twelve Data 보조",
    enabled: Boolean(environment.TWELVE_DATA_API_KEY)
  });
  plan.push({
    id: "alpha-vantage",
    label: "Alpha Vantage 보조",
    enabled: Boolean(environment.ALPHA_VANTAGE_API_KEY)
  });
  return plan;
}
