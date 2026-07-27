import { createHash } from "node:crypto";

export const BLOB_VERSION_FILES = Object.freeze([
  "market.json",
  "regime.json",
  "indicators.json",
  "news-index.json",
  "data-status.json"
]);

const LATEST_PATH = "latest.json";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_VERSION_BYTES = 20 * 1024 * 1024;
const DISALLOWED_KEYS =
  /^(?:rawHtml|articleHtml|fullApiResponse|fullResponse|apiResponse|debug|debugLog|logs?|image|imageUrl|html)$/i;
const publishPromises = new Map();

export class BlobConfigurationError extends Error {
  constructor(message = "Vercel Blob is not configured") {
    super(message);
    this.name = "BlobConfigurationError";
  }
}

export class BlobVersionValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BlobVersionValidationError";
    this.details = details;
  }
}

export function getBlobConnectionStatus(env = process.env) {
  const hasReadWriteToken = Boolean(env?.BLOB_READ_WRITE_TOKEN);
  const hasOidc =
    Boolean(env?.VERCEL_OIDC_TOKEN) && Boolean(env?.BLOB_STORE_ID);
  return {
    configured: hasReadWriteToken || hasOidc,
    authMode: hasReadWriteToken ? "read-write-token" : hasOidc ? "oidc" : "none",
    hasReadWriteToken,
    hasOidc,
    access: "private"
  };
}

export function stableStringify(value) {
  return JSON.stringify(sortJsonValue(value));
}

export function normalizeBlobEtag(etag) {
  return typeof etag === "string" ? etag.replace(/^W\//, "") : etag;
}

function sortJsonValue(value) {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((key) => [key, sortJsonValue(value[key])])
  );
}

export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function selectDefined(source, keys) {
  return Object.fromEntries(
    keys
      .filter((key) => source?.[key] !== undefined)
      .map((key) => [key, source[key]])
  );
}

function cleanSeries(series) {
  const byTime = new Map();
  for (const point of Array.isArray(series) ? series : []) {
    const timestamp = Date.parse(point?.time);
    const value = Number(point?.value);
    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue;
    byTime.set(new Date(timestamp).toISOString(), value);
  }
  return [...byTime.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([time, value]) => ({ time, value }));
}

function compactMarket(market) {
  return {
    ...selectDefined(market, [
      "id",
      "entityId",
      "name",
      "symbol",
      "group",
      "value",
      "previousClose",
      "change",
      "changePercent",
      "changeAvailable",
      "changeUnavailableReason",
      "unit",
      "currency",
      "quoteDirection",
      "instrumentType",
      "instrumentLabel",
      "contractBasis",
      "asOf",
      "tradingDate",
      "exchangeTimezone",
      "exchangeTimezoneName",
      "marketOpen",
      "marketStateLabel",
      "status",
      "live",
      "delayed",
      "dataAgeMinutes",
      "source",
      "sourceUrl",
      "interval",
      "seriesStart",
      "seriesEnd",
      "recoveredFromCache",
      "cacheRecoveredAt"
    ]),
    series: cleanSeries(market?.series)
  };
}

function compactNewsEvent(headline) {
  return selectDefined(headline, [
    "id",
    "eventKey",
    "title",
    "source",
    "author",
    "publishedAt",
    "url",
    "topic",
    "section",
    "importanceLabel",
    "importanceScore",
    "sourceTier",
    "relatedSourceCount",
    "hasPrimaryCorroboration",
    "entities",
    "locationTags",
    "analysisStatus"
  ]);
}

function compactConnections(connections) {
  if (!connections || typeof connections !== "object") return null;
  return selectDefined(connections, [
    "schemaVersion",
    "generatedAt",
    "entities",
    "relations",
    "integrity"
  ]);
}

function createVersionId(generatedAt, appVersion, digest) {
  const timestamp = new Date(generatedAt);
  if (!Number.isFinite(timestamp.getTime())) {
    throw new BlobVersionValidationError("generatedAt must be a valid date");
  }
  const date = timestamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const safeVersion = String(appVersion || "dev")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dev";
  return `${date}-v${safeVersion}-${digest.slice(0, 10)}`;
}

