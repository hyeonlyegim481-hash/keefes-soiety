import test from "node:test";
import assert from "node:assert/strict";
import { glossaryTerms } from "./glossary-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";

const existingTerms = [
  ...glossaryTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms
];

const normalize = (value) => value.normalize("NFKC").replace(/\s+/g, "").toLocaleLowerCase("ko-KR");

test("adds 100 complete glossary terms without duplicates", () => {
  const allTerms = [...existingTerms, ...glossarySpecialTerms];
  const normalizedTerms = allTerms.map((item) => normalize(item.term));

  assert.equal(glossarySpecialTerms.length, 100);
  assert.equal(allTerms.length, 535);
  assert.equal(new Set(normalizedTerms).size, allTerms.length);

  for (const item of glossarySpecialTerms) {
    assert.ok(item.term);
    assert.ok(item.english);
    assert.ok(item.category);
    assert.ok(item.definition.length >= 25, `${item.term} needs a clearer definition`);
    assert.equal(item.related.length, 3);
  }
});

test("balances the new terms across ten existing categories", () => {
  const existingCategories = new Set(existingTerms.map((item) => item.category));
  const categoryCounts = new Map();

  for (const item of glossarySpecialTerms) {
    assert.ok(existingCategories.has(item.category), `${item.category} is not an existing category`);
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  }

  assert.equal(categoryCounts.size, 10);
  assert.ok([...categoryCounts.values()].every((count) => count === 10));
});

