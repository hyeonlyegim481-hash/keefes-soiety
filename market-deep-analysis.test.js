import assert from "node:assert/strict";
import test from "node:test";

import { getMarketDeepRead } from "./economic-narrative.js";
import { buildMarketDeepModel } from "./market-deep-analysis.js";

const ids = ["kospi", "kosdaq", "usdkrw", "sp500", "nasdaq", "vix", "wti", "gold"];

function market(id, index) {
  return {
    id,
    name: id.toUpperCase(),
    value: id === "usdkrw" ? 1450 : 100 + index,
    previousClose: id === "usdkrw" ? 1440 : 99 + index,
    changePercent: index % 2 === 0 ? 1.1 : -0.8,
    changeAvailable: true,
    asOf: "2026-07-29T02:00:00Z",
    unit: id === "usdkrw" ? "KRW" : id === "wti" ? "USD/bbl" : id === "gold" ? "USD/oz" : "pt"
  };
}

function statistics(markets, oneDay = 1, fiveDay = 3) {
  return {
    currentRegime: "확정 전: 경기회복 (2/3)",
    confidence: {
      label: "보통",
      score: 66,
      components: [
        { label: "현재값 완전성", points: 25, weight: 25, detail: "8/8개 확인" }
      ]
    },
    dataQuality: {
      label: "양호",
      score: 87,
      ageMinutes: 8,
      availableRatio: 100,
      sufficientSampleRatio: 75,
      components: [
        { label: "시장값 수집", points: 40, weight: 40, detail: "100% 사용 가능" }
      ]
    },
    directionAgreement: {
      rate: 75,
      dominant: "위험 완화",
      agreeingSignals: ["kospi", "sp500", "nasdaq"],
      counterSignals: ["vix"]
    },
    drivers: {
      adverse: [
        { id: "usdkrw", label: "원/달러", change1d: 0.8, mediumChange: 2.4, mediumLabel: "20일", riskDirection: "adverse", severity: 78, aligned: true, transmission: "수입 원가와 외국인 수급" },
        { id: "vix", label: "VIX", change1d: 5.2, mediumChange: 8.1, mediumLabel: "20일", riskDirection: "adverse", severity: 72, aligned: true, transmission: "금융시장 불안" }
      ],
      favorable: [
        { id: "sp500", label: "S&P 500", change1d: 1.1, mediumChange: 3.2, mediumLabel: "20일", riskDirection: "favorable", severity: 65, aligned: true, transmission: "글로벌 위험선호" }
      ],
      counter: [
        { id: "sp500", label: "S&P 500", change1d: 1.1, mediumChange: 3.2, mediumLabel: "20일" }
      ]
    },
    markets: Object.fromEntries(markets.map((item) => [
      item.id,
      {
        sampleSize: 120,
        assessment: {
          label: fiveDay >= 0 ? "상승 우위" : "하락 우위",
          persistenceRate: 66.7,
          position: { label: "확보 구간 중간" }
        },
        analogs: {
          status: "available",
          methodology: "현재 5일·20일 가격 변화 비교",
          matches: [
            { date: "2026-03-03T00:00:00Z", similarity: 84.2, change5d: fiveDay, change20d: fiveDay * 2, subsequent20d: -1.4 }
          ]
        },
        horizons: {
          "1d": { status: "available", value: oneDay },
          "5d": { status: "available", value: fiveDay },
          "20d": { status: "available", value: fiveDay * 2 }
        }
      }
    ]))
  };
}

test("all supported markets receive distinct hypotheses, invalidation and Korea channels", () => {
  const markets = ids.map(market);
  const theses = new Set();

  for (const selected of markets) {
    const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
    const model = buildMarketDeepModel({
      selected,
      markets,
      read,
      statisticalAnalysis: statistics(markets)
    });

    assert.equal(model.available, true);
    assert.ok(model.thesis.length >= 25);
    assert.ok(model.alternative.length >= 20);
    assert.ok(model.invalidation.length >= 3);
    assert.equal(model.impactChannels.length, 3);
    assert.equal(model.scenarios.length, 3);
    assert.ok(model.pathSteps.length >= 3);
    assert.equal(model.causeCandidates.length, 3);
    assert.ok(model.crossMarketClues.length >= 2);
    theses.add(model.thesis);
  }

  assert.equal(theses.size, ids.length);
});