export function buildBlobVersionBundle({
  snapshot,
  indicatorSnapshot,
  appVersion = "dev",
  collectedAt = snapshot?.generatedAt
} = {}) {
  if (!snapshot || !Array.isArray(snapshot.markets)) {
    throw new BlobVersionValidationError("snapshot markets are required");
  }
  if (!indicatorSnapshot || typeof indicatorSnapshot !== "object") {
    throw new BlobVersionValidationError("indicatorSnapshot is required");
  }

  const generatedAt = snapshot.generatedAt || collectedAt;
  const datasets = {
    "market.json": {
      markets: snapshot.markets.map(compactMarket),
      sourceDetails: snapshot.sourceDetails?.markets || null
    },
    "regime.json": {
      analysis: snapshot.analysis || null,
      economicRegimes: snapshot.analysis?.regimeResults || [],
      historicalAnalogues: snapshot.analysis?.historicalAnalogues || [],
      connections: compactConnections(snapshot.connections)
    },
    "indicators.json": {
      snapshot: indicatorSnapshot
    },
    "news-index.json": {
      events: (snapshot.headlines || []).map(compactNewsEvent)
    },
    "data-status.json": {
      generatedAt,
      collectedAt: collectedAt || generatedAt,
      appVersion: String(appVersion),
      dataQuality: snapshot.dataQuality || null,
      sources: snapshot.sources || null,
      sourceDetails: snapshot.sourceDetails || null,
      counts: {
        markets: snapshot.markets.length,
        indicators: Object.keys(indicatorSnapshot.indicators || {}).length,
        newsEvents: (snapshot.headlines || []).length
      }
    }
  };

  const logicalDigest = sha256(stableStringify(datasets));
  const version = createVersionId(generatedAt, appVersion, logicalDigest);
  const files = Object.fromEntries(
    BLOB_VERSION_FILES.map((filename) => [
      filename,
      {
        schemaVersion: 1,
        version,
        kind: filename.replace(/\.json$/, ""),
        generatedAt,
        data: datasets[filename]
      }
    ])
  );
  const bundle = {
    schemaVersion: 1,
    version,
    generatedAt,
    appVersion: String(appVersion),
    logicalDigest,
    files
  };
  validateBlobVersionBundle(bundle);
  return bundle;
}

function inspectJson(value, path = "$", seen = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!finiteNumber(value)) {
      throw new BlobVersionValidationError(`Non-finite number at ${path}`);
    }
    return;
  }
  if (typeof value !== "object") {
    throw new BlobVersionValidationError(`Unsupported value at ${path}`);
  }
  if (seen.has(value)) {
    throw new BlobVersionValidationError(`Circular value at ${path}`);
  }
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectJson(item, `${path}[${index}]`, seen));
  } else {
    Object.entries(value).forEach(([key, item]) => {
      if (DISALLOWED_KEYS.test(key)) {
        throw new BlobVersionValidationError(`Disallowed key ${key} at ${path}`);
      }
      inspectJson(item, `${path}.${key}`, seen);
    });
  }
  seen.delete(value);
}

function validateMarketDataset(payload) {
  const markets = payload?.data?.markets;
  if (!Array.isArray(markets) || !markets.length) {
    throw new BlobVersionValidationError("market.json has no markets");
  }
  const ids = new Set();
  markets.forEach((market) => {
    if (!market?.id || ids.has(market.id)) {
      throw new BlobVersionValidationError("market IDs must be present and unique");
    }
    ids.add(market.id);
    let previousTime = -Infinity;
    market.series.forEach((point) => {
      const time = Date.parse(point.time);
      if (!Number.isFinite(time) || time <= previousTime) {
        throw new BlobVersionValidationError(
          `market series must be strictly sorted for ${market.id}`
        );
      }
      previousTime = time;
    });
  });
}

function validateNewsDataset(payload) {
  const events = payload?.data?.events;
  if (!Array.isArray(events)) {
    throw new BlobVersionValidationError("news-index.json events must be an array");
  }
  const keys = new Set();
  events.forEach((event) => {
    const key = event.eventKey || event.id;
    if (!key || keys.has(key)) {
      throw new BlobVersionValidationError("news events must have unique IDs");
    }
    keys.add(key);
  });
}

export function validateBlobVersionBundle(bundle) {
  if (!bundle?.version || !bundle?.generatedAt || !bundle?.files) {
    throw new BlobVersionValidationError("Blob version envelope is incomplete");
  }
  const names = Object.keys(bundle.files).sort();
  const required = [...BLOB_VERSION_FILES].sort();
  if (stableStringify(names) !== stableStringify(required)) {
    throw new BlobVersionValidationError("Blob version file set is incomplete", {
      names,
      required
    });
  }

  let totalBytes = 0;
  for (const filename of BLOB_VERSION_FILES) {
    const payload = bundle.files[filename];
    if (
      payload?.schemaVersion !== 1 ||
      payload?.version !== bundle.version ||
      payload?.generatedAt !== bundle.generatedAt
    ) {
      throw new BlobVersionValidationError(`${filename} envelope does not match`);
    }
    inspectJson(payload);
    const bytes = Buffer.byteLength(stableStringify(payload));
    if (bytes > MAX_FILE_BYTES) {
      throw new BlobVersionValidationError(`${filename} exceeds the safe size`);
    }
    totalBytes += bytes;
  }
  if (totalBytes > MAX_VERSION_BYTES) {
    throw new BlobVersionValidationError("Blob version exceeds the safe total size");
  }
  validateMarketDataset(bundle.files["market.json"]);
  validateNewsDataset(bundle.files["news-index.json"]);
  if (!bundle.files["indicators.json"]?.data?.snapshot?.indicators) {
    throw new BlobVersionValidationError("indicators.json has no indicator data");
  }
  return { valid: true, totalBytes };
}

