import test from "node:test";
import assert from "node:assert/strict";
import { extractArticleContent, extractArticleMetadata } from "./news-content.js";

test("decodes named HTML entities in JSON article bodies", () => {
  const sentence = "한국 경제가 &lsquo;회복 국면&rsquo;에 들어섰다는 평가와 함께 수출&middot;소비&middot;고용 지표를 모두 확인해야 한다는 분석이 나왔습니다.";
  const html = `<script type="application/ld+json">{"articleBody":"${sentence.repeat(5)}"}</script>`;
  const content = extractArticleContent(html);

  assert.match(content, /‘회복 국면’/);
  assert.match(content, /수출·소비·고용/);
  assert.doesNotMatch(content, /&(lsquo|rsquo|middot);/);
});

test("extracts author, exact publication time, modification time, and canonical URL", () => {
  const html = `
    <meta property="article:published_time" content="2026-07-24T08:15:30+09:00">
    <meta property="article:modified_time" content="2026-07-24T09:05:10+09:00">
    <link rel="canonical" href="https://example.com/economy/article-1">
    <script type="application/ld+json">
      {"@type":"NewsArticle","author":{"@type":"Person","name":"김경제"}}
    </script>
  `;
  const metadata = extractArticleMetadata(html);

  assert.equal(metadata.articleAuthor, "김경제");
  assert.equal(metadata.articlePublishedAt, "2026-07-23T23:15:30.000Z");
  assert.equal(metadata.articleModifiedAt, "2026-07-24T00:05:10.000Z");
  assert.equal(metadata.articleUrl, "https://example.com/economy/article-1");
});