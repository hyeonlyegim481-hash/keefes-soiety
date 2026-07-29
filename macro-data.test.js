import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseExportPeriod, parseExportValues } from "./macro-data.js";

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

test("tries the official policy briefing before the frequently blocked Customs page", () => {
  const source = readFileSync(new URL("./macro-data.js", import.meta.url), "utf8");
  const start = source.indexOf("async function fetchExports() {");
  const end = source.indexOf("async function fetchExportsFromCustoms()", start);
  const body = source.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.ok(body.indexOf("fetchExportsFromPolicyBriefing") >= 0);
  assert.ok(
    body.indexOf("fetchExportsFromPolicyBriefing") < body.indexOf("fetchExportsFromCustoms")
  );
  assert.match(source, /source: "산업통상부",\s+sourceUrl: POLICY_BRIEFING_RELEASES_URL/);
  assert.match(source, /source = "관세청"/);
});
