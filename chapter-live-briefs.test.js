import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFutureIndustryBrief,
  buildFutureOutlookBrief,
  buildPoliticsLiveBriefs,
  getPoliticalTransmission,
  inferPoliticalJurisdiction,
  selectPoliticalHeadlines
} from "./chapter-live-briefs.js";

const quality = {
  newsFetchedAt: "2026-07-27T10:30:00.000Z",
  newsRefreshMinutes: 30,
  newsSourceMode: "live"
};

const headlines = [
  {
    id: "law-ai",
    section: "politics",
    title: "한국 국회 AI 기본법 시행령과 고영향 AI 기준 논의",
    topic: "한국 정치·법",
    source: "정책뉴스",
    url: "https://example.com/law-ai",
    publishedAt: "2026-07-27T10:00:00.000Z"
  },
  {
    id: "law-ai-copy",
    section: "politics",
    title: "한국 국회 AI 기본법 시행령과 고영향 AI 기준 논의",
    topic: "한국 정치·법",
    source: "정책뉴스",
    url: "https://example.com/law-ai",
    publishedAt: "2026-07-27T09:00:00.000Z"
  },
  {
    id: "chips",
    section: "industry",
    title: "HBM 수요와 AI 반도체 설비투자 확대",
    topic: "첨단산업·공급망",
    source: "경제뉴스",
    url: "https://example.com/chips",
    publishedAt: "2026-07-27T08:00:00.000Z"
  },
  {
    id: "misclassified-supply-chain",
    section: "security-disasters",
    title: "배 만들 곳 없다 공급망 붕괴로 조선업 수주 확대",
    topic: "사고·재난",
    impactArea: "재난·인프라",
    source: "산업뉴스",
    url: "https://example.com/shipbuilding",
    publishedAt: "2026-07-27T07:30:00.000Z"
  },
  {
    id: "climate",
    section: "commodities-fx",
    title: "폭염으로 전력수요와 기후적응 인프라 투자 증가",
    topic: "기후·에너지",
    source: "기후뉴스",
    url: "https://example.com/climate",
    publishedAt: "2026-07-27T07:00:00.000Z"
  }
];

test("builds country and law briefs from the shared 30-minute news snapshot", () => {
  const snapshot = { dataQuality: quality, headlines };
  const briefs = buildPoliticsLiveBriefs(
    snapshot,
    [{ id: "korea", name: "한국" }, { id: "us", name: "미국" }],
    [
      { id: "kr-ai-basic", countryId: "korea", shortTitle: "AI 기본법" },
      { id: "us-genius", countryId: "us", shortTitle: "스테이블코인 법" }
    ]
  );

  assert.equal(briefs.overview.count, 1);
  assert.equal(briefs.byCountry.korea.count, 1);
  assert.equal(briefs.byCountry.us.count, 0);
  assert.equal(briefs.byLaw["kr-ai-basic"].status, "current");
  assert.equal(briefs.byLaw["us-genius"].status, "empty");
  assert.equal(briefs.byLaw["kr-ai-basic"].refreshMinutes, 30);
  assert.match(briefs.byLaw["kr-ai-basic"].summary, /공식 원문/);
});

test("connects future industries and outlook without treating news as a forecast fact", () => {
  const snapshot = { dataQuality: quality, headlines };
  const chips = buildFutureIndustryBrief(snapshot, {
    id: "ai-chips",
    label: "AI 반도체"
  });
  const outlook = buildFutureOutlookBrief(snapshot);

  assert.equal(chips.count, 1);
  assert.match(chips.summary, /확정값으로 보지 않습니다/);
  assert.equal(outlook.count, 1);
  assert.match(outlook.transmission, /적응 투자/);
});

test("marks a missing news snapshot unavailable instead of inventing a brief", () => {
  const brief = buildFutureIndustryBrief(null, {
    id: "ai-chips",
    label: "AI 반도체"
  });
  assert.equal(brief.status, "unavailable");
  assert.equal(brief.count, 0);
  assert.match(brief.summary, /임의 내용을 만들지 않습니다/);
});

test("keeps shared political selectors deterministic and deduplicated", () => {
  const selected = selectPoliticalHeadlines(headlines);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].id, "law-ai");
  assert.equal(inferPoliticalJurisdiction(selected[0]), "한국");
  assert.match(getPoliticalTransmission(selected[0]), /설비투자/);
});