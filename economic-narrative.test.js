import test from "node:test";
import assert from "node:assert/strict";
import { buildEconomicNarrative, getMarketDeepRead } from "./economic-narrative.js";

function market(id, value, changePercent, unit = "") {
  return {
    id,
    name: id.toUpperCase(),
    value,
    changePercent,
    unit,
    direction: changePercent >= 0 ? "up" : "down"
  };
}

function macro(label, value, unit, periodLabel) {
  return {
    label,
    value,
    unit,
    periodLabel,
    status: "official"
  };
}

const snapshot = {
  markets: [
    market("kospi", 2800, 1),
    market("kosdaq", 850, -3),
    market("usdkrw", 1495, -0.2, "KRW"),
    market("sp500", 5900, -0.8),
    market("nasdaq", 19000, -1.5),
    market("vix", 17, 2),
    market("wti", 81, 3),
    market("gold", 2400, 0.5)
  ],
  macro: [
    macro("한국 기준금리", 2.5, "%", "2025.05.29"),
    macro("소비자물가", 3.2, "% YoY", "2026년 6월"),
    macro("수출 증가율", 70.9, "% YoY", "2026년 6월 잠정"),
    macro("가계신용", 1993.1, "조원", "2026년 1분기")
  ],
  analysis: {}
};

test("explains a KOSPI and KOSDAQ split as concentration, not broad recovery", () => {
  const narrative = buildEconomicNarrative(snapshot);

  assert.match(narrative.heroTitle, /대형주는 버티고/);
  assert.match(narrative.title, /대형주 쏠림/);
  assert.equal(narrative.metrics.koreaGap, 4);
  assert.match(narrative.coreReasons[0].meaning, /시장 전체 회복이 아닙니다/);
});

test("rebuilds the disclosed risk score from the same components", () => {
  const narrative = buildEconomicNarrative(snapshot);

  assert.equal(narrative.rebuiltRisk, 64);
  assert.deepEqual(
    narrative.riskComponents.map((item) => item.points),
    [42, 3, 14, 0, 0, 5]
  );
});

test("separates the USDKRW daily direction from its absolute level", () => {
  const narrative = buildEconomicNarrative(snapshot);
  const usdkrw = snapshot.markets.find((item) => item.id === "usdkrw");
  const read = getMarketDeepRead(usdkrw, snapshot.markets, narrative);

  assert.match(read.definition, /숫자가 오르면 원화 약세/);
  assert.match(read.interpretation, /당일 방향과 별개로/);
  assert.match(read.interpretation, /1,495원/);
  assert.equal(read.tone, "positive");
  assert.equal(read.checks.length, 3);
});