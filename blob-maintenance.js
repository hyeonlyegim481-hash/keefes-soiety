import {
  BLOB_VERSION_FILES,
  buildBlobVersionBundle,
  publishBlobVersion,
  readLatestBlobVersion
} from "./blob-version-store.js";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export const BLOB_RETENTION_POLICY = Object.freeze({
  keepVersions: 120,
  maxAgeDays: 120,
  graceHours: 24,
  deleteBatchSize: 100
});

function parseTime(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function versionFromPathname(pathname) {
  return String(pathname || "").match(/^versions\/([^/]+)\/[^/]+$/)?.[1] || null;
}

async function listVersionBlobs(adapter) {
  const blobs = [];
  let cursor;
  do {
    const page = await adapter.list({
      prefix: "versions/",
      limit: 1000,
      ...(cursor ? { cursor } : {})
    });
    blobs.push(...(page?.blobs || []));
    cursor = page?.hasMore ? page.cursor : null;
  } while (cursor);
  return blobs;
}

function groupVersions(blobs) {
  const groups = new Map();
  for (const blob of blobs) {
    const version = versionFromPathname(blob.pathname);
    if (!version) continue;
    const current = groups.get(version) || {
      version,
      blobs: [],
      bytes: 0,
      newestAt: null
    };
    current.blobs.push(blob);
    current.bytes += Number(blob.size || 0);
    const uploadedAt = parseTime(blob.uploadedAt);
    if (uploadedAt !== null) {
      current.newestAt =
        current.newestAt === null ? uploadedAt : Math.max(current.newestAt, uploadedAt);
    }
    groups.set(version, current);
  }
  return [...groups.values()].sort(
    (left, right) => (right.newestAt ?? -Infinity) - (left.newestAt ?? -Infinity)
  );
}

export function planBlobCleanup({
  blobs,
  latestVersion,
  now = Date.now(),
  policy = BLOB_RETENTION_POLICY
}) {
  const groups = groupVersions(blobs);
  const requiredFileCount = BLOB_VERSION_FILES.length;
  const deletedVersions = [];
  const deletedPathnames = [];
  let estimatedBytesFreed = 0;

  groups.forEach((group, index) => {
    const ageMs =
      group.newestAt === null ? Number.POSITIVE_INFINITY : now - group.newestAt;
    const protectedByGrace = ageMs < policy.graceHours * HOUR_MS;
    const isLatest = group.version === latestVersion;
    const isIncomplete = group.blobs.length !== requiredFileCount;
    const exceedsCount = index >= policy.keepVersions;
    const exceedsAge = ageMs >= policy.maxAgeDays * DAY_MS;
    const shouldDelete =
      !isLatest &&
      !protectedByGrace &&
      (isIncomplete || exceedsCount || exceedsAge);

    if (!shouldDelete) return;
    deletedVersions.push({
      version: group.version,
      reason: isIncomplete
        ? "incomplete"
        : exceedsCount
          ? "count-limit"
          : "age-limit",
      blobCount: group.blobs.length,
      bytes: group.bytes
    });
    deletedPathnames.push(...group.blobs.map((blob) => blob.pathname));
    estimatedBytesFreed += group.bytes;
  });

  return {
    scannedVersions: groups.length,
    retainedVersions: groups.length - deletedVersions.length,
    deletedVersions,
    deletedPathnames,
    estimatedBytesFreed
  };
}

export async function cleanupBlobVersions({
  adapter,
  now = Date.now(),
  policy = BLOB_RETENTION_POLICY
}) {
  const before = await readLatestBlobVersion(adapter);
  if (before.status !== "valid") {
    return {
      status: "skipped",
      reason: "latest-invalid",
      deletedVersions: 0,
      deletedBlobs: 0,
      estimatedBytesFreed: 0
    };
  }

  const blobs = await listVersionBlobs(adapter);
  const plan = planBlobCleanup({
    blobs,
    latestVersion: before.version,
    now,
    policy
  });
  const after = await readLatestBlobVersion(adapter);
  if (after.status !== "valid" || after.version !== before.version) {
    return {
      status: "skipped",
      reason: "latest-changed",
      deletedVersions: 0,
      deletedBlobs: 0,
      estimatedBytesFreed: 0
    };
  }

  for (
    let index = 0;
    index < plan.deletedPathnames.length;
    index += policy.deleteBatchSize
  ) {
    await adapter.del(
      plan.deletedPathnames.slice(index, index + policy.deleteBatchSize)
    );
  }

  return {
    status: plan.deletedPathnames.length ? "cleaned" : "unchanged",
    scannedVersions: plan.scannedVersions,
    retainedVersions: plan.retainedVersions,
    deletedVersions: plan.deletedVersions.length,
    deletedBlobs: plan.deletedPathnames.length,
    estimatedBytesFreed: plan.estimatedBytesFreed,
    reasons: Object.fromEntries(
      ["incomplete", "count-limit", "age-limit"].map((reason) => [
        reason,
        plan.deletedVersions.filter((item) => item.reason === reason).length
      ])
    )
  };
}

export function createVerifiedNewsFallback(latest) {
  if (latest?.status !== "valid") return null;
  const headlines = latest.files?.["news-index.json"]?.data?.events;
  if (!Array.isArray(headlines) || !headlines.length) return null;
  const status = latest.files?.["data-status.json"]?.data;
  return {
    headlines,
    fetchedAt:
      status?.sourceDetails?.news?.basisAt ||
      latest.files?.["news-index.json"]?.generatedAt ||
      latest.manifest?.generatedAt ||
      null,
    availableNewsFeedCount:
      Number(status?.dataQuality?.availableNewsFeedCount) || 0
  };
}

export async function runBlobMaintenance({
  adapter,
  snapshot,
  indicatorSnapshot,
  appVersion,
  now = new Date()
}) {
  const bundle = buildBlobVersionBundle({
    snapshot,
    indicatorSnapshot,
    appVersion
  });
  const publication = await publishBlobVersion({
    adapter,
    bundle,
    publishedAt: now.toISOString()
  });
  const latest = await readLatestBlobVersion(adapter);
  if (latest.status !== "valid" || latest.version !== bundle.version) {
    throw new Error("Blob publication did not produce a valid latest version");
  }
  const cleanup = await cleanupBlobVersions({
    adapter,
    now: now.getTime()
  });
  return {
    status: "ok",
    publication: {
      status: publication.status,
      version: publication.version,
      fileCount: Object.keys(publication.manifest.files || {}).length,
      totalBytes: Object.values(publication.manifest.files || {}).reduce(
        (sum, file) => sum + Number(file.bytes || 0),
        0
      )
    },
    cleanup
  };
}

export function isAuthorizedCronRequest(request, secret = process.env.CRON_SECRET) {
  if (!secret || secret.length < 16) return false;
  const authorization =
    request?.headers?.authorization ||
    request?.headers?.Authorization ||
    request?.headers?.get?.("authorization");
  return authorization === `Bearer ${secret}`;
}
