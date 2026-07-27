import assert from "node:assert/strict";
import test from "node:test";

import {
  BLOB_VERSION_FILES,
  BlobVersionValidationError,
  buildBlobVersionBundle,
  createMemoryBlobAdapter,
  getBlobConnectionStatus,
  normalizeBlobEtag,
  publishBlobVersion,
  readLatestBlobVersion,
  stableStringify
} from "./blob-version-store.js";

test("normalizeBlobEtag converts weak download ETags for conditional writes", () => {
  assert.equal(
    normalizeBlobEtag('W/"a7437b7752f83be30862e577fb2691f2"'),
    '"a7437b7752f83be30862e577fb2691f2"'
  );
  assert.equal(normalizeBlobEtag('"strong"'), '"strong"');
  assert.equal(normalizeBlobEtag(null), null);
});

function createInput() {
  return {
    appVersion: "95",
    snapshot: {
      generatedAt: "2026-07-27T08:17:59.000Z",
      markets: [
        {
          id: "kospi",
          name: "KOSPI",
          value: 3000,
          previousClose: 2980,
          change: 20,
          changePercent: 0.67,
          unit: "pt",
          instrumentType: "index",
          asOf: "2026-07-27T06:00:00.000Z",
          source: "Yahoo Finance",
          sourceUrl: "https://example.test/market",
          series: [
            { time: "2026-07-27T05:00:00.000Z", value: 2990 },
            { time: "2026-07-27T06:00:00.000Z", value: 3000 }
          ],
          rawResponse: { forbidden: true }
        }
      ],
      headlines: [
        {
          id: "news-1",
          eventKey: "event-1",
          title: "시장 기사",
          source: "테스트",
          publishedAt: "2026-07-27T07:00:00.000Z",
          url: "https://example.test/news",
          section: "korea",
          rawHtml: "<html>저장 금지</html>",
          imageUrl: "https://example.test/image.jpg"
        }
      ],
      analysis: {
        riskScore: 50,
        regime: "균형 탐색",
        pulse: "규칙 기반 분석"
      },
      connections: {
        schemaVersion: 1,
        generatedAt: "2026-07-27T08:17:59.000Z",
        entities: { markets: {} },
        relations: { markets: {} },
        integrity: { valid: true }
      },
      dataQuality: { availableMarketCount: 1 },
      sources: { markets: "Yahoo Finance" },
      sourceDetails: { markets: { provider: "Yahoo Finance" } }
    },
    indicatorSnapshot: {
      generatedAt: "2026-07-27T00:00:00.000Z",
      indicators: {
        fertility: {
          countries: {
            KOR: { value: 0.75, year: 2024 }
          }
        }
      }
    }
  };
}

test("connection status exposes presence only and never a token value", () => {
  assert.deepEqual(getBlobConnectionStatus({}), {
    configured: false,
    authMode: "none",
    hasReadWriteToken: false,
    hasOidc: false,
    access: "private"
  });
  const status = getBlobConnectionStatus({
    BLOB_READ_WRITE_TOKEN: "secret-value"
  });
  assert.equal(status.configured, true);
  assert.equal(status.hasReadWriteToken, true);
  assert.equal(JSON.stringify(status).includes("secret-value"), false);

  const runtimeOidc = getBlobConnectionStatus({
    VERCEL: "1",
    BLOB_STORE_ID: "store_example"
  });
  assert.equal(runtimeOidc.configured, true);
  assert.equal(runtimeOidc.authMode, "oidc");
  assert.equal(runtimeOidc.hasOidc, true);
});

test("bundle contains only the required version files and filtered data", () => {
  const bundle = buildBlobVersionBundle(createInput());
  assert.deepEqual(Object.keys(bundle.files).sort(), [...BLOB_VERSION_FILES].sort());
  const json = stableStringify(bundle);
  assert.equal(json.includes("rawResponse"), false);
  assert.equal(json.includes("rawHtml"), false);
  assert.equal(json.includes("imageUrl"), false);
  assert.match(bundle.version, /^20260727T081759Z-v95-[a-f0-9]{10}$/);
});

