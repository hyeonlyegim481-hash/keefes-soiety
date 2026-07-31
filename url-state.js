export const URL_STATE_EVENT = "keefes:url-state";

export const CHAPTER_IDS = Object.freeze([
  "brief",
  "dashboard",
  "markets",
  "companies",
  "korea",
  "indicators",
  "future",
  "study",
  "news",
  "politics",
  "glossary",
  "quiz",
  "resources"
]);

export const URL_STATE_VALUES = Object.freeze({
  market: Object.freeze(["kospi", "kosdaq", "usdkrw", "sp500", "nasdaq", "vix", "wti", "gold"]),
  marketView: Object.freeze(["summary", "chart", "deep"]),
  company: Object.freeze([
    "nvidia", "tsmc", "samsung-electronics", "sk-hynix", "microsoft", "alphabet",
    "tesla", "lg-energy-solution", "eli-lilly", "samsung-biologics", "abb",
    "doosan-enerbility", "amd", "asml", "amazon", "meta", "catl", "hyundai-motor",
    "novo-nordisk", "siemens", "ge-vernova", "palo-alto", "ibm", "xylem",
    "broadcom", "micron", "arm", "applied-materials", "oracle", "salesforce",
    "sap", "servicenow", "byd", "panasonic", "samsung-sdi", "toyota", "roche",
    "johnson-johnson", "astrazeneca", "celltrion", "fanuc", "rockwell", "keyence",
    "yaskawa", "schneider-electric", "eaton", "ls-electric", "hd-hyundai-electric",
    "crowdstrike", "fortinet", "cloudflare", "okta", "ionq", "rigetti", "dwave",
    "mobileye", "aptiv", "denso", "veolia", "ecolab"
  ]),
  companyView: Object.freeze(["overview", "chart", "financials", "news"]),
  indicator: Object.freeze([
    "fertility",
    "population-growth",
    "older-population",
    "life-expectancy",
    "gdp-per-capita",
    "gdp-growth",
    "manufacturing-share",
    "trade-share",
    "unemployment",
    "labor-participation",
    "female-participation",
    "youth-unemployment",
    "health-spending",
    "infant-mortality",
    "physicians",
    "under-five-mortality",
    "tertiary-enrollment",
    "research-development",
    "internet-use",
    "high-tech-exports",
    "co2-per-capita",
    "renewable-energy",
    "energy-use",
    "pm25",
    "gini",
    "urban-population",
    "fixed-broadband",
    "women-parliament",
    "consumer-inflation",
    "real-interest-rate",
    "private-credit",
    "broad-money",
    "market-capitalization",
    "current-account",
    "fdi-inflows",
    "reserve-cover",
    "capital-formation",
    "domestic-savings",
    "dependency-ratio",
    "net-migration",
    "gdp-per-capita-ppp",
    "services-share",
    "employment-population",
    "female-employment-rate",
    "labor-productivity",
    "out-of-pocket-health",
    "hospital-beds",
    "resident-patents",
    "renewable-electricity",
    "energy-intensity",
    "forest-area",
    "mobile-subscriptions",
    "homicide-rate",
    "imports-share",
    "exports-share",
    "fdi-outflows",
    "tax-revenue",
    "logistics-performance",
    "production-iron-ore",
    "production-copper",
    "production-lithium",
    "production-nickel",
    "production-cobalt",
    "production-rare-earths"
  ]),
  indicatorView: Object.freeze(["explorer", "compare"]),
  study: Object.freeze(["today", "connections", "lab", "history"]),
  future: Object.freeze(["industries", "climate", "outlook"]),
  industry: Object.freeze([
    "ai-chips",
    "ai-platforms",
    "battery-mobility",
    "bio-health",
    "automation",
    "energy-infra",
    "cybersecurity",
    "quantum-computing",
    "autonomous-logistics",
    "climate-resilience"
  ]),
  politics: Object.freeze(["overview", "laws", "countries", "news"]),
  country: Object.freeze(["korea", "us", "china", "japan", "russia", "eu", "india"]),
  news: Object.freeze([
    "all",
    "korea",
    "industry",
    "households",
    "politics",
    "security-disasters",
    "disasters-climate",
    "us",
    "china-asia",
    "japan-asia",
    "europe-global",
    "commodities-fx",
    "fx-bonds"
  ])
});