async function streamToText(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output += decoder.decode(value, { stream: true });
  }
  return output + decoder.decode();
}

export async function createVercelBlobAdapter({
  token = process.env.BLOB_READ_WRITE_TOKEN,
  access = "private"
} = {}) {
  const connection = getBlobConnectionStatus(process.env);
  if (!token && !connection.hasOidc) throw new BlobConfigurationError();
  const sdk = await import("@vercel/blob");
  const auth = token ? { token } : {};

  return {
    access,
    async get(pathname) {
      const result = await sdk.get(pathname, {
        access,
        useCache: false,
        ...auth,
        abortSignal: AbortSignal.timeout(10_000)
      });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      return {
        pathname,
        body: await streamToText(result.stream),
        etag: normalizeBlobEtag(result.blob.etag),
        size: result.blob.size,
        uploadedAt: result.blob.uploadedAt
      };
    },
    async put(pathname, body, options = {}) {
      const result = await sdk.put(pathname, body, {
        access,
        addRandomSuffix: false,
        allowOverwrite: options.allowOverwrite === true,
        contentType: "application/json; charset=utf-8",
        cacheControlMaxAge: pathname === LATEST_PATH ? 60 : 31_536_000,
        ...(options.ifMatch ? { ifMatch: options.ifMatch } : {}),
        ...auth,
        abortSignal: AbortSignal.timeout(15_000)
      });
      return {
        pathname: result.pathname,
        etag: result.etag,
        size: Buffer.byteLength(body),
        url: result.url
      };
    },
    isPreconditionError(error) {
      return error instanceof sdk.BlobPreconditionFailedError;
    }
  };
}

