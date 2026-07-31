import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uiSource = await readFile(new URL("./company-ui.js", import.meta.url), "utf8");
const cssSource = await readFile(new URL("./company.css", import.meta.url), "utf8");

test("company overview exposes the requested valuation ratios", () => {
  for (const label of ["시가총액", "PER", "PBR", "PSR", "ROE"]) {
    assert.match(uiSource, new RegExp(label));
  }
  assert.match(uiSource, /renderCompactValuation\(quoteState\)/);
});

test("company financials explain basis, formula, and missing data", () => {
  assert.match(uiSource, /TTM 지배주주순이익/);
  assert.match(uiSource, /제공처 미지원 또는 수집 실패/);
  assert.match(uiSource, /한 비율이 낮다는 이유만으로 저평가라고 단정하지 않습니다/);
  assert.match(uiSource, /원자료 보기/);
});

test("valuation grids remain readable on desktop and mobile", () => {
  assert.match(cssSource, /\.company-valuation-grid\s*\{/);
  assert.match(cssSource, /@media \(max-width: 700px\)[\s\S]*?\.company-valuation-grid/);
  assert.match(cssSource, /@media \(max-width: 480px\)[\s\S]*?\.company-valuation-grid/);
});
