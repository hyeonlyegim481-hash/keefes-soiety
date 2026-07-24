const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const economicLabControls = [
  {
    id: "rate",
    label: "정책금리 변화",
    unit: "%p",
    min: -2,
    max: 2,
    step: 0.25,
    scale: 1,
    lowerLabel: "인하",
    upperLabel: "인상",
    description: "현재 수준에서 기준금리가 얼마나 움직였다고 가정할지 정합니다."
  },
  {
    id: "fx",
    label: "원/달러 환율 변화",
    unit: "%",
    min: -15,
    max: 20,
    step: 1,
    scale: 5,
    lowerLabel: "원화 강세",
    upperLabel: "원화 약세",
    description: "플러스는 달러가 비싸지고 원화 가치가 낮아지는 상황입니다."
  },
  {
    id: "oil",
    label: "국제유가 변화",
    unit: "%",
    min: -40,
    max: 60,
    step: 5,
    scale: 10,
    lowerLabel: "유가 하락",
    upperLabel: "유가 상승",
    description: "수입 원가와 물가에 전달될 원유 가격 충격을 가정합니다."
  },
  {
    id: "exports",
    label: "수출 수요 변화",
    unit: "%",
    min: -15,
    max: 20,
    step: 1,
    scale: 5,
    lowerLabel: "수요 감소",
    upperLabel: "수요 증가",
    description: "가격 효과를 제외한 해외 주문과 수출 물량의 방향을 가정합니다."
  },
  {
    id: "fiscal",
    label: "재정 기조",
    unit: "단계",
    min: -2,
    max: 2,
    step: 0.5,
    scale: 1,
    lowerLabel: "긴축",
    upperLabel: "확장",
    description: "세금과 정부 지출을 합친 재정정책의 수요 자극 정도입니다."
  },
  {
    id: "productivity",
    label: "생산성 변화",
    unit: "%",
    min: -2,
    max: 4,
    step: 0.5,
    scale: 1.5,
    lowerLabel: "생산성 하락",
    upperLabel: "생산성 향상",
    description: "같은 노동과 자본으로 더 많이 생산할 수 있는 정도를 가정합니다."
  }
];

export const economicLabPresets = [
  {
    id: "inflation-return",
    label: "물가 재상승 압력",
    description: "원화 약세와 에너지 비용이 겹치고 정책은 쉽게 완화되지 않는 경우",
    values: { rate: 0.5, fx: 8, oil: 25, exports: 2, fiscal: 0.5, productivity: 0 }
  },
  {
    id: "export-productivity",
    label: "수출·생산성 회복",
    description: "해외 주문과 생산성 개선이 비용 부담을 일부 흡수하는 경우",
    values: { rate: 0, fx: 2, oil: -5, exports: 12, fiscal: 0, productivity: 2.5 }
  },
  {
    id: "domestic-slowdown",
    label: "내수 둔화",
    description: "높은 금리와 약한 수출, 재정 긴축이 수요를 함께 누르는 경우",
    values: { rate: 1.25, fx: 4, oil: 5, exports: -5, fiscal: -1, productivity: 0 }
  },
  {
    id: "policy-buffer",
    label: "정책 완충",
    description: "대외 수요는 약하지만 금리 인하와 재정 지원이 충격을 줄이는 경우",
    values: { rate: -0.75, fx: 3, oil: 10, exports: -4, fiscal: 1.5, productivity: 0.5 }
  }
];

