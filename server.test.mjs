import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveMarketPoint,
  resolveMarketStatus,
  resolvePreviousClose
} from "./server.mjs";

const hour = 60 * 60 * 1000;
const now = Date.UTC(2026, 6, 13, 11, 0, 0);

test("uses Yahoo previousClose before range-level chartPreviousClose", () => {
  const baseline = resolvePreviousClose(
    { previousClose: 7475.94, chartPreviousClose: 8051.33 },
    [{ value: 7581.35 }, { value: 6806.93 }],
    6806.93
  );
  assert.equal(baseline, 7475.94);
});

test("uses the last regular chart point after the market closes", () => {
  const point = resolveMarketPoint(
    {
      regularMarketPrice: 6806.93,
      regularMarketTime: (now + hour) / 1000,
      currentTradingPeriod: {
        regular: { start: (now - 8 * hour) / 1000, end: (now - 5 * hour) / 1000 }
      }
    },
    [{ value: 6806.93, time: new Date(now - 5 * hour).toISOString() }],
    now
  );
  assert.deepEqual(point, {
    value: 6806.93,
    time: new Date(now - 5 * hour).toISOString(),
    marketOpen: false
  });
});

test("uses the latest quote and marks it live during regular trading", () => {
  const meta = {
    regularMarketPrice: 1492.73,
    regularMarketTime: (now - 2 * 60 * 1000) / 1000,
    currentTradingPeriod: {
      regular: { start: (now - hour) / 1000, end: (now + hour) / 1000 }
    }
  };
  const point = resolveMarketPoint(
    meta,
    [{ value: 1492.4, time: new Date(now - hour).toISOString() }],
    now
  );
  const status = resolveMarketStatus(meta, point.time, now);
  assert.equal(point.value, 1492.73);
  assert.deepEqual(status, { live: true, status: "live" });
});

test("distinguishes a stale open market from a closed market", () => {
  const openMeta = {
    currentTradingPeriod: {
      regular: { start: (now - hour) / 1000, end: (now + hour) / 1000 }
    }
  };
  const closedMeta = {
    currentTradingPeriod: {
      regular: { start: (now - 8 * hour) / 1000, end: (now - 5 * hour) / 1000 }
    }
  };
  assert.deepEqual(
    resolveMarketStatus(openMeta, new Date(now - 4 * hour).toISOString(), now),
    { live: false, status: "stale" }
  );
  assert.deepEqual(
    resolveMarketStatus(closedMeta, new Date(now - 5 * hour).toISOString(), now),
    { live: false, status: "closed" }
  );
});
