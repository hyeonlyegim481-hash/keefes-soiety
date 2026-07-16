import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { indicatorCountries, indicatorDefinitions as baseDefinitions } from "../indicator-data.js";
import { financeIndicatorDefinitions } from "../indicator-finance-data.js";
import { indicatorSnapshot as existingSnapshot } from "../indicator-values.js";

const definitions = [...baseDefinitions, ...financeIndicatorDefinitions];
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

const updates = new Map(
  await Promise.all(
    selectedDefinitions.map(async (indicator) => [
      indicator.id,
      await fetchIndicator(indicator)
    ])
  )
);

const indicators = {};
for (const indicator of definitions) {
  const value = updates.get(indicator.id) || existingSnapshot.indicators[indicator.id];
  if (!value) throw new Error(`No snapshot data for ${indicator.id}`);
  indicators[indicator.id] = value;
}

const snapshot = {
  dataUpdatedAt: new Date().toISOString().slice(0, 10),
  indicators
};
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "indicator-values.js"
);
await writeFile(
  outputPath,
  `export const indicatorSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`,
  "utf8"
);

console.log(
  `Updated ${selectedDefinitions.length} indicators (${definitions.length} total) at ${snapshot.dataUpdatedAt}`
);

async function fetchIndicator(indicator) {
  const countryPath = indicatorCountries.map((country) => country.id).join(";");
  const endpoint =
    `https://api.worldbank.org/v2/country/${countryPath}/indicator/${indicator.code}` +
    "?format=json&date=2015:2026&per_page=1000";
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(25_000)
      });
      if (!response.ok) {
        throw new Error(`World Bank API returned ${response.status}`);
      }
      const payload = JSON.parse((await response.text()).replace(/^\uFEFF/, ""));
      const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
      const snapshot = buildIndicatorSnapshot(rows);
      if (!snapshot.countries.KOR || snapshot.koreaTrend.length < 2) {
        throw new Error("Korea observations are incomplete");
      }
      return snapshot;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(attempt * 700);
    }
  }

  throw new Error(
    `Failed to update ${indicator.id}: ${lastError instanceof Error ? lastError.message : "unknown error"}`
  );
}

function buildIndicatorSnapshot(rows) {
  const countries = {};

  for (const country of indicatorCountries) {
    const observations = rows
      .filter(
        (row) =>
          row?.countryiso3code === country.id &&
          row.value !== null &&
          row.value !== "" &&
          Number.isFinite(Number(row.value)) &&
          Number.isFinite(Number(row.date))
      )
      .map((row) => ({
        year: Number(row.date),
        value: round(Number(row.value), 4)
      }))
      .sort((a, b) => a.year - b.year);
    const latest = observations.at(-1);
    if (!latest) continue;
    const previous = observations.at(-2);
    countries[country.id] = {
      ...latest,
      ...(previous ? { previous } : {})
    };
  }

  const koreaTrend = rows
    .filter(
      (row) =>
        row?.countryiso3code === "KOR" &&
        row.value !== null &&
        row.value !== "" &&
        Number.isFinite(Number(row.value)) &&
        Number.isFinite(Number(row.date))
    )
    .map((row) => ({
      year: Number(row.date),
      value: round(Number(row.value), 4)
    }))
    .sort((a, b) => a.year - b.year);

  return { countries, koreaTrend };
}

function round(value, digits) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