async function readJson(adapter, pathname) {
  const stored = await adapter.get(pathname);
  if (!stored) return null;
  try {
    return { ...stored, value: JSON.parse(stored.body) };
  } catch (error) {
    throw new BlobVersionValidationError(`Invalid JSON at ${pathname}`, {
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}

async function putVersionFile(adapter, pathname, payload) {
  const body = stableStringify(payload);
  const digest = sha256(body);
  const existing = await adapter.get(pathname);
  if (existing) {
    if (sha256(existing.body) !== digest) {
      throw new BlobVersionValidationError(
        `Version pathname already contains different content: ${pathname}`
      );
    }
    return {
      pathname,
      sha256: digest,
      bytes: Buffer.byteLength(body),
      etag: existing.etag,
      status: "existing"
    };
  }

  try {
    const written = await adapter.put(pathname, body, {
      allowOverwrite: false
    });
    return {
      pathname,
      sha256: digest,
      bytes: Buffer.byteLength(body),
      etag: written.etag,
      status: "written"
    };
  } catch (error) {
    const raced = await adapter.get(pathname);
    if (raced && sha256(raced.body) === digest) {
      return {
        pathname,
        sha256: digest,
        bytes: Buffer.byteLength(body),
        etag: raced.etag,
        status: "existing"
      };
    }
    throw error;
  }
}

async function verifyVersionFiles(adapter, manifest) {
  const values = {};
  for (const [filename, metadata] of Object.entries(manifest.files)) {
    const stored = await adapter.get(metadata.pathname);
    if (!stored) {
      throw new BlobVersionValidationError(
        `Version file is missing: ${metadata.pathname}`
      );
    }
    const digest = sha256(stored.body);
    const bytes = Buffer.byteLength(stored.body);
    if (digest !== metadata.sha256 || bytes !== metadata.bytes) {
      throw new BlobVersionValidationError(
        `Version file failed checksum validation: ${metadata.pathname}`
      );
    }
    values[filename] = JSON.parse(stored.body);
  }
  const bundle = {
    schemaVersion: manifest.schemaVersion,
    version: manifest.version,
    generatedAt: manifest.generatedAt,
    files: values
  };
  validateBlobVersionBundle(bundle);
  return values;
}

async function publishBlobVersionInternal({
  adapter,
  bundle,
  publishedAt = new Date().toISOString()
}) {
  validateBlobVersionBundle(bundle);
  const current = await readJson(adapter, LATEST_PATH);
  if (current?.value?.version === bundle.version) {
    const files = await verifyVersionFiles(adapter, current.value);
    return {
      status: "unchanged",
      version: bundle.version,
      manifest: current.value,
      files
    };
  }

  const fileMetadata = {};
  for (const filename of BLOB_VERSION_FILES) {
    const pathname = `versions/${bundle.version}/${filename}`;
    fileMetadata[filename] = await putVersionFile(
      adapter,
      pathname,
      bundle.files[filename]
    );
  }

  const manifest = {
    schemaVersion: 1,
    version: bundle.version,
    generatedAt: bundle.generatedAt,
    publishedAt,
    appVersion: bundle.appVersion,
    logicalDigest: bundle.logicalDigest,
    files: Object.fromEntries(
      Object.entries(fileMetadata).map(([filename, metadata]) => [
        filename,
        selectDefined(metadata, ["pathname", "sha256", "bytes", "etag"])
      ])
    )
  };
  await verifyVersionFiles(adapter, manifest);

  const body = stableStringify(manifest);
  try {
    await adapter.put(LATEST_PATH, body, {
      allowOverwrite: Boolean(current),
      ...(current?.etag ? { ifMatch: current.etag } : {})
    });
  } catch (error) {
    const winner = await readJson(adapter, LATEST_PATH);
    if (winner?.value?.version === bundle.version) {
      return {
        status: "published-by-peer",
        version: bundle.version,
        manifest: winner.value,
        files: await verifyVersionFiles(adapter, winner.value)
      };
    }
    if (adapter.isPreconditionError?.(error)) {
      throw new BlobVersionValidationError(
        "latest.json changed during publication; no overwrite was performed"
      );
    }
    throw error;
  }

  const latest = await readJson(adapter, LATEST_PATH);
  if (latest?.value?.version !== bundle.version) {
    throw new BlobVersionValidationError(
      "latest.json did not point to the verified version"
    );
  }
  return {
    status: "published",
    version: bundle.version,
    manifest: latest.value,
    files: await verifyVersionFiles(adapter, latest.value)
  };
}

export function publishBlobVersion(options) {
  const version = options?.bundle?.version;
  if (!version) {
    return Promise.reject(
      new BlobVersionValidationError("A validated bundle version is required")
    );
  }
  if (publishPromises.has(version)) return publishPromises.get(version);
  const promise = publishBlobVersionInternal(options).finally(() => {
    if (publishPromises.get(version) === promise) publishPromises.delete(version);
  });
  publishPromises.set(version, promise);
  return promise;
}

export async function readLatestBlobVersion(adapter) {
  const latest = await readJson(adapter, LATEST_PATH);
  if (!latest) {
    return { status: "missing", reason: "latest.json 없음", manifest: null };
  }
  try {
    const files = await verifyVersionFiles(adapter, latest.value);
    return {
      status: "valid",
      version: latest.value.version,
      manifest: latest.value,
      files
    };
  } catch (error) {
    return {
      status: "invalid",
      version: latest.value?.version || null,
      reason: error instanceof Error ? error.message : String(error),
      manifest: latest.value,
      files: null
    };
  }
}

export function createMemoryBlobAdapter({
  failOnPutNumber = null,
  initialEntries = {}
} = {}) {
  const entries = new Map();
  const writes = [];
  let putCount = 0;
  Object.entries(initialEntries).forEach(([pathname, value]) => {
    const body = typeof value === "string" ? value : stableStringify(value);
    entries.set(pathname, {
      pathname,
      body,
      etag: `"${sha256(body).slice(0, 16)}"`,
      size: Buffer.byteLength(body),
      uploadedAt: new Date("2026-07-27T00:00:00Z")
    });
  });

  return {
    entries,
    writes,
    access: "private",
    async get(pathname) {
      const entry = entries.get(pathname);
      return entry ? { ...entry } : null;
    },
    async put(pathname, body, options = {}) {
      putCount += 1;
      if (failOnPutNumber === putCount) {
        throw new Error(`Injected put failure ${putCount}`);
      }
      const current = entries.get(pathname);
      if (current && options.allowOverwrite !== true) {
        throw new Error(`Blob already exists: ${pathname}`);
      }
      if (options.ifMatch && current?.etag !== options.ifMatch) {
        const error = new Error("Precondition failed");
        error.code = "PRECONDITION";
        throw error;
      }
      const etag = `"${sha256(`${putCount}:${body}`).slice(0, 16)}"`;
      const entry = {
        pathname,
        body,
        etag,
        size: Buffer.byteLength(body),
        uploadedAt: new Date("2026-07-27T00:00:00Z")
      };
      entries.set(pathname, entry);
      writes.push({ pathname, options: { ...options } });
      return { ...entry, url: `memory://${pathname}` };
    },
    isPreconditionError(error) {
      return error?.code === "PRECONDITION";
    }
  };
}

