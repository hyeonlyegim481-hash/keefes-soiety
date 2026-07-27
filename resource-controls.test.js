import assert from "node:assert/strict";
import test from "node:test";

import {
  createUnavailableMarket,
  getSnapshotCacheTtl
} from "./server.mjs";

test("market cache uses five minutes when any market is open", () => {
  assert.equal(getSnapshotCacheTtl([{ marketOpen: true }]), 5 * 60_000);
  assert.equal(getSnapshotCacheTtl([{ marketOpen: false }]), 30 * 60_000);
});

test("failed market data remains visible as missing and never becomes zero", () => {
  const market = createUnavailableMarket({
    id: "kospi",
    name: "KOSPI",
    symbol: "^KS11",
    group: "korea",
    unit: "pt",
    displayUnit: "포인트",
    instrumentType: "index",
    instrumentLabel: "한국 주가지수",
    fallbackTimezone: "Asia/Seoul"
  }, new Error("timeout"));
  assert.equal(market.status, "unavailable");
  assert.equal(market.value, null);
  assert.equal(market.changePercent, null);
  assert.equal(market.changeAvailable, false);
  assert.deepEqual(market.series, []);
});
