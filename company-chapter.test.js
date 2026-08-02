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

test("company URL state supports detailed IDs and lazy KOSPI catalog IDs", () => {
  const detailedCompanyIds = futureCompanies
    .filter((company) => !company.catalogOnly)
    .map((company) => company.id)
    .sort();
  assert.deepEqual([...URL_STATE_VALUES.company].sort(), detailedCompanyIds);
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=companies&company=nvidia&companyView=chart"),
    { chapter: "companies", company: "nvidia", companyView: "chart" }
  );
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=companies&company=kospi-000020&companyView=financials"),
    { chapter: "companies", company: "kospi-000020", companyView: "financials" }
  );
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=companies&company=made-up&companyView=bad"),
    { chapter: "companies", company: "samsung-electronics", companyView: "overview" }
  );
  assert.equal(
    buildUrlForState(
      { chapter: "companies", company: "kospi-000020", companyView: "financials" },
      "https://example.test/"
    ).search,
    "?chapter=companies&company=kospi-000020&companyView=financials"
  );
  assert.match(ui, /company-initial-canonicalize/);
  assert.match(ui, /company-canonicalize/);
});
test("company UI separates price collection from official business analysis", () => {
  assert.match(ui, /기업 한눈에 보기/);
  assert.match(ui, /시세가 없을 때 실적 수치로 현재 주가를 추정하지 않습니다/);
  assert.match(ui, /개요/);
  assert.match(ui, /차트·시세/);
  assert.match(ui, /실적·체력/);
  assert.match(ui, /뉴스·위험/);
  assert.match(ui, /data-company-period/);
  assert.match(ui, /providerPlan/);
});

test("company overview presents catalog, market, and official results in scan order", () => {
  assert.match(ui, /company-terminal-stats/);
  assert.match(ui, /companyCatalogStats\.industries/);

  assert.match(ui, /한눈에 보는 시장 지표/);
  assert.match(ui, /최근 공식 실적/);
  assert.match(ui, /현금·재무 신호/);
  assert.match(css, /Company glance layout v142[\s\S]*?\.company-valuation-strip-grid\s*\{[\s\S]*?repeat\(5,/);
  assert.match(css, /\.company-view-tabs button\[aria-selected="true"\][\s\S]*?#edf7f5/);
});

test("company discovery uses a compact industry menu and bounded progressive list", () => {
  assert.match(ui, /const COMPANY_PAGE_SIZE = 24/);
  assert.match(ui, /data-company-sector-option/);
  assert.match(ui, /companyIndustryCounts/);
  assert.match(ui, /const regionalCompanies = futureCompanies\.filter/);
  assert.match(ui, /data-company-load-more/);
  assert.match(ui, /selectedCompany && !firstCompanies\.some/);
  assert.doesNotMatch(ui, /company-browser-name[\s\S]{0,300}<em>/);
  assert.match(css, /Company discovery controls v143/);
  assert.match(css, /KOSPI official catalog v145/);
  assert.match(css, /\.company-catalog-facts[\s\S]*?repeat\(4,/);
  assert.match(css, /\.company-industry-options[\s\S]*?font-size:\s*9px/);
  assert.match(css, /\.company-browser-item[\s\S]*?min-height:\s*58px/);
});

test("company API is available locally and on Vercel with shared caching", () => {
  assert.match(server, /url\.pathname === "\/api\/company-market"/);
  assert.match(api, /getCompanyMarket/);
  assert.match(api, /s-maxage=300/);
  assert.match(ui, /\/api\/company-market\?id=/);
});

test("company layout supports desktop and narrow mobile screens", () => {
  assert.match(css, /grid-template-columns:\s*minmax\(300px, 336px\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /company-chart-stage/);
});
