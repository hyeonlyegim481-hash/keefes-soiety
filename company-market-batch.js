import { futureCompanies } from "./future-industry-data.js";
import { getCompanyMarket } from "./company-market-server.js";

const MAX_COMPANIES_PER_BATCH = 6;
const knownCompanyIds = new Set(futureCompanies.map((company) => company.id));

export function normalizeCompanyMarketIds(value, limit = MAX_COMPANIES_PER_BATCH) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
    .filter((id) => knownCompanyIds.has(id))
    .slice(0, Math.max(0, limit));
}

export function compactCompanyMarketPayload(payload = {}) {
  const market = payload.market || null;
  const compactMarket = market ? Object.fromEntries([
    "value",
    "previousClose",
    "change",
    "changePercent",
    "changeAvailable",
    "direction",
    "quoteCurrency",
    "unit",
    "tradingDate",
    "asOf",
    "marketStateLabel",
    "providerId",
    "providerLabel",
    "source",
    "sourceUrl",
    "dataDelayLabel"
  ].filter((key) => market[key] !== undefined).map((key) => [key, market[key]])) : null;
  return {
    available: Boolean(payload.available),
    company: payload.company || null,
    market: compactMarket,
    fundamentals: payload.fundamentals || null,
    warning: payload.warning || null,
    cacheState: payload.cacheState || null,
    collectedAt: payload.collectedAt || null,
    servedAt: payload.servedAt || null
  };
}

export async function getCompanyMarketBatch(
  value,
  { loader = getCompanyMarket, now = Date.now() } = {}
) {
  const requestedIds = normalizeCompanyMarketIds(value);
  const entries = await Promise.all(requestedIds.map(async (id) => {
    try {
      return [id, { ok: true, payload: compactCompanyMarketPayload(await loader(id)) }];
    } catch (error) {
      return [id, {
        ok: false,
        error: "기업 자료를 가져오지 못했습니다.",
        code: error?.code || "company-market-failed"
      }];
    }
  }));
  return {
    requestedIds,
    companies: Object.fromEntries(entries),
    servedAt: new Date(now).toISOString()
  };
}

