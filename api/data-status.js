import {
  createVercelBlobAdapter,
  getBlobConnectionStatus,
  readLatestBlobVersion
} from "../blob-version-store.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const connection = getBlobConnectionStatus();
  if (!connection.configured) {
    response.setHeader("Cache-Control", "public, s-maxage=60");
    return response.status(200).json({
      blob: connection,
      latest: { status: "not-configured", version: null }
    });
  }

  try {
    const adapter = await createVercelBlobAdapter();
    const latest = await readLatestBlobVersion(adapter);
    const totalBytes = latest.manifest?.files
      ? Object.values(latest.manifest.files).reduce(
          (total, file) => total + Number(file.bytes || 0),
          0
        )
      : 0;
    response.setHeader("Cache-Control", "public, s-maxage=60");
    return response.status(200).json({
      blob: connection,
      latest: {
        status: latest.status,
        version: latest.version || null,
        generatedAt: latest.manifest?.generatedAt || null,
        publishedAt: latest.manifest?.publishedAt || null,
        fileCount: latest.manifest?.files
          ? Object.keys(latest.manifest.files).length
          : 0,
        totalBytes
      }
    });
  } catch (error) {
    return response.status(503).json({
      blob: connection,
      latest: {
        status: "unavailable",
        version: null,
        reason: error instanceof Error ? error.name : "Unknown error"
      }
    });
  }
}

