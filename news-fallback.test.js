import test from "node:test";
import assert from "node:assert/strict";
import { buildAutomatedNewsAnalysis } from "./server.mjs";

test("non-AI fallback rewrites the article instead of exposing extracted sentences", () => {
  const extractedSentence =
    "원문 추출 전용 문장 7391: 이 문장은 실패 대체 요약에 그대로 공개되면 안 됩니다.";
  const headline = {
    id: "fallback-test",
    title: "한국 수출과 환율의 움직임을 점검한다",
    topic: "한국경제",
    source: "테스트경제",
    url: "https://example.com/news/fallback-test",
    publishedAt: "2026-07-24T01:00:00.000Z",
    articleContent: `${extractedSentence} ${extractedSentence}`,
    articleSummary: extractedSentence,
    articleKeyPoints: [extractedSentence],
    contentBasis: "article",
    articleAuthor: "김경제",
    articlePublishedAt: "2026-07-24T01:00:00.000Z",
    articleModifiedAt: "2026-07-24T02:00:00.000Z",
    articleUrl: "https://example.com/news/fallback-test",
    relatedSourceCount: 1
  };
  const result = buildAutomatedNewsAnalysis(headline, {
    markets: [],
    macro: [],
    analysis: { riskScore: 48 }
  });
  const publicText = JSON.stringify({
    summary: result.summary,
    keyPoints: result.keyPoints,
    whyItMatters: result.whyItMatters,
    marketImpact: result.marketImpact,
    koreaImpact: result.koreaImpact,
    checkpoints: result.checkpoints,
    limitation: result.limitation
  });

  assert.equal(result.aiGenerated, false);
  assert.equal(result.analysisMode, "rules");
  assert.doesNotMatch(publicText, /원문 추출 전용 문장 7391/);
  assert.equal(result.sourceInfo.author, "김경제");
  assert.equal(result.sourceInfo.originalUrl, headline.articleUrl);
});
