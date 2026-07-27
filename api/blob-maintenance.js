import "../app-version.js";
import {
  createVercelBlobAdapter,
  getBlobConnectionStatus,
  readLatestBlobVersion
} from "../blob-version-store.js";
import {
  createVerifiedNewsFallback,
  isAuthorizedCronRequest,
  runBlobMaintenance
} from "../blob-maintenance.js";
import { indicatorSnapshot } from "../indicator-values.js";
import { getSnapshot } from "../server.mjs";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthorizedCronRequest(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const connection = getBlobConnectionStatus();
  if (!connection.configured) {
    return response.status(503).json({
      status: "unavailable",
      reason: "blob-not-configured"
    });
  }

  try {
    const adapter = await createVercelBlobAdapter();
    const latest = await readLatestBlobVersion(adapter);
    const snapshot = await getSnapshot({
      preferScheduledNews: true,
      verifiedNewsFallback: createVerifiedNewsFallback(latest),
      allowLiveNews: false
    });
    const result = await runBlobMaintenance({
      adapter,
      snapshot,
      indicatorSnapshot,
      appVersion: globalThis.KEEFES_APP_VERSION || "dev"
    });
    return response.status(200).json(result);
  } catch (error) {
    console.error("[blob-maintenance] failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error)
    });
    return response.status(500).json({
      status: "failed",
      reason: error instanceof Error ? error.name : "UnknownError"
    });
  }
}
