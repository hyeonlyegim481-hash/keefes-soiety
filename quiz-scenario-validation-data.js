import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";

const VALIDATION_QUESTION_TARGET = 100;
const groupedQuestions = new Map();

for (const question of expandedScenarioQuestions) {
  const group = groupedQuestions.get(question.category) || [];
  group.push(question);
  groupedQuestions.set(question.category, group);
}

const sourceQuestions = [];
for (let index = 0; sourceQuestions.length < VALIDATION_QUESTION_TARGET; index += 1) {
  for (const group of groupedQuestions.values()) {
    if (group[index]) sourceQuestions.push(group[index]);
    if (sourceQuestions.length === VALIDATION_QUESTION_TARGET) break;
  }
}

function normalizeChoice(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getRuleAlternatives(sourceIndex, correctRule) {
  const alternatives = [];
  const seen = new Set([normalizeChoice(correctRule)]);
  for (
    let offset = 1;
    offset <= sourceQuestions.length * 2 && alternatives.length < 3;
    offset += 1
  ) {
    const candidate = sourceQuestions[(sourceIndex + offset * 17) % sourceQuestions.length];
    const rule = normalizeChoice(candidate.rule);
    if (!rule || seen.has(rule)) continue;
    alternatives.push(rule);
    seen.add(rule);
  }
  return alternatives;
}

export const scenarioValidationQuestions = sourceQuestions.map((source, index) => {
  const correct = normalizeChoice(source.rule);
  const alternatives = getRuleAlternatives(index, correct);
  if (alternatives.length !== 3) {
    throw new Error("상황판단 검증 문제의 오답 선택지를 충분히 만들지 못했습니다.");
  }
  const answerIndex = index % 4;
  const choices = [...alternatives];
  choices.splice(answerIndex, 0, correct);
  const firstJudgment = source.choices[source.answerIndex];
  const condition = source.prompt
    .replace(/\s*이때 가장 합리적인 판단은 무엇일까요\?$/, "")
    .trim();

  return {
    id: `scenario-verify-${source.id.replace(/^scenario-/, "")}`,
    type: "scenario",
    category: source.category,
    difficulty: "심화",
    prompt: `${condition} 이 상황에 대한 판단을 검증할 때 가장 먼저 확인할 기준은 무엇일까요?`,
    context: `가능한 1차 판단은 "${firstJudgment}"입니다. 결론을 확정하기 전에 비교 기준과 반대 신호를 확인해야 합니다.`,
    choices,
    answerIndex,
    explanation: `${source.explanation} 따라서 이 문제에서는 "${correct}"라는 검증 절차가 가장 적절합니다.`,
    rule: correct
  };
});
