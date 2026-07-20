import test from "node:test";
import assert from "node:assert/strict";

import { glossaryTerms } from "./glossary-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js";

const existingTerms = [
  ...glossaryTerms,
  ...glossaryCoreExtraTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms
];
const normalize = (value) => value
  .normalize("NFKC")
  .toLocaleLowerCase("ko-KR")
  .replace(/[\s·()\-_,./]/g, "");

test("adds fifty detailed glossary terms for a 645-term bank", () => {
  const allTerms = [...existingTerms, ...glossaryExpandedTerms];

  assert.equal(glossaryExpandedTerms.length, 50);
  assert.equal(allTerms.length, 645);
  assert.equal(new Set(allTerms.map((item) => normalize(item.term))).size, allTerms.length);
  assert.equal(new Set(allTerms.map((item) => normalize(item.english))).size, allTerms.length);
});

test("gives every new term a plain explanation, example and caution", () => {
  const existingCategories = new Set(existingTerms.map((item) => item.category));

  for (const item of glossaryExpandedTerms) {
    assert.ok(existingCategories.has(item.category), `${item.category} is not an existing category`);
    assert.ok(item.definition.length >= 35, `${item.term} definition is too short`);
    assert.ok(item.plain.length >= 35, `${item.term} plain explanation is too short`);
    assert.ok(item.why.length >= 35, `${item.term} importance is too short`);
    assert.ok(item.example.length >= 35, `${item.term} example is too short`);
    assert.ok(item.caution.length >= 30, `${item.term} caution is too short`);
    assert.equal(item.related.length, 3);
  }
});
