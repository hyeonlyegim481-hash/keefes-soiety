import test from "node:test";
import assert from "node:assert/strict";
import { scenarioQuestions as baseScenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";

const allScenarioQuestions = [
  ...baseScenarioQuestions,
  ...extraScenarioQuestions,
  ...moreScenarioQuestions
];

const expectedCategories = [
  "주식·투자",
  "은행·금융",
  "부동산·가계",
  "채권·신용",
  "기업·회계",
  "외환·국제",
  "시장심리·자금",
  "원자재·에너지",
  "세금·연금",
  "행동경제"
];

test("adds 40 practical scenario questions for a 100-question bank", () => {
  assert.equal(moreScenarioQuestions.length, 40);
  assert.equal(allScenarioQuestions.length, 100);
  assert.equal(new Set(allScenarioQuestions.map((item) => item.id)).size, 100);
});

test("keeps every new scenario complete and review-ready", () => {
  for (const item of moreScenarioQuestions) {
    assert.ok(item.id);
    assert.equal(item.type, "scenario");
    assert.ok(["중급", "심화"].includes(item.difficulty));
    assert.ok(item.prompt.length >= 25, `${item.id} needs a clearer prompt`);
    assert.ok(item.context.length >= 20, `${item.id} needs more context`);
    assert.equal(item.choices.length, 4, `${item.id} must have four choices`);
    assert.equal(new Set(item.choices).size, 4, `${item.id} has duplicate choices`);
    assert.ok(Number.isInteger(item.answerIndex));
    assert.ok(item.answerIndex >= 0 && item.answerIndex < item.choices.length);
    assert.ok(item.explanation.length >= 65, `${item.id} needs a fuller explanation`);
    assert.ok(item.rule.length >= 25, `${item.id} needs a practical rule`);
  }
});

test("balances the additions across ten underrepresented categories", () => {
  const categoryCounts = new Map();
  for (const item of moreScenarioQuestions) {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  }

  assert.deepEqual([...categoryCounts.keys()], expectedCategories);
  assert.ok([...categoryCounts.values()].every((count) => count === 4));
});