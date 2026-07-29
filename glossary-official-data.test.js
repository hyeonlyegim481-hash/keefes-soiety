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
  BOK_GLOSSARY_SOURCE,
  bokOfficialGlossaryTitles,
  buildOfficialGlossary
} from "./glossary-official-data.js";

const curatedTerms = [
  ...baseCoreTerms,
  ...glossaryCoreExtraTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms,
  ...glossaryExpandedTerms
];
const glossary = buildOfficialGlossary(curatedTerms);
const quizTerms = glossary.filter((item) => item.quizEligible !== false);

test("uses the 2026 Bank of Korea official glossary titles without generated combinations", () => {
  assert.equal(bokOfficialGlossaryTitles.length, 789);
  assert.equal(new Set(bokOfficialGlossaryTitles).size, bokOfficialGlossaryTitles.length);
  assert.equal(glossary.length, 1_298);
  assert.equal(glossary.filter((item) => item.kind === "applied").length, 0);

  const names = new Set(glossary.map((item) => item.term));
  [
    "정기예금 만기수령액",
    "주택담보대출 총대출비용",
    "소비자물가 전년동기비",
    "가중평균자본비용 민감도분석",
    "GDP시계열 단위근검정"
  ].forEach((term) => assert.equal(names.has(term), false, `generated term remained: ${term}`));
});

test("keeps official-only entries out of quizzes until their explanation is reviewed", () => {
  assert.equal(curatedTerms.length, 645);
  assert.equal(quizTerms.length, 645);
  assert.ok(quizTerms.every((item) => item.officialOnly !== true));
  assert.ok(quizTerms.every((item) => item.definition.length >= 12));
  assert.equal(new Set(quizTerms.map((item) => item.term)).size, quizTerms.length);
});

test("shows official provenance for every Bank of Korea entry", () => {
  const officialOnly = glossary.filter((item) => item.officialOnly);
  assert.equal(officialOnly.length, 653);
  assert.ok(officialOnly.every((item) => item.sourceInstitution === "한국은행"));
  assert.ok(officialOnly.every((item) => item.sourceTitle === "경제금융용어 800선"));
  assert.ok(officialOnly.every((item) => item.sourceUrl === BOK_GLOSSARY_SOURCE.url));
  assert.ok(officialOnly.every((item) => item.sourcePublishedAt === "2026-01-29"));

  [
    "가계부실위험지수(HDRI)",
    "중앙은행 디지털화폐(CBDC)",
    "무위험지표금리(KOFR)",
    "V-KOSPI"
  ].forEach((term) => {
    const represented = glossary.some((item) => item.term === term || item.sourceTitle === term);
    assert.ok(represented, `missing official term: ${term}`);
  });
});
