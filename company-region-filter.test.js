import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const uiSource = await readFile(new URL("./company-ui.js", import.meta.url), "utf8");
const cssSource = await readFile(new URL("./company.css", import.meta.url), "utf8");

test("company region filter keeps the selected button in sync with the filtered list", () => {
  assert.match(uiSource, /setCompanyRegion\(regionButton\.dataset\.companyRegion\)/);
  assert.match(uiSource, /function syncCompanyRegionControls\(\)/);
  assert.match(uiSource, /button\.dataset\.companyRegion === viewState\.region/);
  assert.match(uiSource, /syncCompanyRegionControls\(\);\s*syncCompanySectorControls\(\);\s*const companies = getFilteredCompanies\(\)/);
  assert.match(cssSource, /\.company-region-switch button\[aria-pressed="true"\]/);
});
