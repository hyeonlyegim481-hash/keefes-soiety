import {
  buildAutomatedNewsAnalysis,
  enhanceNewsAnalysisWithAi,
  getSnapshot,
  normalizeHeadlineInput
} from "../server.mjs";
import { enrichHeadlineWithArticle } from "../news-content.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const requestedHeadline = normalizeHeadlineInput(request.body || {});
    if (!requestedHeadline.title) {
      return response.status(400).json({ error: "Headline title is required" });
    }

    const snapshot = await getSnapshot();
    const trustedHeadline = snapshot.headlines.find((item) =>
      item.id === requestedHeadline.id || item.title === requestedHeadline.title
    ) || requestedHeadline;
    const headline = await enrichHeadlineWithArticle(trustedHeadline);
    const fallback = buildAutomatedNewsAnalysis(headline, snapshot);
    const analysis = await enhanceNewsAnalysisWithAi(headline, snapshot, fallback);
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json(analysis);
  } catch (error) {
    return response.status(500).json({
      error: "News analysis failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
