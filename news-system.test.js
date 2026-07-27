import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAutomatedNewsAnalysis,
  rankAndDedupeHeadlines,
  selectSectionedHeadlines
} from "./server.mjs";

const now = Date.UTC(2026, 6, 27, 4, 0, 0);

test("rule-based news analysis returns a detailed structured brief without raw sentences", () => {
  const rawSentence =
    "원문비공개표식-9284 한국은행이 기준금리를 조정했고 기사 원문에는 2.5%와 18조원이 언급됐습니다.";
  const result = buildAutomatedNewsAnalysis(
    {
      id: "detailed-rule-test",
      title: "한국은행 금리 변화에 원화와 가계대출 영향 주목",
      topic: "정책·지표",
      section: "korea",
      source: "테스트경제",
      url: "https://example.com/detailed-rule-test",
      publishedAt: "2026-07-27T01:00:00.000Z",
      articleContent: `${rawSentence} ${rawSentence}`,
      articleSummary: rawSentence,
      articleKeyPoints: [rawSentence],
      contentBasis: "article",
      articleUrl: "https://example.com/detailed-rule-test",
      relatedSourceCount: 2
    },
    {
      markets: [],
      macro: [],
      analysis: { riskScore: 52 }
    }
  );

  assert.equal(result.aiGenerated, false);
  assert.equal(result.analysisMode, "rules");
  assert.ok(result.summary.length >= 260);
  assert.equal(result.keyPoints.length, 5);
  assert.equal(result.transmissionPath.length, 4);
  assert.equal(result.timeHorizon.length, 3);
  assert.equal(result.counterSignals.length, 2);
  assert.match(result.summary, /2\.5%/);
  assert.match(result.summary, /18조원/);
  assert.doesNotMatch(JSON.stringify(result), /원문비공개표식-9284/);
});

test("industry and household headlines survive relevance filtering as separate sections", () => {
  const ranked = rankAndDedupeHeadlines(
    [
      {
        id: "industry-1",
        topic: "글로벌 기업·기술",
        section: "industry",
        title: "AI 데이터센터 투자 확대에 반도체 공급망과 기업 매출 증가",
        source: "Reuters",
        url: "https://example.com/industry-1",
        publishedAt: new Date(now - 60 * 60 * 1000).toISOString()
      },
      {
        id: "households-1",
        topic: "노동·소비",
        section: "households",
        title: "한국 취업자와 임금 증가, 소비자심리와 소매판매 회복",
        source: "연합뉴스",
        url: "https://example.com/households-1",
        publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    now
  );
  const selected = selectSectionedHeadlines(ranked, 36);

  assert.equal(ranked.length, 2);
  assert.deepEqual(
    new Set(selected.map((headline) => headline.section)),
    new Set(["industry", "households"])
  );
});

test("section selection can expand beyond the previous twenty-eight article ceiling", () => {
  const sections = [
    "korea",
    "industry",
    "households",
    "politics",
    "security-disasters",
    "us",
    "china-asia",
    "europe-global",
    "commodities-fx"
  ];
  const items = Array.from({ length: 40 }, (_, index) => ({
    id: `item-${index}`,
    section: sections[index % sections.length],
    source: `source-${index % 12}`,
    topic: `topic-${index % 16}`,
    relevanceScore: 100 - index,
    publishedAt: new Date(now - index * 60_000).toISOString()
  }));
  const selected = selectSectionedHeadlines(items, 36);

  assert.equal(selected.length, 36);
  assert.equal(new Set(selected.map((item) => item.id)).size, 36);
});
