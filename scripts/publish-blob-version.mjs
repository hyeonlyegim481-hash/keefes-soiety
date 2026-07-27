import {
  buildBlobVersionBundle,
  createVercelBlobAdapter,
  getBlobConnectionStatus,
  publishBlobVersion
} from "../blob-version-store.js";
import { indicatorSnapshot } from "../indicator-values.js";
import { getSnapshot } from "../server.mjs";

await import("../app-version.js");

const connection = getBlobConnectionStatus();
if (!connection.configured) {
  console.error(
    "Vercel Blob is not configured. Connect a private Blob store to this project first."
  );
  process.exitCode = 2;
} else {
  const snapshot = await getSnapshot();
  const bundle = buildBlobVersionBundle({
    snapshot,
    indicatorSnapshot,
    appVersion: globalThis.KEEFES_APP_VERSION || "dev"
  });
  const adapter = await createVercelBlobAdapter();
  const result = await publishBlobVersion({ adapter, bundle });
  const totalBytes = Object.values(result.manifest.files).reduce(
    (total, file) => total + Number(file.bytes || 0),
    0
  );
  console.log(
    JSON.stringify(
      {
        status: result.status,
        version: result.version,
        files: Object.keys(result.manifest.files).length,
        totalBytes
      },
      null,
      2
    )
  );
}

