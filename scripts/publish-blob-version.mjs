import "../app-version.js";
import {
  createVercelBlobAdapter,
  getBlobConnectionStatus
} from "../blob-version-store.js";
import { runBlobMaintenance } from "../blob-maintenance.js";
import { indicatorSnapshot } from "../indicator-values.js";
import { getSnapshot } from "../server.mjs";

const connection = getBlobConnectionStatus();
if (!connection.configured) {
  console.error(
    "Vercel Blob is not configured. Connect a private Blob store to this project first."
  );
  process.exitCode = 2;
} else {
  const result = await runBlobMaintenance({
    adapter: await createVercelBlobAdapter(),
    snapshot: await getSnapshot({
      forceNews: true,
      preferScheduledNews: false
    }),
    indicatorSnapshot,
    appVersion: globalThis.KEEFES_APP_VERSION || "dev"
  });
  console.log(JSON.stringify(result, null, 2));
}
