import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uiSource = await readFile(new URL("./company-ui.js", import.meta.url), "utf8");

test("company period click updates the selected button before redrawing", () => {
  assert.match(uiSource, /setCompanyPeriod\(periodButton\.dataset\.companyPeriod\)/);
  assert.match(uiSource, /querySelectorAll\("\[data-company-period\]"\)/);
  assert.match(uiSource, /button\.dataset\.companyPeriod === viewState\.period/);
  assert.match(uiSource, /button\.setAttribute\([\s\S]*?"aria-selected"/);
});

test("unknown company periods cannot change the chart state", () => {
  assert.match(
    uiSource,
    /if \(!COMPANY_PERIODS\.some\(\(period\) => period\.id === periodId\)\) return;/
  );
});
