import { historyEras, historyEvents } from "./history-data.js";

const HISTORY_QUIZ_TARGET = 200;
const eraById = new Map(historyEras.map((era) => [era.id, era]));

function normalizeChoice(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function pickAlternatives(pool, startIndex, selectValue, correctValue) {
  const correctKey = normalizeChoice(correctValue);
  const alternatives = [];
  const seen = new Set([correctKey]);

  for (let offset = 1; offset <= pool.length * 2 && alternatives.length < 3; offset += 1) {
    const item = pool[(startIndex + offset * 7) % pool.length];
    const value = normalizeChoice(selectValue(item));
    if (!value || seen.has(value)) continue;
    alternatives.push(value);
    seen.add(value);
  }
  if (alternatives.length !== 3) {
    throw new Error("경제 역사 퀴즈의 오답 선택지를 충분히 만들지 못했습니다.");
  }
  return alternatives;
}

function arrangeChoices(correct, alternatives, seed) {
  const answerIndex = Math.abs(seed) % 4;
  const choices = [...alternatives.slice(0, 3)];
  choices.splice(answerIndex, 0, normalizeChoice(correct));
  return { choices, answerIndex };
}

const templates = [
  {
    id: "event",
    difficulty: "입문",
    stage: 1,
    build(event, eventIndex) {
      const correct = event.title;
      return {
        prompt: "다음 설명에 해당하는 경제사 사건은 무엇일까요?",
        context: `${event.year} · ${event.region}. ${event.summary}`,
        correct,
        alternatives: pickAlternatives(historyEvents, eventIndex, (item) => item.title, correct),
        explanation: `${event.title}은(는) ${event.cause} 그 결과 ${event.result}`,
        rule: "연도와 지역만 외우기보다 원인, 충격의 전달 경로, 결과를 한 묶음으로 연결합니다."
      };
    }
  },
  {
    id: "era",
    difficulty: "입문",
    stage: 1,
    build(event, eventIndex) {
      const era = eraById.get(event.era);
      const correct = `${era.label} (${era.period})`;
      return {
        prompt: `"${event.title}"은 사이트의 어느 경제사 단계에 속할까요?`,
        context: `${event.year}에 일어난 사건입니다. ${event.summary}`,
        correct,
        alternatives: pickAlternatives(
          historyEras,
          historyEras.findIndex((item) => item.id === event.era),
          (item) => `${item.label} (${item.period})`,
          correct
        ),
        explanation: `${event.title}은(는) ${era.label} 단계에 속합니다. 이 시기는 ${era.summary}`,
        rule: "사건의 정확한 연도와 함께 앞뒤 시대의 제도 변화까지 확인합니다."
      };
    }
  },
  {
    id: "cause",
    difficulty: "기본",
    stage: 2,
    build(event, eventIndex) {
      const correct = event.cause;
      return {
        prompt: `${event.title}이 발생하거나 확산된 핵심 배경으로 가장 알맞은 것은 무엇일까요?`,
        context: `${event.year} · ${event.region}. ${event.summary}`,
        correct,
        alternatives: pickAlternatives(historyEvents, eventIndex, (item) => item.cause, correct),
        explanation: `${event.cause} 이 배경이 충격을 키우면서 ${event.result}`,
        rule: "한 사건을 한 가지 원인으로 단정하지 말고 금융, 정책, 공급, 심리가 함께 작동했는지 봅니다."
      };
    }
  },
  {
    id: "result",
    difficulty: "기본",
    stage: 2,
    build(event, eventIndex) {
      const correct = event.result;
      return {
        prompt: `${event.title} 이후 나타난 결과로 가장 알맞은 것은 무엇일까요?`,
        context: `${event.summary} 이후 제도와 실물경제에 어떤 변화가 남았는지 판단해 보세요.`,
        correct,
        alternatives: pickAlternatives(historyEvents, eventIndex, (item) => item.result, correct),
        explanation: `${event.result} 오늘날에는 ${event.today}`,
        rule: "단기 시장 반응과 장기 제도 변화, 분배 효과를 구분해서 봅니다."
      };
    }
  },
  {
    id: "lesson",
    difficulty: "심화",
    stage: 3,
    build(event, eventIndex) {
      const correct = event.today;
      return {
        prompt: `${event.title}을 오늘의 경제 상황에 적용한 해석으로 가장 적절한 것은 무엇일까요?`,
        context: `${event.cause} 그리고 ${event.result}`,
        correct,
        alternatives: pickAlternatives(historyEvents, eventIndex, (item) => item.today, correct),
        explanation: `${event.today} 과거와 현재의 제도와 규모가 다르므로 같은 결과를 단정하지는 않아야 합니다.`,
        rule: "과거 사례는 예언이 아니라 전달 경로와 취약점을 점검하는 비교 기준으로 사용합니다."
      };
    }
  },
  {
    id: "terms",
    difficulty: "기본",
    stage: 2,
    build(event, eventIndex) {
      const correct = event.terms.join(" · ");
      return {
        prompt: `${event.title}을 이해할 때 함께 봐야 할 핵심 경제용어 묶음은 무엇일까요?`,
        context: `${event.summary} 사건의 원인과 결과를 연결하는 용어를 골라보세요.`,
        correct,
        alternatives: pickAlternatives(
          historyEvents,
          eventIndex,
          (item) => item.terms.join(" · "),
          correct
        ),
        explanation: `${event.title}의 핵심 연결어는 ${correct}입니다. ${event.cause}`,
        rule: "용어 뜻만 외우지 말고 실제 사건에서 각 용어가 어떤 순서로 연결됐는지 확인합니다."
      };
    }
  },
  {
    id: "chain",
    difficulty: "심화",
    stage: 3,
    build(event, eventIndex) {
      const firstOther = historyEvents[(eventIndex + 7) % historyEvents.length];
      const secondOther = historyEvents[(eventIndex + 13) % historyEvents.length];
      const correct = `${event.cause} → ${event.result}`;
      const alternatives = [
        `${event.cause} → ${firstOther.result}`,
        `${firstOther.cause} → ${event.result}`,
        `${secondOther.cause} → ${firstOther.result}`
      ];
      return {
        prompt: `${event.title}의 원인에서 결과로 이어지는 인과관계로 가장 정확한 것은 무엇일까요?`,
        context: `${event.year} · ${event.region}. 시간 순서와 정책·금융의 전달 경로를 함께 판단해 보세요.`,
        correct,
        alternatives,
        explanation: `${event.title}에서는 ${correct}의 흐름이 핵심입니다. 현재와 비교할 때는 ${event.today}`,
        rule: "원인과 결과의 시간 순서를 확인하고, 서로 다른 사건의 원인과 결과를 억지로 이어 붙이지 않습니다."
      };
    }
  }
];

const generatedQuestions = templates.flatMap((template, templateIndex) =>
  historyEvents.map((event, eventIndex) => {
    const content = template.build(event, eventIndex);
    const arranged = arrangeChoices(
      content.correct,
      content.alternatives,
      eventIndex + templateIndex
    );
    const era = eraById.get(event.era);
    return {
      id: `history-${event.id}-${template.id}`,
      type: "history",
      category: event.category,
      era: event.era,
      eraLabel: era?.label || "경제사",
      difficulty: template.difficulty,
      stage: template.stage,
      sourceEventId: event.id,
      prompt: content.prompt,
      context: content.context,
      choices: arranged.choices,
      answerIndex: arranged.answerIndex,
      explanation: content.explanation,
      rule: content.rule
    };
  })
);

export const historyQuizQuestions = generatedQuestions.slice(0, HISTORY_QUIZ_TARGET);