const impactDefinitions = [
  {
    id: "growth",
    label: "실질경기",
    positiveLabel: "확대 압력",
    negativeLabel: "둔화 압력",
    neutralLabel: "뚜렷한 방향 없음",
    positiveIsFavorable: true,
    timing: "대체로 2~8분기",
    indicators: ["실질 GDP", "소매판매", "설비투자", "PMI"],
    explanation: "금리와 비용은 수요를 누르고, 수출·재정·생산성은 생산과 소득을 지지하는 기본 경로를 비교합니다.",
    coefficients: { rate: -0.7, fx: -0.08, oil: -0.45, exports: 0.8, fiscal: 0.65, productivity: 0.8 }
  },
  {
    id: "inflation",
    label: "물가 압력",
    positiveLabel: "상승 압력",
    negativeLabel: "하락 압력",
    neutralLabel: "추가 압력 제한",
    positiveIsFavorable: false,
    timing: "대체로 1~6분기",
    indicators: ["수입물가", "생산자물가", "근원물가", "기대인플레이션"],
    explanation: "환율과 유가는 비용을, 재정은 수요를, 금리와 생산성은 각각 수요 억제와 공급 확대 경로를 반영합니다.",
    coefficients: { rate: -0.45, fx: 0.55, oil: 0.8, exports: 0.1, fiscal: 0.35, productivity: -0.45 }
  },
  {
    id: "household",
    label: "가계 구매력",
    positiveLabel: "개선 압력",
    negativeLabel: "부담 확대",
    neutralLabel: "변화 제한",
    positiveIsFavorable: true,
    timing: "즉시에서 4분기",
    indicators: ["대출금리", "실질임금", "가처분소득", "소비자심리"],
    explanation: "대출 이자와 수입물가가 지출 여력을 줄이고, 재정 지원과 생산성·수출 소득은 이를 보완하는 경로입니다.",
    coefficients: { rate: -0.65, fx: -0.25, oil: -0.55, exports: 0.2, fiscal: 0.4, productivity: 0.45 }
  },
  {
    id: "exports",
    label: "수출 산업",
    positiveLabel: "실적 지지",
    negativeLabel: "실적 부담",
    neutralLabel: "영향 혼재",
    positiveIsFavorable: true,
    timing: "대체로 1~4분기",
    indicators: ["수출 물량", "신규 수출주문", "가동률", "영업이익률"],
    explanation: "해외 주문과 생산성이 핵심이며 원화 약세는 환산 매출을 돕지만 수입 중간재 비용이 효과를 줄일 수 있습니다.",
    coefficients: { rate: -0.2, fx: 0.45, oil: -0.2, exports: 0.9, fiscal: 0.05, productivity: 0.7 }
  },
  {
    id: "importers",
    label: "수입 의존 기업",
    positiveLabel: "마진 개선",
    negativeLabel: "원가 부담",
    neutralLabel: "영향 혼재",
    positiveIsFavorable: true,
    timing: "즉시에서 3분기",
    indicators: ["수입단가", "매출총이익률", "재고일수", "가격 전가율"],
    explanation: "원화 약세와 유가 상승은 원재료 비용을 높이고, 생산성 향상과 최종 수요는 마진을 완충합니다.",
    coefficients: { rate: -0.35, fx: -0.7, oil: -0.8, exports: 0.15, fiscal: 0.15, productivity: 0.6 }
  },
  {
    id: "stocks",
    label: "주식 평가 환경",
    positiveLabel: "평가 지지",
    negativeLabel: "평가 부담",
    neutralLabel: "영향 혼재",
    positiveIsFavorable: true,
    timing: "즉시에서 4분기",
    indicators: ["장기금리", "12개월 이익전망", "위험프리미엄", "외국인 수급"],
    explanation: "금리는 할인율을, 수출과 생산성은 이익 전망을 움직입니다. 환율과 유가는 업종마다 반대 효과가 날 수 있습니다.",
    coefficients: { rate: -0.7, fx: -0.12, oil: -0.35, exports: 0.6, fiscal: 0.25, productivity: 0.65 }
  },
  {
    id: "bonds",
    label: "기존 채권 가격",
    positiveLabel: "상승 압력",
    negativeLabel: "하락 압력",
    neutralLabel: "변화 제한",
    positiveIsFavorable: null,
    timing: "시장 기대에 즉시 반응",
    indicators: ["국채 수익률곡선", "기대물가", "기간 프리미엄", "신용스프레드"],
    explanation: "금리와 물가 기대가 오르면 기존 채권 가격은 낮아지는 기본 관계를 사용하되 경기 둔화의 안전자산 수요도 고려합니다.",
    coefficients: { rate: -0.9, fx: -0.18, oil: -0.35, exports: -0.08, fiscal: -0.25, productivity: 0.15 }
  },
  {
    id: "housing",
    label: "주택 수요",
    positiveLabel: "수요 지지",
    negativeLabel: "수요 위축",
    neutralLabel: "변화 제한",
    positiveIsFavorable: null,
    timing: "대체로 2~8분기",
    indicators: ["주택담보대출금리", "거래량", "DSR", "미분양"],
    explanation: "대출금리의 영향이 가장 크고, 소득·고용을 움직이는 수출과 재정·생산성이 보조 경로로 작용합니다.",
    coefficients: { rate: -1, fx: -0.08, oil: -0.12, exports: 0.22, fiscal: 0.2, productivity: 0.3 }
  },
  {
    id: "employment",
    label: "고용 여건",
    positiveLabel: "개선 압력",
    negativeLabel: "악화 압력",
    neutralLabel: "변화 제한",
    positiveIsFavorable: true,
    timing: "대체로 2~8분기",
    indicators: ["취업자", "구인율", "근로시간", "실업률"],
    explanation: "기업의 주문과 내수가 고용 수요를 만들며, 통화정책은 투자와 소비를 거쳐 비교적 늦게 전달됩니다.",
    coefficients: { rate: -0.45, fx: -0.05, oil: -0.3, exports: 0.65, fiscal: 0.55, productivity: 0.15 }
  }
];

