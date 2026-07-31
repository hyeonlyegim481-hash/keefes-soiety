import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uiSource = await readFile(new URL("./company-ui.js", import.meta.url), "utf8");
const cssSource = await readFile(new URL("./company.css", import.meta.url), "utf8");

test("company chart uses unscaled layout coordinates under reader zoom", () => {
  assert.match(uiSource, /stage\.clientWidth \|\| bounds\.width/);
  assert.match(uiSource, /width \/ canvasBounds\.width/);
  assert.doesNotMatch(uiSource, /Math\.max\(320, Math\.floor\(rect\.width\)\)/);
});

test("company tooltip is clamped inside the chart stage", () => {
  assert.match(uiSource, /x - tooltipWidth - 12/);
  assert.match(uiSource, /width - tooltipWidth - 8/);
  assert.match(uiSource, /height - tooltipHeight - 8/);
  assert.match(cssSource, /\.company-chart-stage\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(cssSource, /\.company-chart-tooltip\s*\{[^}]*max-width:\s*calc\(100% - 16px\)/s);
});

test("company canvas cannot enlarge its chart container", () => {
  assert.match(cssSource, /\.company-chart-shell\s*\{[^}]*max-width:\s*100%/s);
  assert.match(cssSource, /\.company-chart-stage canvas\s*\{[^}]*max-width:\s*100%/s);
  assert.match(uiSource, /canvas\.style\.width = "100%"/);
});
