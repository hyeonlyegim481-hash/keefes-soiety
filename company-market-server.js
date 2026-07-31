import { futureCompanies } from "./future-industry-data.js";
import { buildMarketRecord } from "./market-data.js";
import {
  YAHOO_FUNDAMENTAL_TYPES,
  countFundamentalMetrics,
  parseAlphaVantageFundamentals,
  parseNaverFundamentals,
  parseYahooFundamentals
} from "./company-fundamentals.js";
import {
  describeCompanyProviderPlan,
  getCompanyMarketConfig,
  getCompanyProviderSymbol,
  parseAlphaVantageSeries,
  parseNaverDailySeries,
  parseTwelveDataSeries
} from "./company-market-data.js";

const REQUEST_TIMEOUT_MS = 4_500;
const CACHE_TTL_MS = 10 * 60_000;
const STALE_CACHE_MS = 24 * 60 * 60_000;
const CHART_RANGE = "5y";
const CHART_INTERVAL = "1d";
const CHART_MAX_POINTS = 1_320;

const companyById = new Map(futureCompanies.map((company) => [company.id, company]));
const companyMarketCache = new Map();
const companyMarketPromises = new Map();

export function isKnownCompanyId(value) {
  return companyById.has(String(value || "").trim());
}

export function getCompanyPublicIdentity(company = {}) {
  return {
    id: company.id,
    name: company.name,
    ticker: company.ticker,
    country: company.country,
    sectorId: company.sectorId
  };
}

function makeHttpError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function sanitizeProviderFailure(error) {
  const message = String(error?.message || "");
  if (error?.name === "TimeoutError" || /timeout|시간 초과/i.test(message)) {
    return "응답 시간 초과";
  }
  const httpStatus = message.match(/HTTP\s+(\d{3})/i)?.[1];
  if (httpStatus) return `HTTP ${httpStatus}`;
  if (/no daily series|no chart result|no usable prices|no data/i.test(message)) {
    return "사용 가능한 일별 시세 없음";
  }
  if (/rate|limit|frequency|credit/i.test(message)) return "제공처 호출 한도";
  return "응답 형식 또는 연결 오류";
}

function finiteOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function requestExternal(url, accept, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(url, {
    headers: {
      accept,
      "user-agent": "Mozilla/5.0 keefes-society/0.1"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
  return response;
}

function buildCompanyMarketRecord({
  company,
  provider,
  symbol,
  timestamps,
  closes,
  meta = {},
  fetchedAt,
  chartRange = CHART_RANGE,
  sourceUrl,
  forceDailyClose = false
}) {
  const config = {
    ...getCompanyMarketConfig(company),
    symbol
  };
  const market = buildMarketRecord({
    item: config,
    meta,
    timestamps,
    closes,
    now: Date.parse(fetchedAt),
    fetchedAt,
    chartRange,
    chartInterval: CHART_INTERVAL,
    maxSeriesPoints: CHART_MAX_POINTS
  });
  return {
    ...market,
    providerId: provider.id,
    providerLabel: provider.label,
    providerRole: provider.role,
    fallbackUsed: provider.role !== "primary",
    chartSource: provider.label,
    source: provider.label,
    sourceUrl,
    statistics: {
      dayHigh: finiteOrNull(meta?.regularMarketDayHigh),
      dayLow: finiteOrNull(meta?.regularMarketDayLow),
      volume: finiteOrNull(meta?.regularMarketVolume),
      week52High: finiteOrNull(meta?.fiftyTwoWeekHigh),
      week52Low: finiteOrNull(meta?.fiftyTwoWeekLow)
    },
    ...(forceDailyClose
      ? {
          live: false,
          marketOpen: null,
          status: "delayed",
          marketStateLabel: "일별 마감 자료",
          delayed: true
        }
      : {})
  };
}

async function fetchYahooCompany(company, hostname, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "yahoo");
  if (!symbol) throw new Error("No Yahoo symbol");
  const endpoint = `https://${hostname}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${CHART_RANGE}&interval=${CHART_INTERVAL}&includePrePost=false`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  if (!result) throw new Error("No chart result");
  const provider = {
    id: hostname.startsWith("query1") ? "yahoo-primary" : "yahoo-secondary",
    label: hostname.startsWith("query1") ? "Yahoo Finance" : "Yahoo Finance 보조 호스트",
    role: hostname.startsWith("query1") ? "primary" : "secondary-host"
  };
  return buildCompanyMarketRecord({
    company,
    provider,
    symbol,
    timestamps: result.timestamp || [],
    closes: result.indicators?.quote?.[0]?.close || [],
    meta: result.meta || {},
    fetchedAt: new Date(now).toISOString(),
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`
  });
}

function formatNaverDate(timestamp) {
  const date = new Date(timestamp);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("");
}

async function fetchNaverCompany(company, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "naver");
  if (!symbol) throw new Error("No Naver symbol");
  const start = formatNaverDate(now - 5 * 366 * 24 * 60 * 60_000);
  const end = formatNaverDate(now + 24 * 60 * 60_000);
  const endpoint = `https://api.finance.naver.com/siseJson.naver?symbol=${encodeURIComponent(symbol)}&requestType=1&startTime=${start}&endTime=${end}&timeframe=day`;
  const response = await requestExternal(endpoint, "text/plain", fetchImpl);
  const parsed = parseNaverDailySeries(await response.text());
  if (parsed.timestamps.length < 2) throw new Error("No daily series");
  const lastIndex = parsed.closes.length - 1;
  return buildCompanyMarketRecord({
    company,
    provider: { id: "naver-finance", label: "네이버 금융", role: "alternate" },
    symbol,
    ...parsed,
    meta: {
      currency: "KRW",
      exchangeTimezoneName: "Asia/Seoul",
      exchangeDataDelayedBy: 20,
      regularMarketPrice: parsed.closes[lastIndex],
      regularMarketTime: parsed.timestamps[lastIndex]
    },
    fetchedAt: new Date(now).toISOString(),
    sourceUrl: `https://finance.naver.com/item/main.naver?code=${encodeURIComponent(symbol)}`,
    forceDailyClose: true
  });
}

async function fetchTwelveDataCompany(company, apiKey, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "twelve-data");
  if (!symbol) throw new Error("No Twelve Data symbol");
  const endpoint = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${CHART_MAX_POINTS}&order=asc&apikey=${encodeURIComponent(apiKey)}`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const parsed = parseTwelveDataSeries(await response.json());
  if (parsed.timestamps.length < 2) throw new Error("No daily series");
  const lastIndex = parsed.closes.length - 1;
  return buildCompanyMarketRecord({
    company,
    provider: { id: "twelve-data", label: "Twelve Data", role: "alternate" },
    symbol,
    ...parsed,
    meta: {
      ...parsed.meta,
      regularMarketPrice: parsed.closes[lastIndex],
      regularMarketTime: parsed.timestamps[lastIndex]
    },
    fetchedAt: new Date(now).toISOString(),
    sourceUrl: "https://twelvedata.com/",
    forceDailyClose: true
  });
}

async function fetchAlphaVantageCompany(company, apiKey, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "alpha-vantage");
  if (!symbol) throw new Error("No Alpha Vantage symbol");
  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${encodeURIComponent(apiKey)}`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const parsed = parseAlphaVantageSeries(await response.json());
  if (parsed.timestamps.length < 2) throw new Error("No daily series");
  const lastIndex = parsed.closes.length - 1;
  return buildCompanyMarketRecord({
    company,
    provider: { id: "alpha-vantage", label: "Alpha Vantage", role: "alternate" },
    symbol,
    ...parsed,
    meta: {
      ...parsed.meta,
      regularMarketPrice: parsed.closes[lastIndex],
      regularMarketTime: parsed.timestamps[lastIndex]
    },
    fetchedAt: new Date(now).toISOString(),
    chartRange: "최근 100거래일",
    sourceUrl: "https://www.alphavantage.co/",
    forceDailyClose: true
  });
}

function withFundamentalSource(parsed, provider, sourceUrl, now) {
  if (!parsed?.available || countFundamentalMetrics(parsed.metrics) < 2) {
    throw new Error("No usable fundamental metrics");
  }
  return {
    ...parsed,
    providerId: provider.id,
    providerLabel: provider.label,
    providerRole: provider.role,
    fallbackUsed: provider.role !== "primary",
    sourceUrl,
    collectedAt: new Date(now).toISOString(),
    cacheState: "live"
  };
}

async function fetchYahooFundamentals(company, hostname, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "yahoo");
  if (!symbol) throw new Error("No Yahoo symbol");
  const period1 = Math.floor((now - 3 * 366 * 24 * 60 * 60_000) / 1000);
  const period2 = Math.floor((now + 24 * 60 * 60_000) / 1000);
  const endpoint = `https://${hostname}/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?symbol=${encodeURIComponent(symbol)}&type=${YAHOO_FUNDAMENTAL_TYPES.join(",")}&merge=false&period1=${period1}&period2=${period2}`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const parsed = parseYahooFundamentals(await response.json());
  const primary = hostname.startsWith("query2");
  return withFundamentalSource(
    parsed,
    {
      id: primary ? "yahoo-fundamentals" : "yahoo-fundamentals-secondary",
      label: primary ? "Yahoo Finance 재무 시계열" : "Yahoo Finance 재무 보조 호스트",
      role: primary ? "primary" : "secondary-host"
    },
    `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/key-statistics`,
    now
  );
}

async function fetchNaverFundamentals(company, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "naver");
  if (!symbol) throw new Error("No Naver symbol");
  const endpoint = `https://m.stock.naver.com/api/stock/${encodeURIComponent(symbol)}/integration`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const parsed = parseNaverFundamentals(await response.json());
  return withFundamentalSource(
    parsed,
    { id: "naver-fundamentals", label: "네이버 증권 기업지표", role: "alternate" },
    `https://m.stock.naver.com/domestic/stock/${encodeURIComponent(symbol)}/total`,
    now
  );
}

async function fetchAlphaVantageFundamentals(company, apiKey, fetchImpl, now) {
  const symbol = getCompanyProviderSymbol(company, "alpha-vantage");
  if (!symbol) throw new Error("No Alpha Vantage symbol");
  const endpoint = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await requestExternal(endpoint, "application/json", fetchImpl);
  const parsed = parseAlphaVantageFundamentals(await response.json());
  return withFundamentalSource(
    parsed,
    { id: "alpha-vantage-fundamentals", label: "Alpha Vantage 기업개요", role: "alternate" },
    "https://www.alphavantage.co/",
    now
  );
}

export function describeCompanyFundamentalProviderPlan(company = {}, environment = {}) {
  const plan = [
    { id: "yahoo-fundamentals", label: "Yahoo Finance 재무 시계열", enabled: true }
  ];
  if (company.country === "한국" && getCompanyProviderSymbol(company, "naver")) {
    plan.push({ id: "naver-fundamentals", label: "네이버 증권 기업지표", enabled: true });
  }
  plan.push({
    id: "alpha-vantage-fundamentals",
    label: "Alpha Vantage 기업개요",
    enabled: Boolean(environment.ALPHA_VANTAGE_API_KEY)
  });
  plan.push({
    id: "yahoo-fundamentals-secondary",
    label: "Yahoo Finance 재무 보조 호스트",
    enabled: true
  });
  return plan;
}

export function buildCompanyFundamentalProviders(
  company,
  {
    environment = process.env,
    fetchImpl = globalThis.fetch,
    now = Date.now()
  } = {}
) {
  const providers = [
    {
      id: "yahoo-fundamentals",
      label: "Yahoo Finance 재무 시계열",
      load: () => fetchYahooFundamentals(company, "query2.finance.yahoo.com", fetchImpl, now)
    }
  ];
  if (company.country === "한국" && getCompanyProviderSymbol(company, "naver")) {
    providers.push({
      id: "naver-fundamentals",
      label: "네이버 증권 기업지표",
      load: () => fetchNaverFundamentals(company, fetchImpl, now)
    });
  }
  if (environment.ALPHA_VANTAGE_API_KEY) {
    providers.push({
      id: "alpha-vantage-fundamentals",
      label: "Alpha Vantage 기업개요",
      load: () => fetchAlphaVantageFundamentals(
        company,
        environment.ALPHA_VANTAGE_API_KEY,
        fetchImpl,
        now
      )
    });
  }
  providers.push({
    id: "yahoo-fundamentals-secondary",
    label: "Yahoo Finance 재무 보조 호스트",
    load: () => fetchYahooFundamentals(company, "query1.finance.yahoo.com", fetchImpl, now)
  });
  return providers;
}

export async function loadCompanyFundamentalsFromProviders(providers = []) {
  const attempts = [];
  for (const provider of providers) {
    try {
      const fundamentals = await provider.load();
      if (!fundamentals?.available || countFundamentalMetrics(fundamentals.metrics) < 2) {
        throw new Error("No usable fundamental metrics");
      }
      attempts.push({ id: provider.id, label: provider.label, status: "success" });
      return { fundamentals, attempts };
    } catch (error) {
      attempts.push({
        id: provider.id,
        label: provider.label,
        status: "failed",
        reason: sanitizeProviderFailure(error)
      });
    }
  }
  return { fundamentals: null, attempts };
}

function resolveCompanyFundamentals(result, cached, now, providerPlan) {
  if (result.fundamentals) return result.fundamentals;
  const cachedFundamentals = cached?.payload?.fundamentals;
  if (
    cachedFundamentals?.available
    && now - cached.createdAt < STALE_CACHE_MS
  ) {
    const ageMinutes = Math.max(0, Math.round((now - cached.createdAt) / 60_000));
    return {
      ...cachedFundamentals,
      cacheState: "last-known",
      warning: `현재 기업지표 제공처에 연결하지 못해 약 ${ageMinutes}분 전 정상 자료를 표시합니다.`
    };
  }
  return {
    available: false,
    metrics: {},
    metricCount: 0,
    providerLabel: null,
    sourceUrl: null,
    collectedAt: null,
    cacheState: "unavailable",
    reason: "기업 가치평가 자료를 가져오지 못했습니다.",
    providerPlan
  };
}

export function buildCompanyMarketProviders(
  company,
  {
    environment = process.env,
    fetchImpl = globalThis.fetch,
    now = Date.now()
  } = {}
) {
  const providers = [
    {
      id: "yahoo-primary",
      label: "Yahoo Finance",
      load: () => fetchYahooCompany(company, "query1.finance.yahoo.com", fetchImpl, now)
    }
  ];
  if (company.country === "한국" && getCompanyProviderSymbol(company, "naver")) {
    providers.push({
      id: "naver-finance",
      label: "네이버 금융",
      load: () => fetchNaverCompany(company, fetchImpl, now)
    });
  } else {
    if (environment.TWELVE_DATA_API_KEY) {
      providers.push({
        id: "twelve-data",
        label: "Twelve Data",
        load: () => fetchTwelveDataCompany(
          company,
          environment.TWELVE_DATA_API_KEY,
          fetchImpl,
          now
        )
      });
    }
    if (environment.ALPHA_VANTAGE_API_KEY) {
      providers.push({
        id: "alpha-vantage",
        label: "Alpha Vantage",
        load: () => fetchAlphaVantageCompany(
          company,
          environment.ALPHA_VANTAGE_API_KEY,
          fetchImpl,
          now
        )
      });
    }
  }
  providers.push({
    id: "yahoo-secondary",
    label: "Yahoo Finance 보조 호스트",
    load: () => fetchYahooCompany(company, "query2.finance.yahoo.com", fetchImpl, now)
  });
  return providers;
}

export async function loadCompanyMarketFromProviders(providers = []) {
  const attempts = [];
  for (const provider of providers) {
    try {
      const market = await provider.load();
      if (
        !Number.isFinite(Number(market?.value))
        || !Array.isArray(market?.series)
        || market.series.length < 2
      ) {
        throw new Error("No usable prices");
      }
      attempts.push({ id: provider.id, label: provider.label, status: "success" });
      return { market, attempts };
    } catch (error) {
      attempts.push({
        id: provider.id,
        label: provider.label,
        status: "failed",
        reason: sanitizeProviderFailure(error)
      });
    }
  }
  return { market: null, attempts };
}

function stalePayload(record, attempts, now, providerPlan) {
  const ageMinutes = Math.max(0, Math.round((now - record.createdAt) / 60_000));
  return {
    ...record.payload,
    cacheState: "last-known",
    servedAt: new Date(now).toISOString(),
    warning: `현재 제공처에 연결하지 못해 마지막 정상 자료를 표시합니다. 약 ${ageMinutes}분 전 수집 자료입니다.`,
    attempts,
    providerPlan,
    market: {
      ...record.payload.market,
      live: false,
      delayed: true,
      status: "stale",
      marketStateLabel: "마지막 정상 자료",
      dataAgeMinutes: ageMinutes
    }
  };
}

export async function getCompanyMarket(companyId, options = {}) {
  const id = String(companyId || "").trim();
  const company = companyById.get(id);
  if (!company) throw makeHttpError("확인할 수 없는 기업입니다.", 404, "unknown-company");

  const now = Number(options.now) || Date.now();
  const cached = companyMarketCache.get(id);
  if (!options.force && cached && now - cached.createdAt < CACHE_TTL_MS) {
    return {
      ...cached.payload,
      cacheState: "fresh-cache",
      servedAt: new Date(now).toISOString()
    };
  }
  if (!options.force && companyMarketPromises.has(id)) {
    return companyMarketPromises.get(id);
  }

  const promise = (async () => {
    const environment = options.environment || process.env;
    const fetchImpl = options.fetchImpl || globalThis.fetch;
    const providerPlan = describeCompanyProviderPlan(company, environment);
    const providers = options.providers || buildCompanyMarketProviders(company, {
      environment,
      fetchImpl,
      now
    });
    const fundamentalProviderPlan = describeCompanyFundamentalProviderPlan(company, environment);
    const fundamentalProviders = Object.hasOwn(options, "fundamentalProviders")
      ? options.fundamentalProviders
      : options.providers
        ? []
        : buildCompanyFundamentalProviders(company, { environment, fetchImpl, now });
    const [result, fundamentalResult] = await Promise.all([
      loadCompanyMarketFromProviders(providers),
      loadCompanyFundamentalsFromProviders(fundamentalProviders)
    ]);
    const fundamentals = resolveCompanyFundamentals(
      fundamentalResult,
      cached,
      now,
      fundamentalProviderPlan
    );
    if (result.market) {
      const payload = {
        available: true,
        company: getCompanyPublicIdentity(company),
        market: result.market,
        fundamentals,
        attempts: result.attempts,
        providerPlan,
        fundamentalAttempts: fundamentalResult.attempts,
        fundamentalProviderPlan,
        cacheState: "live",
        collectedAt: new Date(now).toISOString(),
        servedAt: new Date(now).toISOString()
      };
      companyMarketCache.set(id, { createdAt: now, payload });
      return payload;
    }

    if (cached && now - cached.createdAt < STALE_CACHE_MS) {
      return stalePayload(cached, result.attempts, now, providerPlan);
    }
    return {
      available: false,
      company: getCompanyPublicIdentity(company),
      reason: "모든 시세 제공처에서 자료를 가져오지 못했습니다.",
      fundamentals,
      attempts: result.attempts,
      providerPlan,
      fundamentalAttempts: fundamentalResult.attempts,
      fundamentalProviderPlan,
      cacheState: "unavailable",
      collectedAt: null,
      servedAt: new Date(now).toISOString()
    };
  })();

  if (!options.force) companyMarketPromises.set(id, promise);
  try {
    return await promise;
  } finally {
    if (companyMarketPromises.get(id) === promise) companyMarketPromises.delete(id);
  }
}

export function clearCompanyMarketCache() {
  companyMarketCache.clear();
  companyMarketPromises.clear();
}

