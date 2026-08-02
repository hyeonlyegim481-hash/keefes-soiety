import test from "node:test";
import assert from "node:assert/strict";
import { decodeGoogleNewsUrl, extractArticleContent, extractArticleMetadata, hasArticleEvidence } from "./news-content.js";

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

test("resolves current Google News RSS article links from the original RSS page", async (t) => {
  const sourceUrl = "https://news.google.com/rss/articles/CBMiWkFVX3lxTE1SOWlKYm9KdTlBaFU5TGRnN3FmNElIVnJWb2I2emN0VktfTGV6akVfUHM1MjZMdTdJc2MxdlM5UXI3TjNTMFA1QllBNUtBUzMwY0JFSXJBM1NEdw?oc=5";
  const publisherUrl = "https://publisher.example/economy/article-1";
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    if (calls.length === 1) {
      return new Response('<main data-n-a-sg="signature-token" data-n-a-ts="1785678905"></main>', {
        status: 200,
        headers: { "content-type": "text/html" }
      });
    }
    const inner = JSON.stringify([null, publisherUrl]);
    const outer = JSON.stringify([["wrb.fr", "Fbv4je", inner, null, null, null]]);
    return new Response(")]}'\n" + outer + "\n", { status: 200 });
  };

  const resolved = await decodeGoogleNewsUrl(sourceUrl);

  assert.equal(resolved, publisherUrl);
  assert.match(calls[0], /^https:\/\/news\.google\.com\/rss\/articles\//);
  assert.match(calls[0], /hl=ko/);
  assert.equal(calls[1], "https://news.google.com/_/DotsSplashUi/data/batchexecute");
});

test("extracts article text from semantic news containers that use line breaks", () => {
  const paragraph = "한국 수출과 기업 실적은 환율, 글로벌 수요, 원자재 가격을 함께 확인해야 방향을 판단할 수 있습니다.";
  const body = Array.from({ length: 8 }, (_, index) => String(index + 1) + ". " + paragraph).join("<br>");
  const html = '<div class="newsct_article">' + body + "</div>";
  const content = extractArticleContent(html);

  assert.ok(content.length >= 240);
  assert.match(content, /한국 수출과 기업 실적/);
});

test("extracts publisher body paragraphs embedded in content_elements JSON", () => {
  const first = "한국은행은 기준금리를 올렸고 수출과 물가 흐름을 다음 회의까지 함께 점검하겠다고 밝혔습니다.";
  const second = "반도체 투자 증가가 성장률을 높일 수 있지만 가계 이자 부담은 소비를 제약할 수 있습니다.";
  const rows = Array.from({ length: 4 }, (_, index) => [
    { type: "text", content: String(index + 1) + "차 점검에서 " + first },
    { type: "text", content: String(index + 1) + "차 전망에서는 " + second }
  ]).flat();
  const html = '<script>window.__DATA__={"content_elements":' + JSON.stringify(rows) + "}</script>";
  const content = extractArticleContent(html);

  assert.ok(content.length >= 240);
  assert.match(content, /기준금리를 올렸고/);
  assert.match(content, /가계 이자 부담/);
});

test("article evidence tolerates spacing differences in a distinctive title phrase", () => {
  const body = "호남 반도체 산업은 대규모 전력망 확보 여부가 성패를 가를 전망입니다. "
    + "송전망과 발전 설비 투자 일정이 지연되면 기업의 공장 건설 계획도 늦어질 수 있습니다. "
    + "정부와 지방자치단체는 전력 수요와 공급 계획을 함께 검토하고 있습니다.";
  assert.equal(hasArticleEvidence(body.repeat(2), "호남반도체, 전력에 성패 달렸다"), true);
});
