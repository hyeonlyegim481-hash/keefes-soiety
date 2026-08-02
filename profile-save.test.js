import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  SAVED_ANALYSIS_MAX_BYTES,
  compactArticleAnalysis,
  normalizeSavedArticleDate
} from "./profile-client.js";

test("saved article analysis stays below the Supabase UTF-8 byte limit", () => {
  const largeText = "한국 경제와 시장의 연결 경로를 자세히 설명하는 문장입니다. ".repeat(500);
  const compact = compactArticleAnalysis({
    signal: largeText,
    tone: largeText,
    confidence: largeText,
    engineLabel: largeText,
    contentBasis: largeText,
    contentStatus: largeText,
    contentBasisReason: largeText,
    summary: largeText,
    keyPoints: Array(12).fill(largeText),
    transmissionPath: Array(12).fill(largeText),
    checkpoints: Array(12).fill(largeText),
    counterSignals: Array(12).fill(largeText),
    whyItMatters: largeText,
    marketImpact: largeText,
    koreaImpact: largeText,
    limitation: largeText
  });

  assert.ok(Buffer.byteLength(JSON.stringify(compact), "utf8") <= SAVED_ANALYSIS_MAX_BYTES);
  assert.ok(compact.summary.length > 0);
  assert.ok(compact.keyPoints.length <= 4);
});

test("saved article publication dates are normalized or safely omitted", () => {
  assert.equal(
    normalizeSavedArticleDate("2026-08-02T08:44:40Z"),
    "2026-08-02T08:44:40.000Z"
  );
  assert.equal(normalizeSavedArticleDate("날짜 미확인"), null);
  assert.equal(normalizeSavedArticleDate(""), null);
});

test("saved analysis buttons toggle removal and synchronize every matching button", () => {
  const profileSource = fs.readFileSync(new URL("./profile-client.js", import.meta.url), "utf8");
  const appSource = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8");

  assert.match(profileSource, /if \(isArticleSaved\(articleKey\)\) \{\s*return removeSavedArticle\(articleKey\);/);
  assert.doesNotMatch(profileSource, /isArticleSaved\(articleKey\) && !analysis/);
  assert.match(appSource, /function syncNewsSaveButtons\(headline\)/);
  assert.match(appSource, /data-saved-label="저장됨"/);
  assert.match(appSource, /"해제 실패" : "저장 실패"/);
});