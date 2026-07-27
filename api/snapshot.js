import { getSnapshot } from "../server.mjs";

export function createSnapshotHandler({
  getSnapshotImpl = getSnapshot,
  logger = console
} = {}) {
  return async function handler(request, response) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      return response.status(405).json({ error: "Method not allowed" });
    }

    try {
      const snapshot = await getSnapshotImpl();
      response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=900");
      return response.status(200).json(snapshot);
    } catch (error) {
      logger.error?.("[api/snapshot] generation failed", {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error)
      });
      response.setHeader("Cache-Control", "no-store");
      return response.status(500).json({
        error: "Snapshot generation failed",
        code: "SNAPSHOT_BUILD_FAILED"
      });
    }
  };
}

export default createSnapshotHandler();
