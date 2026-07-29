import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildAutomatedNewsAnalysis,
  NEWS_HEADLINE_LIMIT,
  NEWS_ITEMS_PER_FEED,
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

test("news collection expands to fifty-four unique headlines with eighteen candidates per feed", () => {
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
  const items = Array.from({ length: 81 }, (_, index) => ({
    id: `item-${index}`,
    section: sections[index % sections.length],
    source: `source-${index % 20}`,
    topic: `topic-${index % 24}`,
    relevanceScore: 200 - index,
    publishedAt: new Date(now - index * 60_000).toISOString()
  }));
  const selected = selectSectionedHeadlines(items);

  assert.equal(NEWS_HEADLINE_LIMIT, 54);
  assert.equal(NEWS_ITEMS_PER_FEED, 18);
  assert.equal(selected.length, NEWS_HEADLINE_LIMIT);
  assert.equal(new Set(selected.map((item) => item.id)).size, NEWS_HEADLINE_LIMIT);
});

test("otherwise comparable recent headlines rank above older headlines", () => {
  const ranked = rankAndDedupeHeadlines(
    [
      {
        id: "recent-policy",
        topic: "정책·지표",
        section: "korea",
        title: "한국은행 기준금리 결정, 원화 환율과 가계대출 영향",
        source: "Reuters",
        url: "https://example.com/recent-policy",
        publishedAt: new Date(now - 60 * 60 * 1000).toISOString()
      },
      {
        id: "older-policy",
        topic: "정책·지표",
        section: "korea",
        title: "정부 소비자물가 전망, 내수 소비와 시장금리 영향",
        source: "Reuters",
        url: "https://example.com/older-policy",
        publishedAt: new Date(now - 60 * 60 * 60 * 1000).toISOString()
      }
    ],
    now
  );

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].id, "recent-policy");
  assert.ok(ranked[0].relevanceScore > ranked[1].relevanceScore);
});

test("news section navigator keeps the selected filter readable", () => {
  const css = fs.readFileSync(new URL("./news-system.css", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8");
  const selectedRule = css.match(/#news \.news-filter-tabs button\[aria-selected="true"\] \{[^}]+\}/s)?.[0] || "";

  assert.match(selectedRule, /background:\s*#17242c/);
  assert.match(selectedRule, /color:\s*#ffffff/);
  assert.match(app, /class="news-filter-current"/);
  assert.match(app, /class="news-section-number"/);
});


test("news detail summary exposes a clear three-step analysis hierarchy", () => {
  const app = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("./news-system.css", import.meta.url), "utf8");
  assert.match(app, /class="news-analysis-outline"/);
  assert.match(app, /data-analysis-step="1"/);
  assert.match(app, /data-analysis-step="2"/);
  assert.match(app, /data-analysis-step="3"/);
  assert.match(css, /\.news-analysis-chapter-heading/);
  assert.match(css, /\.news-analysis-outline/);
});
