import assert from "node:assert/strict";
import test from "node:test";

import { getMarketDeepRead } from "./economic-narrative.js";
import {
  CHAPTER_IDS,
  normalizeUrlState,
  syncUrlState
} from "./url-state.js";

const expectedFocus = {
  kospi: "한국 증시와 국내 경기 영향",
  kosdaq: "성장주·금리·수급 영향",
  usdkrw: "환율·수입물가·수출기업 영향",
  sp500: "미국 경기와 한국 시장 전달 경로",
  nasdaq: "기술주·금리·반도체 영향",
  vix: "금융시장 불안과 위험회피",
  wti: "유가·물가·운송·화학·항공 영향",
  gold: "안전자산·실질금리·달러 영향"
};

const markets = Object.keys(expectedFocus).map((id, index) => ({
  id,
  name: id.toUpperCase(),
  value: 100 + index,
  changePercent: index % 2 ? -0.5 : 0.5,
  unit: id === "usdkrw" ? "KRW" : "",
  direction: index % 2 ? "down" : "up"
}));

test("legacy analysis URL redirects to the market deep view", () => {
  assert.equal(CHAPTER_IDS.includes("analysis"), false);
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=analysis&market=nasdaq"),
    { chapter: "markets", market: "nasdaq", marketView: "deep" }
  );

  const locationRef = {
    href: "https://example.test/?chapter=brief"
  };
  const calls = [];
  const historyRef = {
    pushState(_state, _title, url) {
      locationRef.href = new URL(url, locationRef.href).href;
      calls.push(locationRef.href);
    }
  };
  const result = syncUrlState(
    { chapter: "analysis" },
    { locationRef, historyRef, emit: false }
  );
  assert.equal(result.url.search, "?chapter=markets&marketView=deep");
  assert.equal(calls.length, 1);
});

test("all eight market deep reads expose a transmission path and Korea impact", () => {
  for (const market of markets) {
    const read = getMarketDeepRead(market, markets, {
      title: "공통 시장 국면"
    });
    assert.equal(read.deepFocus, expectedFocus[market.id]);
    assert.match(read.transmission, /→/);
    assert.ok(read.koreaImpact.length >= 35);
    assert.ok(read.watch.length >= 3);
    assert.ok(read.movement.length >= 20);
  }
});
