import {
  buildAutomatedNewsAnalysis,
  consumeNewsAnalysisQuota,
  enhanceNewsAnalysisWithAi,
  findScheduledNewsAnalysis,
  findTrustedHeadline,
  getSnapshot,
  normalizeHeadlineInput
} from "../server.mjs";
import { enrichHeadlineWithArticle } from "../news-content.js";

const analysisCache = new Map();
const ANALYSIS_CACHE_TTL_MS = 5 * 60 * 1000;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const quota = consumeNewsAnalysisQuota(getClientKey(request));
  if (!quota.allowed) {
    response.setHeader("Retry-After", String(quota.retryAfter));
    return response.status(429).json({ error: "Too many analysis requests" });
  }

  try {
    const requestedHeadline = normalizeHeadlineInput(request.body || {});
    if (!requestedHeadline.title) {
      return response.status(400).json({ error: "Headline title is required" });
    }

    const snapshot = await getSnapshot();
    const trustedHeadline = findTrustedHeadline(snapshot, requestedHeadline);
    if (!trustedHeadline) {
      return response.status(404).json({ error: "Headline is not in the current news list" });
    }

    const scheduledAnalysis = await findScheduledNewsAnalysis(trustedHeadline);
    if (scheduledAnalysis) {
      response.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
      return response.status(200).json(scheduledAnalysis);
    }

    const cacheKey = String(trustedHeadline.id || trustedHeadline.title);
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < ANALYSIS_CACHE_TTL_MS) {
      response.setHeader("Cache-Control", "private, max-age=60");
      return response.status(200).json(cached.value);
    }

    const headline = await enrichHeadlineWithArticle(trustedHeadline);
    const fallback = buildAutomatedNewsAnalysis(headline, snapshot);
    const analysis = await enhanceNewsAnalysisWithAi(headline, snapshot, fallback);
    if (analysisCache.size > 100) analysisCache.clear();
    analysisCache.set(cacheKey, { createdAt: Date.now(), value: analysis });
    response.setHeader("Cache-Control", "private, max-age=60");
    return response.status(200).json(analysis);
  } catch (error) {
    return response.status(500).json({
      error: "News analysis failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function getClientKey(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  return String(forwarded || request.headers?.["x-real-ip"] || "anonymous").split(",")[0].trim();
}
