import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appUrl = new URL("./app.js", import.meta.url);
const htmlUrl = new URL("./index.html", import.meta.url);

test("quiz UI exposes the scoring rules only when opened", async () => {
  const html = await readFile(htmlUrl, "utf8");
  assert.match(html, /<details class="quiz-score-rules">/);
  assert.match(html, /<strong>정답<\/strong><b>\+10 XP<\/b>/);
  assert.match(html, /<strong>오답<\/strong><b data-tone="negative">-5 XP<\/b>/);
  assert.match(html, /<strong>하루 제한<\/strong><b>없음<\/b>/);
  assert.match(html, /<strong>최저 XP<\/strong><b>0 XP<\/b>/);
});

test("quiz UI uses only reviewed glossary explanations and loads scenario and history banks", async () => {
  const source = await readFile(appUrl, "utf8");
  assert.match(source, /quizGlossaryTerms = glossaryTerms\.filter\(\(item\) => item\.quizEligible !== false\)/);
  assert.match(source, /quiz-scenario-validation-data\.js/);
  assert.match(source, /quiz-history-data\.js/);
  assert.match(source, /id: "history", label: "경제 역사"/);
  assert.match(source, /용어 4 \+ 상황 4 \+ 역사 4/);
  assert.match(source, /mode === "history" \? 12/);
});
