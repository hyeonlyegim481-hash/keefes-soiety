import assert from "node:assert/strict";
import test from "node:test";

import {
  BLOB_RETENTION_POLICY,
  cleanupBlobVersions,
  isAuthorizedCronRequest,
  planBlobCleanup
} from "./blob-maintenance.js";
import {
  buildBlobVersionBundle,
  createMemoryBlobAdapter,
  publishBlobVersion
} from "./blob-version-store.js";

const DAY_MS = 86_400_000;

function blob(pathname, uploadedAt, size = 100) {
  return { pathname, uploadedAt: new Date(uploadedAt).toISOString(), size };
}

function completeVersion(version, uploadedAt) {
  return [
    "market.json",
    "regime.json",
    "indicators.json",
    "news-index.json",
    "data-status.json"
  ].map((file) => blob(`versions/${version}/${file}`, uploadedAt));
}

function createBundle(versionTime = "2026-07-27T08:17:59.000Z") {
  return buildBlobVersionBundle({
    appVersion: "96",
    snapshot: {
      generatedAt: versionTime,
      markets: [{
        id: "kospi",
        name: "KOSPI",
        value: 3000,
        series: [
          { time: "2026-07-27T07:00:00.000Z", value: 2990 },
          { time: "2026-07-27T08:00:00.000Z", value: 3000 }
        ]
      }],
      headlines: [],
      analysis: { riskScore: 50 },
      dataQuality: {},
      sources: {},
      sourceDetails: {}
    },
    indicatorSnapshot: {
      indicators: {
        fertility: { countries: { KOR: { year: 2024, value: 0.748 } } }
      }
    }
  });
}

test("cleanup never removes latest or versions inside the grace period", () => {
  const now = Date.parse("2026-07-27T12:00:00Z");
  const blobs = [
    ...completeVersion("latest-version", now - 200 * DAY_MS),
    ...completeVersion("fresh-version", now - 2 * 3_600_000),
    blob("versions/fresh-orphan/market.json", now - 2 * 3_600_000)
  ];
  const plan = planBlobCleanup({
    blobs,
    latestVersion: "latest-version",
    now,
    policy: { ...BLOB_RETENTION_POLICY, keepVersions: 1 }
  });
  assert.deepEqual(plan.deletedVersions, []);
});

test("cleanup removes expired complete versions and stale incomplete versions", () => {
  const now = Date.parse("2026-07-27T12:00:00Z");
  const blobs = [
    ...completeVersion("latest-version", now - DAY_MS),
    ...completeVersion("expired-version", now - 121 * DAY_MS),
    blob("versions/stale-orphan/market.json", now - 2 * DAY_MS)
  ];
  const plan = planBlobCleanup({
    blobs,
    latestVersion: "latest-version",
    now
  });
  assert.deepEqual(
    plan.deletedVersions.map((item) => [item.version, item.reason]),
    [
      ["stale-orphan", "incomplete"],
      ["expired-version", "age-limit"]
    ]
  );
  assert.equal(plan.deletedPathnames.length, 6);
});

test("count limit caps retained history while preserving latest", () => {
  const now = Date.parse("2026-07-27T12:00:00Z");
  const blobs = Array.from({ length: 5 }, (_, index) =>
    completeVersion(`version-${index}`, now - (index + 2) * DAY_MS)
  ).flat();
  const plan = planBlobCleanup({
    blobs,
    latestVersion: "version-0",
    now,
    policy: { ...BLOB_RETENTION_POLICY, keepVersions: 3 }
  });
  assert.equal(plan.retainedVersions, 3);
  assert.deepEqual(
    plan.deletedVersions.map((item) => item.version),
    ["version-3", "version-4"]
  );
});

test("remote cleanup validates latest before deleting and reports reclaimed bytes", async () => {
  const adapter = createMemoryBlobAdapter();
  const bundle = createBundle();
  await publishBlobVersion({ adapter, bundle });
  const oldVersion = "old-version";
  const oldAt = new Date(Date.parse(bundle.generatedAt) - 121 * DAY_MS);
  for (const item of completeVersion(oldVersion, oldAt)) {
    adapter.entries.set(item.pathname, {
      ...item,
      body: "{}",
      etag: `"${item.pathname}"`,
      uploadedAt: oldAt
    });
  }
  const result = await cleanupBlobVersions({
    adapter,
    now: Date.parse(bundle.generatedAt)
  });
  assert.equal(result.status, "cleaned");
  assert.equal(result.deletedVersions, 1);
  assert.equal(result.deletedBlobs, 5);
  assert.equal(adapter.entries.has(`versions/${oldVersion}/market.json`), false);
  assert.equal(adapter.entries.has("latest.json"), true);
});

test("cron authorization requires a configured secret and exact bearer token", () => {
  const secret = "1234567890abcdef1234567890abcdef";
  assert.equal(isAuthorizedCronRequest({ headers: {} }, secret), false);
  assert.equal(
    isAuthorizedCronRequest(
      { headers: { authorization: `Bearer ${secret}` } },
      secret
    ),
    true
  );
  assert.equal(
    isAuthorizedCronRequest(
      { headers: { authorization: "Bearer wrong" } },
      secret
    ),
    false
  );
  assert.equal(isAuthorizedCronRequest({ headers: {} }, ""), false);
});
