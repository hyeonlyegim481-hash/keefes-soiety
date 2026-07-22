import test from "node:test";
import assert from "node:assert/strict";

import { glossaryTerms as baseCoreTerms } from "./glossary-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js";
import {
  buildMasterGlossary,
  MASTER_ADVANCED_TARGET,
  MASTER_CORE_TARGET
} from "./glossary-master-data.js";

const existingCore = [...baseCoreTerms, ...glossaryCoreExtraTerms];
const existingAdvanced = [
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms,
  ...glossaryExpandedTerms
];
const existingTerms = [...existingCore, ...existingAdvanced];
const master = buildMasterGlossary(existingTerms);
const allTerms = [...existingTerms, ...master.core, ...master.advanced];

const normalize = (value) => String(value || "")
  .normalize("NFKC")
  .toLocaleLowerCase("ko-KR")
  .replace(/[\s·()\-_,./]/g, "");

test("expands the glossary to exactly 2,000 terms with a 700-term core", () => {
  assert.equal(existingTerms.length, 645);
  assert.equal(master.core.length, MASTER_CORE_TARGET);
  assert.equal(master.advanced.length, MASTER_ADVANCED_TARGET);
  assert.equal(existingCore.length + master.core.length, 700);
  assert.equal(existingAdvanced.length + master.advanced.length, 1_300);
  assert.equal(allTerms.length, 2_000);
});

test("keeps Korean and English glossary names unique", () => {
  assert.equal(new Set(allTerms.map((item) => normalize(item.term))).size, allTerms.length);
  assert.equal(new Set(allTerms.map((item) => normalize(item.english))).size, allTerms.length);
});

test("gives every added term a detailed explanation, example, caution, and three related terms", () => {
  for (const item of [...master.core, ...master.advanced]) {
    assert.ok(item.term.length >= 3, `${item.term}: missing term`);
    assert.ok(item.english.length >= 5, `${item.term}: missing English name`);
    assert.ok(item.definition.length >= 55, `${item.term}: short definition`);
    assert.ok(item.plain.length >= 55, `${item.term}: short plain explanation`);
    assert.ok(item.why.length >= 55, `${item.term}: short importance`);
    assert.ok(item.example.length >= 55, `${item.term}: short example`);
    assert.ok(item.caution.length >= 45, `${item.term}: short caution`);
    assert.equal(item.related.length, 3, `${item.term}: related terms`);
  }
});

test("covers household, markets, banking, macroeconomics, companies, and data analysis", () => {
  const categories = new Set([...master.core, ...master.advanced].map((item) => item.category));
  [
    "거시경제",
    "주식·투자",
    "채권·신용",
    "파생·위험",
    "기업·회계",
    "기업금융·M&A",
    "은행·금융",
    "부동산·가계",
    "세금·연금",
    "지급결제·핀테크",
    "데이터·통계"
  ].forEach((category) => assert.ok(categories.has(category), `missing category: ${category}`));

  const termNames = new Set(allTerms.map((item) => item.term));
  [
    "정기예금 만기수령액",
    "주택담보대출 총대출비용",
    "소비자물가 전년동기비",
    "국고채 수정듀레이션",
    "원달러환율 내재변동성",
    "주택담보대출포트폴리오 예상신용손실",
    "가중평균자본비용 민감도분석",
    "GDP시계열 단위근검정"
  ].forEach((term) => assert.ok(termNames.has(term), `missing representative term: ${term}`));
});
