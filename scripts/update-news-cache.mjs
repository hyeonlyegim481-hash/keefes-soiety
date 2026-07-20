import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAutomatedNewsAnalysis,
  enhanceNewsBatchWithAi,
  getHeadlineEventKey,
  getSnapshot,
  isAiConfigured
} from "../server.mjs";
import { enrichHeadlineWithArticle } from "../news-content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const cachePath = path.join(projectRoot, "data", "news-cache.json");
const MAX_AI_ARTICLES_PER_RUN = 6;
const MIN_RUN_INTERVAL_MS = 50 * 60 * 1000;
const SEEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function main() {
  if (!isAiConfigured()) {
    console.log("OPENAI_API_KEY is not configured. Scheduled news update skipped.");
    return;
  }

  const now = Date.now();
  const previous = await readPreviousCache();
  const previousUpdatedAt = Date.parse(previous.updatedAt);
  if (
    process.env.FORCE_NEWS_REFRESH !== "true" &&
    Number.isFinite(previousUpdatedAt) &&
    now - previousUpdatedAt < MIN_RUN_INTERVAL_MS
  ) {
    console.log("A recent news update already exists. Duplicate run skipped.");
    return;
  }

  const snapshot = await getSnapshot({ forceNews: true, preferScheduledNews: false });
  const headlines = snapshot.headlines.slice(0, 24);
  const seen = buildSeenIndex(previous.seen, headlines, now);
  const analyses = pruneAnalyses(previous.analyses, seen);
  const candidates = headlines
    .filter((headline) => !analyses[getHeadlineEventKey(headline)])
    .sort((left, right) =>
      Number(right.importanceScore || 0) - Number(left.importanceScore || 0) ||
      Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    )
    .slice(0, MAX_AI_ARTICLES_PER_RUN);

  if (candidates.length) {
    const enriched = await Promise.all(candidates.map(enrichHeadlineWithArticle));
    const fallbacks = enriched.map((headline) => buildAutomatedNewsAnalysis(headline, snapshot));
    const batch = await enhanceNewsBatchWithAi(enriched, snapshot, fallbacks);
    if (!batch.usedAi) {
      throw new Error("The scheduled AI batch failed; previous cache was kept unchanged.");
    }
    Object.assign(analyses, batch.analyses);
  }

  const payload = {
    version: 1,
    updatedAt: new Date(now).toISOString(),
    availableNewsFeedCount: snapshot.dataQuality.availableNewsFeedCount,
    headlines,
    analyses,
    seen: [...seen.entries()]
      .map(([eventKey, lastSeenAt]) => ({ eventKey, lastSeenAt }))
      .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt)),
    policy: {
      collectionIntervalMinutes: 60,
      reasoningEffort: "low",
      maxAiArticlesPerRun: MAX_AI_ARTICLES_PER_RUN,
      maxAiRequestsPerRun: candidates.length ? 1 : 0,
      dedupeWindowDays: 7
    }
  };

  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `News cache updated: ${headlines.length} headlines, ${candidates.length} new AI analyses, one batch request maximum.`
  );
}

async function readPreviousCache() {
  try {
    const value = JSON.parse(await readFile(cachePath, "utf8"));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function buildSeenIndex(previousSeen, headlines, now) {
  const cutoff = now - SEEN_TTL_MS;
  const seen = new Map();
  for (const entry of Array.isArray(previousSeen) ? previousSeen : []) {
    const timestamp = Date.parse(entry?.lastSeenAt);
    if (entry?.eventKey && Number.isFinite(timestamp) && timestamp >= cutoff) {
      seen.set(String(entry.eventKey), new Date(timestamp).toISOString());
    }
  }
  const seenAt = new Date(now).toISOString();
  for (const headline of headlines) seen.set(getHeadlineEventKey(headline), seenAt);
  return seen;
}

function pruneAnalyses(previousAnalyses, seen) {
  const source = previousAnalyses && typeof previousAnalyses === "object" ? previousAnalyses : {};
  return Object.fromEntries(
    Object.entries(source)
      .filter(([eventKey]) => seen.has(eventKey))
      .slice(-120)
  );
}

await main();
