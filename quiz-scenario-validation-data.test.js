import test from "node:test";
import assert from "node:assert/strict";
import { scenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";
import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";
import { scenarioValidationQuestions } from "./quiz-scenario-validation-data.js";

const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ");
const completeScenarioBank = [
  ...scenarioQuestions,
  ...extraScenarioQuestions,
  ...moreScenarioQuestions,
  ...expandedScenarioQuestions,
  ...scenarioValidationQuestions
];

test("adds exactly 100 validation scenarios for a 420-question bank", () => {
  assert.equal(scenarioValidationQuestions.length, 100);
  assert.equal(completeScenarioBank.length, 420);
  assert.equal(new Set(completeScenarioBank.map((question) => question.id)).size, 420);
});

test("validation scenarios cover every expanded scenario category", () => {
  const expectedCategories = new Set(
    expandedScenarioQuestions.map((question) => question.category)
  );
  const counts = new Map();
  scenarioValidationQuestions.forEach((question) => {
    counts.set(question.category, (counts.get(question.category) || 0) + 1);
  });
  assert.deepEqual(new Set(counts.keys()), expectedCategories);
  counts.forEach((count) => assert.ok(count === 9 || count === 10));
});

test("validation scenarios have four distinct choices and balanced answers", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map(
      (answerIndex) =>
        scenarioValidationQuestions.filter(
          (question) => question.answerIndex === answerIndex
        ).length
    ),
    [25, 25, 25, 25]
  );
  assert.equal(
    new Set(scenarioValidationQuestions.map((question) => normalize(question.prompt))).size,
    100
  );

  scenarioValidationQuestions.forEach((question) => {
    assert.match(question.id, /^scenario-verify-[a-z0-9-]+$/);
    assert.equal(question.type, "scenario");
    assert.equal(question.difficulty, "심화");
    assert.ok(question.prompt.length >= 45);
    assert.ok(question.context.length >= 55);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices.map(normalize)).size, 4);
    assert.ok(question.answerIndex >= 0 && question.answerIndex < 4);
    assert.ok(question.explanation.length >= 100);
    assert.ok(question.rule.length >= 45);
  });
});