const controlById = Object.fromEntries(economicLabControls.map((control) => [control.id, control]));

function intensityLabel(score, definition) {
  const magnitude = Math.abs(score);
  if (magnitude < 12) return definition.neutralLabel;
  const prefix = magnitude >= 65 ? "강한 " : magnitude >= 35 ? "" : "약한 ";
  return `${prefix}${score > 0 ? definition.positiveLabel : definition.negativeLabel}`;
}

function resultTone(score, definition) {
  if (Math.abs(score) < 12 || definition.positiveIsFavorable === null) return "neutral";
  const favorable = score > 0 ? definition.positiveIsFavorable : !definition.positiveIsFavorable;
  return favorable ? "positive" : "negative";
}

export function evaluateEconomicScenario(input = {}) {
  const values = Object.fromEntries(
    economicLabControls.map((control) => {
      const supplied = Number(input[control.id]);
      const value = Number.isFinite(supplied) ? supplied : 0;
      return [control.id, clamp(value, control.min, control.max)];
    })
  );

  const activeDrivers = economicLabControls
    .map((control) => ({
      id: control.id,
      label: control.label,
      value: values[control.id],
      strength: Math.abs(values[control.id] / control.scale)
    }))
    .filter((driver) => driver.strength > 0.05)
    .sort((a, b) => b.strength - a.strength);

  const results = impactDefinitions.map((definition) => {
    const contributions = Object.entries(definition.coefficients)
      .map(([controlId, coefficient]) => {
        const control = controlById[controlId];
        const contribution = (values[controlId] / control.scale) * coefficient * 18;
        return {
          id: controlId,
          label: control.label,
          contribution: Math.round(contribution)
        };
      })
      .filter((item) => Math.abs(item.contribution) >= 2)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    const score = clamp(
      Math.round(contributions.reduce((total, item) => total + item.contribution, 0)),
      -100,
      100
    );

    return {
      ...definition,
      score,
      labelText: intensityLabel(score, definition),
      tone: resultTone(score, definition),
      contributions
    };
  });

  const strongestResults = [...results]
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);

  return {
    values,
    activeDrivers,
    results,
    strongestResults,
    isNeutral: activeDrivers.length === 0
  };
}
