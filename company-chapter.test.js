import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { futureCompanies } from "./future-industry-data.js";
import {
  URL_STATE_VALUES,
  buildUrlForState,
  normalizeUrlState
} from "./url-state.js";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const ui = readFileSync(new URL("./company-ui.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./company.css", import.meta.url), "utf8");
const server = readFileSync(new URL("./server.mjs", import.meta.url), "utf8");
const api = readFileSync(new URL("./api/company-market.js", import.meta.url), "utf8");

test("company chapter is a lazy-loaded top-level chapter", () => {
  assert.match(html, /data-chapter="companies"[^>]*>기업</);
  assert.match(html, /data-chapter-panel="companies"/);
  assert.match(html, /id="companyWorkspace"/);
  assert.match(app, /"companies"/);
  assert.match(app, /initCompanyChapterOnce/);
  assert.match(app, /loadStylesheetOnce\("company-styles", "\/company\.css"/);
});

test("company URL allowlist matches all companies and drops invalid IDs", () => {
  assert.deepEqual(
    [...URL_STATE_VALUES.company].sort(),
    futureCompanies.map((company) => company.id).sort()
  );
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=companies&company=nvidia&companyView=chart"),
    { chapter: "companies", company: "nvidia", companyView: "chart" }
  );
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=companies&company=made-up&companyView=bad"),
    { chapter: "companies", company: "samsung-electronics", companyView: "overview" }
  );
  assert.equal(
    buildUrlForState(
      { chapter: "companies", company: "nvidia", companyView: "financials" },
      "https://example.test/"
    ).search,
    "?chapter=companies&company=nvidia&companyView=financials"
  );
});

test("company UI separates price collection from official business analysis", () => {
  assert.match(ui, /기업을 실적·가격·사업으로 함께 보기/);
  assert.match(ui, /시세가 없을 때 실적 수치로 현재 주가를 추정하지 않습니다/);
  assert.match(ui, /개요/);
  assert.match(ui, /차트·시세/);
  assert.match(ui, /실적·체력/);
  assert.match(ui, /뉴스·위험/);
  assert.match(ui, /data-company-period/);
  assert.match(ui, /providerPlan/);
});

test("company API is available locally and on Vercel with shared caching", () => {
  assert.match(server, /url\.pathname === "\/api\/company-market"/);
  assert.match(api, /getCompanyMarket/);
  assert.match(api, /s-maxage=300/);
  assert.match(ui, /\/api\/company-market\?id=/);
});

test("company layout supports desktop and narrow mobile screens", () => {
  assert.match(css, /grid-template-columns:\s*minmax\(250px, 294px\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /company-chart-stage/);
});

