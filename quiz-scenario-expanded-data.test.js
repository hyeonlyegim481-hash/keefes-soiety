import test from "node:test";
import assert from "node:assert/strict";
import { scenarioQuestions as baseScenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";
import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";

const legacyScenarioQuestions = [
  ...baseScenarioQuestions,
  ...extraScenarioQuestions,
  ...moreScenarioQuestions
];
const allScenarioQuestions = [...legacyScenarioQuestions, ...expandedScenarioQuestions];
const expectedCategories = [
  "금리·통화",
  "물가·고용",
  "외환·국제",
  "원자재·에너지",
  "주식·투자",
  "채권·신용",
  "은행·금융",
  "부동산·가계",
  "기업·회계",
  "무역·산업",
  "데이터·정책"
];

const normalize = (value) => value.trim().replace(/\s+/g, " ");

test("adds 220 scenario questions to make a 320-question scenario bank", () => {
  assert.equal(legacyScenarioQuestions.length, 100);
  assert.equal(expandedScenarioQuestions.length, 220);
  assert.equal(allScenarioQuestions.length, 320);
});

test("expanded scenario categories are balanced at 20 questions each", () => {
  const counts = new Map();
  expandedScenarioQuestions.forEach((question) => {
    counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
  });

  assert.deepEqual([...counts.keys()], expectedCategories);
  expectedCategories.forEach((category) => assert.equal(counts.get(category), 20));
});

test("expanded scenario questions have complete, readable fields", () => {
  expandedScenarioQuestions.forEach((question) => {
    assert.match(question.id, /^scenario-[a-z]+-[a-z0-9-]+$/);
    assert.equal(question.type, "scenario");
    assert.ok(expectedCategories.includes(question.category));
    assert.ok(["중급", "심화"].includes(question.difficulty));
    assert.ok(question.prompt.length >= 35);
    assert.ok(question.context.length >= 40);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices.map(normalize)).size, 4);
    assert.ok(Number.isInteger(question.answerIndex));
    assert.ok(question.answerIndex >= 0 && question.answerIndex < 4);
    assert.ok(question.choices[question.answerIndex].length >= 20);
    assert.ok(question.explanation.length >= 90);
    assert.ok(question.rule.length >= 45);

    const joined = [
      question.prompt,
      question.context,
      ...question.choices,
      question.explanation,
      question.rule
    ].join(" ");
    assert.doesNotMatch(joined, /\b(undefined|null|todo|lorem)\b/i);
    assert.doesNotMatch(joined, /<[^>]+>/);
  });
});

test("scenario identifiers, prompts, and expanded choice sets are not duplicated", () => {
  assert.equal(new Set(allScenarioQuestions.map((question) => question.id)).size, 320);
  assert.equal(
    new Set(expandedScenarioQuestions.map((question) => normalize(question.prompt))).size,
    220
  );
  assert.equal(
    new Set(
      expandedScenarioQuestions.map((question) =>
        question.choices.map(normalize).sort().join(" || ")
      )
    ).size,
    220
  );
});

test("correct answer positions and difficulty are evenly distributed", () => {
  const answerCounts = [0, 1, 2, 3].map(
    (index) =>
      expandedScenarioQuestions.filter((question) => question.answerIndex === index).length
  );
  const difficultyCounts = ["중급", "심화"].map(
    (difficulty) =>
      expandedScenarioQuestions.filter((question) => question.difficulty === difficulty).length
  );

  assert.deepEqual(answerCounts, [55, 55, 55, 55]);
  assert.deepEqual(difficultyCounts, [110, 110]);
});
