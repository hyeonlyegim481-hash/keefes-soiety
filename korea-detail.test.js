import test from "node:test";
import assert from "node:assert/strict";

import { buildKoreaDetailModel } from "./korea-detail.js";

const macro = [
  { id: "base-rate", label: "한국 기준금리", value: 3.5, unit: "%", status: "official", source: "한국은행", periodLabel: "2026년 7월" },
  { id: "cpi", label: "소비자물가", value: 2.8, unit: "% YoY", status: "official", source: "통계청", periodLabel: "2026년 6월" },
  { id: "exports", label: "수출 증가율", value: 5.1, unit: "% YoY", status: "official", source: "산업통상부", periodLabel: "2026년 6월" },
  { id: "household-credit", label: "가계신용", value: 1882, unit: "조원", status: "official", source: "한국은행", periodLabel: "2026년 1분기" }
];

const markets = [
  { id: "kospi", value: 2800, unit: "pt", changePercent: 1.2, changeAvailable: true, previousClose: 2766, source: "거래소" },
  { id: "kosdaq", value: 900, unit: "pt", changePercent: -0.4, changeAvailable: true, previousClose: 904, source: "거래소" },
  { id: "usdkrw", value: 1402, unit: "KRW", changePercent: 0.8, changeAvailable: true, previousClose: 1391, source: "시장 자료" },
  { id: "vix", value: 18, unit: "pt", changePercent: 1, changeAvailable: true, previousClose: 17.8, source: "시장 자료" },
  { id: "wti", value: 82, unit: "USD/bbl", changePercent: 2.4, changeAvailable: true, previousClose: 80, source: "선물 자료" }
];

test("한국 상세 모델은 여섯 부문과 네 가지 충격 경로를 만든다", () => {
  const model = buildKoreaDetailModel({ macro, markets, analysis: { riskScore: 62 } });
  assert.equal(model.sectors.length, 6);
  assert.equal(model.impacts.length, 4);
  assert.equal(model.dataQuality.availableCount, 9);
  assert.equal(model.dataQuality.totalCount, 9);
  assert.equal(model.riskScore, 62);
});

test("엇갈린 국내 증시와 비용 압력을 구분한다", () => {
  const model = buildKoreaDetailModel({ macro, markets });
  const finance = model.sectors.find((item) => item.id === "finance");
  const external = model.sectors.find((item) => item.id === "external");
  assert.equal(finance.status, "watch");
  assert.match(finance.verdict, /엇갈림/);
  assert.equal(external.status, "negative");
  assert.match(external.evidence, /1,402원/);
});

test("없는 고용·주거 자료를 추정하지 않는다", () => {
  const model = buildKoreaDetailModel({ macro, markets });
  const jobsHousing = model.sectors.find((item) => item.id === "jobs-housing");
  assert.equal(jobsHousing.status, "unavailable");
  assert.equal(jobsHousing.verdict, "판단 자료 부족");
  assert.match(jobsHousing.explanation, /없는 값을 추정하지 않습니다/);
});

test("원자료 실패는 0이나 정상값으로 바꾸지 않는다", () => {
  const model = buildKoreaDetailModel({
    macro: [{ label: "수출 증가율", value: null, status: "unavailable" }],
    markets: [{ id: "kospi", value: null, changePercent: null }]
  });
  assert.ok(model.sectors.every((item) => !/NaN|undefined/.test(JSON.stringify(item))));
  assert.equal(model.sectors.find((item) => item.id === "exports").status, "unavailable");
  assert.equal(model.dataQuality.label, "판단 자료 부족");
});

test("한국 분석은 공통 다기간 통계와 가격 유사구간을 재사용한다", () => {
  const statistics = Object.fromEntries(markets.map((item) => [
    item.id,
    {
      horizons: {
        "1d": { label: "1일", status: "available", value: item.changePercent },
        "5d": { label: "5일", status: "available", value: item.changePercent * 2 },
        "20d": { label: "20일", status: "available", value: item.changePercent * 3 },
        "3m": { label: "3개월", status: "insufficient", value: null },
        "1y": { label: "1년", status: "insufficient", value: null }
      },
      assessment: {
        label: item.changePercent >= 0 ? "상승 우위" : "하락 우위",
        persistenceRate: 66.7,
        position: { label: "확보 구간 중간" }
      },
      analogs: ["kospi", "usdkrw"].includes(item.id)
        ? {
            status: "available",
            matches: [{ date: "2026-02-01T00:00:00Z", similarity: 81, change5d: 2, change20d: 4, subsequent20d: -1 }]
          }
        : { status: "insufficient", matches: [] }
    }
  ]));
  const model = buildKoreaDetailModel({
    macro,
    markets,
    analysis: {
      riskScore: 62,
      statisticalAnalysis: {
        methodologyVersion: "2.0",
        currentRegime: "확정 전: 물가압력 (2/3)",
        confidence: { label: "보통", score: 68 },
        dataQuality: { label: "양호", score: 82 },
        directionAgreement: { dominant: "위험 확대", rate: 71.4 },
        drivers: {
          adverse: [
            { id: "usdkrw", label: "원/달러", change1d: 0.8, mediumChange: 2.4, mediumLabel: "20일", riskDirection: "adverse", severity: 78, transmission: "수입 원가·외국인 수급·물가" }
          ],
          favorable: [
            { id: "kospi", label: "KOSPI", change1d: 1.2, mediumChange: 3.6, mediumLabel: "20일", riskDirection: "favorable", severity: 65, transmission: "국내 대형주 수급과 기업 이익 기대" }
          ]
        },
        markets: statistics
      }
    }
  });

  const finance = model.sectors.find((item) => item.id === "finance");
  const external = model.sectors.find((item) => item.id === "external");
  assert.equal(model.statisticalSummary.available, true);
  assert.equal(model.statisticalSummary.currentRegime, "확정 전: 물가압력 (2/3)");
  assert.match(finance.periodEvidence, /20일/);
  assert.match(external.periodEvidence, /원\/달러/);
  assert.equal(model.statisticalSummary.adverseDrivers.length, 1);
  assert.equal(model.statisticalSummary.favorableDrivers.length, 1);
  assert.equal(model.statisticalSummary.analogCases.length, 2);
  assert.match(model.statisticalSummary.analogWarning, /전망치로 사용하지 않습니다/);
});

test("작고 지속성 없는 환율 움직임은 비용 압력으로 과장하지 않는다", () => {
  const calmMarkets = markets.map((item) =>
    item.id === "usdkrw"
      ? { ...item, value: 1350, previousClose: 1349, changePercent: 0.07 }
      : item.id === "wti"
        ? { ...item, changePercent: 0.1 }
        : item
  );
  const model = buildKoreaDetailModel({
    macro,
    markets: calmMarkets,
    analysis: {
      statisticalAnalysis: {
        methodologyVersion: "2.0",
        markets: {},
        drivers: {
          adverse: [
            { id: "usdkrw", label: "원/달러", change1d: 0.07, severity: 8, riskDirection: "adverse" },
            { id: "wti", label: "WTI", change1d: 0.1, severity: 4, riskDirection: "adverse" }
          ]
        }
      }
    }
  });
  assert.equal(model.sectors.find((item) => item.id === "external").status, "neutral");
});
