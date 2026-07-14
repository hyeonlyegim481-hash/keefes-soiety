import test from "node:test";
import assert from "node:assert/strict";
import { glossaryTerms } from "./glossary-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";

const existingTerms = [
  ...glossaryTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms
];
const allTerms = [...existingTerms, ...glossaryCoreExtraTerms];
const normalize = (value) => value
  .normalize("NFKC")
  .toLocaleLowerCase("ko-KR")
  .replace(/[\s·()\-_,./]/g, "");

test("expands the core glossary to 200 and the full glossary to 595", () => {
  assert.equal(glossaryTerms.length, 140);
  assert.equal(glossaryCoreExtraTerms.length, 60);
  assert.equal(glossaryTerms.length + glossaryCoreExtraTerms.length, 200);
  assert.equal(allTerms.length, 595);
});

test("adds complete core terms without Korean or English duplicates", () => {
  assert.equal(new Set(allTerms.map((item) => normalize(item.term))).size, allTerms.length);
  assert.equal(new Set(allTerms.map((item) => normalize(item.english))).size, allTerms.length);

  const existingCategories = new Set(existingTerms.map((item) => item.category));
  for (const item of glossaryCoreExtraTerms) {
    assert.ok(item.term);
    assert.ok(item.english);
    assert.ok(existingCategories.has(item.category), item.category + " is not an existing category");
    assert.ok(item.definition.length >= 25, item.term + " needs a clearer definition");
    assert.equal(item.related.length, 3);
  }
});

test("covers the essential concepts a beginner should meet first", () => {
  const terms = new Set(glossaryCoreExtraTerms.map((item) => item.term));
  const required = [
    "인플레이션",
    "명목 GDP",
    "실질 GDP",
    "완전고용",
    "예금금리",
    "대출금리",
    "ETF",
    "분산투자",
    "자산",
    "부채",
    "자본",
    "재무상태표",
    "손익계산서",
    "현금흐름표",
    "단리",
    "복리",
    "수요",
    "공급",
    "균형가격",
    "탄력성"
  ];

  for (const term of required) {
    assert.ok(terms.has(term), term + " should be included in the core glossary");
  }
});