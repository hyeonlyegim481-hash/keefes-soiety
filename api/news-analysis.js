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
const analysisPromises = new Map();
const ANALYSIS_CACHE_TTL_MS = 5 * 60 * 1000;
const SHARED_CACHE_CONTROL = "public, max-age=60, s-maxage=1800, stale-while-revalidate=3600";

export default async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    response.setHeader("Cache-Control", "no-store");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const input = request.method === "GET" ? request.query || {} : request.body || {};
    const requestedHeadline = normalizeHeadlineInput(input);
    if (request.method === "GET" && !requestedHeadline.id) {
      response.setHeader("Cache-Control", "no-store");
      return response.status(400).json({ error: "Headline id is required" });
    }
    if (!requestedHeadline.id && !requestedHeadline.title) {
      response.setHeader("Cache-Control", "no-store");
      return response.status(400).json({ error: "Headline id or title is required" });
    }

    const snapshot = await getSnapshot();
    const trustedHeadline = findTrustedHeadline(snapshot, requestedHeadline);
    if (!trustedHeadline) {
      response.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
      return response.status(404).json({ error: "Headline is not in the current news list" });
    }

    const scheduledAnalysis = await findScheduledNewsAnalysis(trustedHeadline);
    if (scheduledAnalysis) {
      setAnalysisHeaders(response, "scheduled");
      return response.status(200).json(scheduledAnalysis);
    }

    const generatedHour = String(snapshot.generatedAt || "").slice(0, 13);
    const cacheKey = `${trustedHeadline.id || trustedHeadline.title}:${generatedHour}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < ANALYSIS_CACHE_TTL_MS) {
      setAnalysisHeaders(response, "memory");
      return response.status(200).json(cached.value);
    }

    let analysisPromise = analysisPromises.get(cacheKey);
    if (!analysisPromise) {
      const quota = consumeNewsAnalysisQuota(getClientKey(request));
      if (!quota.allowed) {
        response.setHeader("Retry-After", String(quota.retryAfter));
        response.setHeader("Cache-Control", "no-store");
        return response.status(429).json({ error: "Too many analysis requests" });
      }

      analysisPromise = (async () => {
        const headline = await enrichHeadlineWithArticle(trustedHeadline);
        const fallback = buildAutomatedNewsAnalysis(headline, snapshot);
        return enhanceNewsAnalysisWithAi(headline, snapshot, fallback);
      })();
      analysisPromises.set(cacheKey, analysisPromise);
    }

    try {
      const analysis = await analysisPromise;
      if (analysisCache.size > 100) analysisCache.clear();
      analysisCache.set(cacheKey, { createdAt: Date.now(), value: analysis });
      setAnalysisHeaders(response, "generated");
      return response.status(200).json(analysis);
    } finally {
      if (analysisPromises.get(cacheKey) === analysisPromise) {
        analysisPromises.delete(cacheKey);
      }
    }
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(500).json({
      error: "News analysis failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function setAnalysisHeaders(response, source) {
  response.setHeader("Cache-Control", SHARED_CACHE_CONTROL);
  response.setHeader("X-News-Analysis-Source", source);
}

function getClientKey(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  return String(forwarded || request.headers?.["x-real-ip"] || "anonymous").split(",")[0].trim();
}