const DEFAULTS = Object.freeze({
  market: "kospi",
  marketView: "summary",
  company: "samsung-electronics",
  companyView: "overview",
  indicator: "fertility",
  indicatorView: "explorer",
  study: "today",
  future: "industries",
  industry: "ai-chips",
  politics: "overview",
  country: "korea",
  news: "all"
});

function asSearchParams(input) {
  if (input instanceof URLSearchParams) return new URLSearchParams(input);
  if (input instanceof URL) return new URLSearchParams(input.searchParams);
  if (typeof input === "string") {
    try {
      return new URL(input, "https://keefes.local/").searchParams;
    } catch {
      return new URLSearchParams(input);
    }
  }
  if (input && typeof input === "object") {
    const params = new URLSearchParams();
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    return params;
  }
  return new URLSearchParams();
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeUrlState(input = "") {
  const params = asSearchParams(input);
  const rawChapter = params.get("chapter") || "brief";
  const legacyHistory = rawChapter === "history";
  const legacyAnalysis = rawChapter === "analysis";
  const chapter = legacyHistory
    ? "study"
    : legacyAnalysis
      ? "markets"
      : oneOf(rawChapter, CHAPTER_IDS, "brief");
  const state = { chapter };

  if (chapter === "markets") {
    state.market = oneOf(params.get("market"), URL_STATE_VALUES.market, DEFAULTS.market);
    state.marketView = legacyAnalysis
      ? "deep"
      : oneOf(
          params.get("marketView"),
          URL_STATE_VALUES.marketView,
          DEFAULTS.marketView
        );
  } else if (chapter === "companies") {
    state.company = oneOf(params.get("company"), URL_STATE_VALUES.company, DEFAULTS.company);
    state.companyView = oneOf(
      params.get("companyView"),
      URL_STATE_VALUES.companyView,
      DEFAULTS.companyView
    );
  } else if (chapter === "indicators") {
    state.indicator = oneOf(
      params.get("indicator"),
      URL_STATE_VALUES.indicator,
      DEFAULTS.indicator
    );
    state.indicatorView = oneOf(
      params.get("indicatorView"),
      URL_STATE_VALUES.indicatorView,
      DEFAULTS.indicatorView
    );
  } else if (chapter === "study") {
    const requestedStudy = legacyHistory && !params.get("study")
      ? "history"
      : params.get("study");
    state.study = oneOf(requestedStudy, URL_STATE_VALUES.study, DEFAULTS.study);
  } else if (chapter === "future") {
    state.future = oneOf(params.get("future"), URL_STATE_VALUES.future, DEFAULTS.future);
    state.industry = oneOf(
      params.get("industry"),
      URL_STATE_VALUES.industry,
      DEFAULTS.industry
    );
  } else if (chapter === "politics") {
    state.politics = oneOf(
      params.get("politics"),
      URL_STATE_VALUES.politics,
      DEFAULTS.politics
    );
    state.country = oneOf(
      params.get("country"),
      URL_STATE_VALUES.country,
      DEFAULTS.country
    );
  } else if (chapter === "news") {
    state.news = oneOf(params.get("news"), URL_STATE_VALUES.news, DEFAULTS.news);
  }

  return state;
}

export function buildUrlForState(input, baseHref = "https://keefes.local/") {
  const state = normalizeUrlState(input);
  const url = new URL(baseHref, "https://keefes.local/");
  url.search = "";
  url.searchParams.set("chapter", state.chapter);

  if (state.chapter === "markets") {
    if (state.market !== DEFAULTS.market) url.searchParams.set("market", state.market);
    if (state.marketView !== DEFAULTS.marketView) {
      url.searchParams.set("marketView", state.marketView);
    }
  } else if (state.chapter === "companies") {
    if (state.company !== DEFAULTS.company) url.searchParams.set("company", state.company);
    if (state.companyView !== DEFAULTS.companyView) {
      url.searchParams.set("companyView", state.companyView);
    }
  } else if (state.chapter === "indicators") {
    if (state.indicator !== DEFAULTS.indicator) {
      url.searchParams.set("indicator", state.indicator);
    }
    if (state.indicatorView !== DEFAULTS.indicatorView) {
      url.searchParams.set("indicatorView", state.indicatorView);
    }
  } else if (state.chapter === "study") {
    if (state.study !== DEFAULTS.study) url.searchParams.set("study", state.study);
  } else if (state.chapter === "future") {
    if (state.future !== DEFAULTS.future) url.searchParams.set("future", state.future);
    if (state.future === "industries" && state.industry !== DEFAULTS.industry) {
      url.searchParams.set("industry", state.industry);
    }
  } else if (state.chapter === "politics") {
    if (state.politics !== DEFAULTS.politics) {
      url.searchParams.set("politics", state.politics);
    }
    if (state.politics === "countries" && state.country !== DEFAULTS.country) {
      url.searchParams.set("country", state.country);
    }
  } else if (state.chapter === "news" && state.news !== DEFAULTS.news) {
    url.searchParams.set("news", state.news);
  }

  return url;
}

export function readUrlState(locationRef = globalThis.location) {
  return normalizeUrlState(locationRef?.href || locationRef?.search || "");
}

function comparableUrl(url) {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function notifyUrlState(
  state = readUrlState(),
  { source = "external", target = globalThis } = {}
) {
  const normalized = normalizeUrlState(state);
  if (
    typeof target?.dispatchEvent === "function"
    && typeof globalThis.CustomEvent === "function"
  ) {
    target.dispatchEvent(
      new CustomEvent(URL_STATE_EVENT, {
        detail: { state: normalized, source }
      })
    );
  }
  return normalized;
}

export function subscribeUrlState(listener, target = globalThis) {
  if (typeof target?.addEventListener !== "function") return () => {};
  const handler = (event) => listener(event.detail?.state || readUrlState(), event.detail);
  target.addEventListener(URL_STATE_EVENT, handler);
  return () => target.removeEventListener(URL_STATE_EVENT, handler);
}

export function syncUrlState(
  nextState = {},
  {
    mode = "push",
    locationRef = globalThis.location,
    historyRef = globalThis.history,
    emit = true,
    source = "sync",
    target = globalThis
  } = {}
) {
  const baseHref = locationRef?.href || "https://keefes.local/";
  const current = readUrlState(locationRef);
  const requested = normalizeUrlState({
    chapter: nextState.chapter ?? current.chapter,
    ...(nextState.chapter === "history" && nextState.study === undefined
      ? { study: "history" }
      : {})
  });
  const sameChapter = requested.chapter === current.chapter;
  const candidate = {
    ...(sameChapter ? current : {}),
    ...nextState,
    chapter: requested.chapter
  };
  if (nextState.chapter === "history" && nextState.study === undefined) {
    candidate.study = "history";
  }
  if (nextState.chapter === "analysis" && nextState.marketView === undefined) {
    candidate.marketView = "deep";
  }
  const state = normalizeUrlState(candidate);
  const nextUrl = buildUrlForState(state, baseHref);
  const currentUrl = new URL(baseHref, "https://keefes.local/");
  const changed = comparableUrl(currentUrl) !== comparableUrl(nextUrl);

  if (changed && historyRef) {
    const method = mode === "replace" ? "replaceState" : "pushState";
    if (typeof historyRef[method] === "function") {
      historyRef[method]({ keefesUrlState: state }, "", nextUrl);
    }
  }
  if (emit) notifyUrlState(state, { source, target });
  return { state, changed, url: nextUrl };
}

export function canonicalizeCurrentUrl(options = {}) {
  const state = readUrlState(options.locationRef);
  return syncUrlState(state, {
    ...options,
    mode: "replace",
    source: options.source || "canonicalize"
  });
}
