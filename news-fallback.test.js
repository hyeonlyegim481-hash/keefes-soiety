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
  assert.match(result.marketImpact, /자료 부족/);
  assert.doesNotMatch(result.marketImpact, /(?:원\/달러|WTI) 0|\+0(?:\.0+)?%/);
});

test("headline fallback preserves a readable article collection reason", () => {
  const result = buildAutomatedNewsAnalysis(
    {
      id: "headline-only",
      title: "미국 금리와 한국 환율의 움직임",
      source: "테스트경제",
      publishedAt: "2026-07-24T01:00:00.000Z",
      contentBasis: "headline",
      contentStatus: "headline-fallback",
      contentFailureCode: "fetch-timeout",
      contentBasisReason: "원문 서버 응답 시간이 초과되어 제목만 사용했습니다."
    },
    {
      markets: [],
      macro: [],
      analysis: { riskScore: 48 }
    }
  );

  assert.equal(result.contentBasis, "headline");
  assert.equal(result.contentStatus, "headline-fallback");
  assert.equal(result.contentFailureCode, "fetch-timeout");
  assert.match(result.contentBasisReason, /응답 시간이 초과/);
});
