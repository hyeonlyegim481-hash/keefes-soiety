import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { indicatorDefinitions as baseDefinitions } from "../indicator-data.js";
import { financeIndicatorDefinitions } from "../indicator-finance-data.js";
import { expandedIndicatorDefinitions } from "../indicator-expanded-data.js";
import { broadIndicatorDefinitions } from "../indicator-broad-data.js";
import { indicatorProviderMetadata as existingMetadata } from "../indicator-provider-metadata.js";

const definitions = [
  ...baseDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions,
  ...broadIndicatorDefinitions
];
const requestedIds = new Set(process.argv.slice(2));
const selectedDefinitions = requestedIds.size
  ? definitions.filter((indicator) => requestedIds.has(indicator.id))
  : definitions;
const unknownIds = [...requestedIds].filter(
  (id) => !definitions.some((indicator) => indicator.id === id)
);

if (unknownIds.length) {
  throw new Error(`Unknown indicator ids: ${unknownIds.join(", ")}`);
}

const metadataEntries = new Map(Object.entries(existingMetadata.indicators || {}));

for (const indicator of selectedDefinitions) {
  metadataEntries.set(
    indicator.code,
    await fetchMetadata(indicator)
  );
}

const output = {
  retrievedAt: new Date().toISOString(),
  indicators: Object.fromEntries(metadataEntries)
};
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "indicator-provider-metadata.js"
);

await writeFile(
  outputPath,
  `export const indicatorProviderMetadata = ${JSON.stringify(output, null, 2)};\n`,
  "utf8"
);

console.log(
  `Updated official metadata for ${selectedDefinitions.length} indicators (${definitions.length} total).`
);

async function fetchMetadata(indicator) {
  const endpoint =
    `https://api.worldbank.org/v2/source/2/indicator/${indicator.code}` +
    "?format=json";
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(20_000)
      });
      if (!response.ok) {
        throw new Error(`World Bank API returned ${response.status}`);
      }
      const payload = JSON.parse((await response.text()).replace(/^\uFEFF/, ""));
      const metadata = payload?.[1]?.[0];
      if (!metadata?.id || !metadata?.name || !metadata?.sourceOrganization) {
        throw new Error("Official indicator metadata is incomplete");
      }
      return {
        officialName: metadata.name,
        sourceOrganization: metadata.sourceOrganization,
        sourceNote: metadata.sourceNote || null
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(500 * (2 ** (attempt - 1)));
    }
  }

  throw new Error(
    `Failed to update ${indicator.code}: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
