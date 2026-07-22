import test from "node:test";
import assert from "node:assert/strict";
import { extractArticleContent } from "./news-content.js";

test("decodes named HTML entities in JSON article bodies", () => {
  const sentence = "한국 경제가 &lsquo;회복 국면&rsquo;에 들어섰다는 평가와 함께 수출&middot;소비&middot;고용 지표를 모두 확인해야 한다는 분석이 나왔습니다.";
  const html = `<script type="application/ld+json">{"articleBody":"${sentence.repeat(5)}"}</script>`;
  const content = extractArticleContent(html);

  assert.match(content, /‘회복 국면’/);
  assert.match(content, /수출·소비·고용/);
  assert.doesNotMatch(content, /&(lsquo|rsquo|middot);/);
});
