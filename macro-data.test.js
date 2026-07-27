import test from "node:test";
import assert from "node:assert/strict";
import {
  formatMacroSourceSummary,
  parseExportPeriod,
  parseExportValues,
  resolveMacroIndicatorResult,
  summarizeMacroStatus
} from "./macro-data.js";

test("parses the official confirmed export sentence with inserted Korean spacing", () => {
  assert.deepEqual(
    parseExportValues("전년 동월 대비 수출 은 70.7% 증가한 1,022 억 달러"),
    { exportAmount: 1022, annualChange: 70.7 }
  );
});

test("parses the official preliminary export sentence", () => {
  assert.deepEqual(
    parseExportValues("수출 은 695 억 달러로 전년동기대비 수출 3.7% 감소"),
    { exportAmount: 695, annualChange: -3.7 }
  );
});

test("rejects export text without both an amount and annual change", () => {
  assert.throws(() => parseExportValues("수출이 증가했습니다"), /not found/);
});

test("parses an official policy briefing export sentence", () => {
  assert.deepEqual(
    parseExportValues("수출은 지난해 같은 기간보다 70.9% 증가한 1022억 5000만 달러"),
    { exportAmount: 1022.5, annualChange: 70.9 }
  );
});

test("reads the export month from an official policy briefing", () => {
  assert.deepEqual(
    parseExportPeriod("6월 수출", "산업통상부가 발표한 2026년 6월 수출입 동향입니다."),
    { year: 2026, month: 6 }
  );
});

test("keeps the last successful macro timestamp when a retry fails", () => {
  const previous = {
    id: "cpi",
    status: "official",
    stale: false,
    value: 2.1,
    fetchedAt: "2026-07-28T01:00:00.000Z"
  };
  const item = resolveMacroIndicatorResult({
    definition: { id: "cpi", label: "소비자물가" },
    result: { status: "rejected", reason: new Error("network") },
    previous,
    attemptedAt: "2026-07-28T02:00:00.000Z"
  });

  assert.equal(item.fetchedAt, previous.fetchedAt);
  assert.equal(item.lastAttemptAt, "2026-07-28T02:00:00.000Z");
  assert.equal(item.retryFailedAt, "2026-07-28T02:00:00.000Z");
  assert.equal(item.stale, true);
});

test("summarizes all-current macro data", () => {
  const summary = summarizeMacroStatus([
    {
      id: "base-rate",
      status: "official",
      stale: false,
      fetchedAt: "2026-07-28T01:00:00.000Z",
      lastAttemptAt: "2026-07-28T01:00:00.000Z"
    },
    {
      id: "cpi",
      status: "official",
      stale: false,
      fetchedAt: "2026-07-28T02:00:00.000Z",
      lastAttemptAt: "2026-07-28T02:00:00.000Z"
    }
  ]);

  assert.equal(summary.state, "current");
  assert.equal(summary.currentOfficialCount, 2);
  assert.equal(summary.latestSuccessfulAt, "2026-07-28T02:00:00.000Z");
  assert.equal(formatMacroSourceSummary(summary), "공식 거시지표 2/2개 최신 확인");
});

test("separates current, stale, and unavailable macro data", () => {
  const summary = summarizeMacroStatus([
    {
      id: "base-rate",
      status: "official",
      stale: false,
      fetchedAt: "2026-07-28T01:00:00.000Z",
      lastAttemptAt: "2026-07-28T01:00:00.000Z"
    },
    {
      id: "cpi",
      status: "official",
      stale: true,
      fetchedAt: "2026-07-27T01:00:00.000Z",
      lastAttemptAt: "2026-07-28T02:00:00.000Z"
    },
    {
      id: "exports",
      status: "unavailable",
      fetchedAt: null,
      lastAttemptAt: "2026-07-28T02:00:00.000Z"
    }
  ]);

  assert.equal(summary.state, "partial");
  assert.equal(summary.currentOfficialCount, 1);
  assert.equal(summary.staleCount, 1);
  assert.deepEqual(summary.unavailableIds, ["exports"]);
  assert.equal(summary.latestSuccessfulAt, "2026-07-28T01:00:00.000Z");
  assert.equal(
    formatMacroSourceSummary(summary),
    "공식 거시지표 2/3개 확인 · 이전 정상값 1개 · 수집 실패 1개"
  );
});

test("handles all-unavailable and empty macro collections", () => {
  const unavailable = summarizeMacroStatus([
    { id: "cpi", status: "unavailable", fetchedAt: null }
  ]);
  const empty = summarizeMacroStatus([]);

  assert.equal(unavailable.state, "unavailable");
  assert.equal(unavailable.latestSuccessfulAt, null);
  assert.equal(formatMacroSourceSummary(unavailable), "공식 거시지표 수집 실패 (0/1개)");
  assert.equal(empty.state, "unavailable");
  assert.equal(formatMacroSourceSummary(empty), "공식 거시지표 수집 실패 (0/0개)");
});
