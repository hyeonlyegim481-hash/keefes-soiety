import test from "node:test";
import assert from "node:assert/strict";
import { parseExportValues } from "./macro-data.js";

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