test("latest.json is written only after all files pass read-back validation", async () => {
  const bundle = buildBlobVersionBundle(createInput());
  const adapter = createMemoryBlobAdapter();
  const result = await publishBlobVersion({
    adapter,
    bundle,
    publishedAt: "2026-07-27T08:20:00.000Z"
  });
  assert.equal(result.status, "published");
  assert.equal(adapter.writes.length, 6);
  assert.deepEqual(
    adapter.writes.slice(0, 5).map((entry) => entry.pathname),
    BLOB_VERSION_FILES.map(
      (filename) => `versions/${bundle.version}/${filename}`
    )
  );
  assert.equal(adapter.writes.at(-1).pathname, "latest.json");
  const latest = await readLatestBlobVersion(adapter);
  assert.equal(latest.status, "valid");
  assert.equal(latest.version, bundle.version);
});

test("a failed version write leaves latest.json untouched", async () => {
  const bundle = buildBlobVersionBundle(createInput());
  const adapter = createMemoryBlobAdapter({ failOnPutNumber: 3 });
  await assert.rejects(
    publishBlobVersion({ adapter, bundle }),
    /Injected put failure/
  );
  assert.equal(adapter.entries.has("latest.json"), false);
  assert.equal(adapter.writes.length, 2);
});

test("an incomplete version is rejected when latest.json is read", async () => {
  const bundle = buildBlobVersionBundle(createInput());
  const adapter = createMemoryBlobAdapter();
  const missingFile = "news-index.json";
  const manifest = {
    schemaVersion: 1,
    version: bundle.version,
    generatedAt: bundle.generatedAt,
    files: Object.fromEntries(
      BLOB_VERSION_FILES.map((filename) => [
        filename,
        {
          pathname: `versions/${bundle.version}/${filename}`,
          sha256: "missing",
          bytes: 0
        }
      ])
    )
  };
  await adapter.put("latest.json", stableStringify(manifest));
  for (const filename of BLOB_VERSION_FILES.filter((name) => name !== missingFile)) {
    await adapter.put(
      `versions/${bundle.version}/${filename}`,
      stableStringify(bundle.files[filename])
    );
  }
  const latest = await readLatestBlobVersion(adapter);
  assert.equal(latest.status, "invalid");
  assert.match(latest.reason, /missing|checksum/i);
});

test("publishing the same content is idempotent", async () => {
  const bundle = buildBlobVersionBundle(createInput());
  const adapter = createMemoryBlobAdapter();
  const first = await publishBlobVersion({ adapter, bundle });
  const writesAfterFirst = adapter.writes.length;
  const second = await publishBlobVersion({ adapter, bundle });
  assert.equal(first.status, "published");
  assert.equal(second.status, "unchanged");
  assert.equal(adapter.writes.length, writesAfterFirst);
});

test("non-finite values and forbidden nested keys fail validation", () => {
  const input = createInput();
  input.snapshot.analysis.riskScore = Number.NaN;
  assert.throws(
    () => buildBlobVersionBundle(input),
    BlobVersionValidationError
  );

  const second = createInput();
  second.snapshot.analysis.debugLog = "do not store";
  assert.throws(
    () => buildBlobVersionBundle(second),
    /Disallowed key/
  );
});

test("concurrent publication shares one in-flight operation", async () => {
  const bundle = buildBlobVersionBundle(createInput());
  const adapter = createMemoryBlobAdapter();
  const [left, right] = await Promise.all([
    publishBlobVersion({ adapter, bundle }),
    publishBlobVersion({ adapter, bundle })
  ]);
  assert.equal(left.version, bundle.version);
  assert.equal(right.version, bundle.version);
  assert.equal(adapter.writes.filter((entry) => entry.pathname === "latest.json").length, 1);
});

