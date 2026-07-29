import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const ui = readFileSync(new URL("./future-industry-ui.js", import.meta.url), "utf8");
const hubCss = readFileSync(new URL("./future-outlook.css", import.meta.url), "utf8");
const industryCss = readFileSync(new URL("./future-industry.css", import.meta.url), "utf8");

test("climate response map is a separate future subchapter", () => {
  const industriesPanel = html.indexOf('data-future-view-panel="industries"');
  const climateTab = html.indexOf('data-future-view="climate"');
  const climatePanel = html.indexOf('data-future-view-panel="climate"');
  const climateLab = html.indexOf('id="climateBusinessLab"');
  const outlookPanel = html.indexOf('data-future-view-panel="outlook"');

  assert.ok(industriesPanel >= 0);
  assert.ok(climateTab >= 0);
  assert.ok(climatePanel > industriesPanel);
  assert.ok(climateLab > climatePanel);
  assert.ok(outlookPanel > climateLab);
  assert.doesNotMatch(html.slice(industriesPanel, climatePanel), /climateBusinessLab/);
  assert.match(html, /기후 대응 사업 지도 읽는 순서/);
});

test("climate map renders only when its subchapter is selected", () => {
  const setViewStart = ui.indexOf("function setFutureView");
  const applyUrlStart = ui.indexOf("function applyFutureUrlState");
  const industryRenderStart = ui.indexOf("function renderFutureIndustryChapter");
  const summaryStart = ui.indexOf("function renderSummary");

  assert.match(ui.slice(setViewStart, applyUrlStart), /normalized === "climate"\) renderClimateBusinessLab/);
  assert.doesNotMatch(
    ui.slice(industryRenderStart, summaryStart),
    /renderClimateBusinessLab/
  );
  assert.match(ui, /new Set\(\["industries", "climate", "outlook"\]\)/);
});

test("three future tabs remain responsive without overflowing labels", () => {
  assert.match(hubCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(hubCss, /@media \(max-width: 560px\)[\s\S]+future-hub-tabs button > span/);
  assert.match(industryCss, /future-climate-reading/);
  assert.match(industryCss, /future-climate-panel \.climate-business-lab/);
});
