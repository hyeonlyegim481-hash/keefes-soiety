import test from "node:test";
import assert from "node:assert/strict";
import { historyEras, historyEvents } from "./history-data.js";
import { historyQuizQuestions } from "./quiz-history-data.js";

const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ");

test("history quiz bank contains exactly 200 staged questions", () => {
  assert.equal(historyQuizQuestions.length, 200);
  assert.deepEqual(
    Object.fromEntries(
      ["입문", "기본", "심화"].map((difficulty) => [
        difficulty,
        historyQuizQuestions.filter((question) => question.difficulty === difficulty).length
      ])
    ),
    { 입문: 62, 기본: 93, 심화: 45 }
  );
});

test("history quiz uses every event and every era from the history chapter", () => {
  const eventIds = new Set(historyQuizQuestions.map((question) => question.sourceEventId));
  const eraIds = new Set(historyQuizQuestions.map((question) => question.era));
  assert.equal(eventIds.size, historyEvents.length);
  assert.deepEqual([...eraIds].sort(), historyEras.map((era) => era.id).sort());
});

test("history quiz choices and explanations are complete and unique", () => {
  assert.equal(new Set(historyQuizQuestions.map((question) => question.id)).size, 200);
  assert.equal(
    new Set(
      historyQuizQuestions.map((question) =>
        normalize(`${question.prompt} ${question.context}`)
      )
    ).size,
    200
  );

  historyQuizQuestions.forEach((question) => {
    assert.match(question.id, /^history-[a-z0-9-]+-[a-z]+$/);
    assert.equal(question.type, "history");
    assert.ok(["입문", "기본", "심화"].includes(question.difficulty));
    assert.ok([1, 2, 3].includes(question.stage));
    assert.ok(question.prompt.length >= 20);
    assert.ok(question.context.length >= 25);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices.map(normalize)).size, 4);
    assert.ok(Number.isInteger(question.answerIndex));
    assert.ok(question.answerIndex >= 0 && question.answerIndex < 4);
    assert.ok(question.explanation.length >= 45);
    assert.ok(question.rule.length >= 35);
    assert.doesNotMatch(
      [
        question.prompt,
        question.context,
        ...question.choices,
        question.explanation,
        question.rule
      ].join(" "),
      /\b(undefined|null|todo|lorem)\b|<[^>]+>/i
    );
  });
});