test("a one-day reversal against the five-day move is disclosed instead of called a confirmed trend", () => {
  const markets = ids.map(market);
  const selected = markets[0];
  const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
  const model = buildMarketDeepModel({
    selected,
    markets,
    read,
    statisticalAnalysis: statistics(markets, -1.2, 4.5)
  });

  assert.equal(model.trend.state, "reversing");
  assert.match(model.trend.label, /방향 전환/);
  assert.match(model.trend.value, /1일 -1.2%/);
  assert.match(model.trend.value, /5일 \+4.5%/);
});

test("missing previous close stays unavailable and is not converted to zero percent", () => {
  const markets = ids.map(market);
  const selected = {
    ...markets[0],
    previousClose: null,
    changePercent: null,
    changeAvailable: false
  };
  markets[0] = selected;
  const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
  const model = buildMarketDeepModel({
    selected,
    markets,
    read,
    statisticalAnalysis: statistics(markets)
  });

  assert.match(model.evidence[0].value, /등락률 계산 불가/);
  assert.doesNotMatch(model.evidence[0].value, /0%/);
  assert.match(model.invalidation.at(-1), /이전 종가/);
});

test("cause attribution is explicitly labeled as an estimate that can be wrong", () => {
  const markets = ids.map(market);
  const selected = {
    ...markets[1],
    changePercent: -2.4
  };
  markets[1] = selected;
  const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
  const model = buildMarketDeepModel({
    selected,
    markets,
    read,
    statisticalAnalysis: statistics(markets, -2.4, -3.1)
  });

  assert.match(model.causeAssessment.title, /하락/);
  assert.match(model.causeAssessment.statusLabel, /틀릴 수 있음/);
  assert.match(model.causeAssessment.warning, /실제 원인과 다를 수/);
  assert.ok(model.causeAssessment.evidence.length >= 3);
});

test("missing change data holds the cause judgment instead of inventing a reason", () => {
  const markets = ids.map(market);
  const selected = {
    ...markets[0],
    previousClose: null,
    changePercent: null,
    changeAvailable: false
  };
  markets[0] = selected;
  const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
  const model = buildMarketDeepModel({
    selected,
    markets,
    read,
    statisticalAnalysis: statistics(markets)
  });

  assert.match(model.causeAssessment.title, /판단 보류/);
  assert.match(model.causeAssessment.statusLabel, /원인 단정 안 함/);
  assert.match(model.causeAssessment.summary, /추정하지 않습니다/);
  assert.equal(model.causeCandidates.length, 3);
  assert.match(model.causeCandidates[0].title, /방향부터 확정할 수 없음/);
  assert.ok(model.causeCandidates.every((item) => !/가장 유력한 원인/.test(item.title)));
});

test("deep analysis exposes price analogs and score components without calling them forecasts", () => {
  const markets = ids.map(market);
  const selected = markets[0];
  const read = getMarketDeepRead(selected, markets, { title: "공통 국면" });
  const model = buildMarketDeepModel({
    selected,
    markets,
    read,
    statisticalAnalysis: statistics(markets)
  });

  assert.equal(model.historicalAnalogs.status, "available");
  assert.equal(model.historicalAnalogs.matches.length, 1);
  assert.match(model.historicalAnalogs.warning, /전망치로 사용하지 않습니다/);
  assert.equal(model.confidenceComponents.length, 1);
  assert.equal(model.dataQualityComponents.length, 1);
  assert.match(model.causeCandidates[1].label, /교차시장/);
});
