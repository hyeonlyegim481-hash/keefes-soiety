import assert from "node:assert/strict";
import test from "node:test";

import {
  MARKET_KNOWLEDGE,
  REGIME_CATALOG,
  buildSharedDataGraph,
  countryEntityId,
  createEntityId,
  getGraphEntity,
  getMarketIdsForHistoryEvent,
  getMarketIdsForIndicator,
  matchHeadlineMarketIds,
  newsEventEntityId,
  termEntityId
} from "./economic-graph.js";
import { futureCompanies, futureIndustries } from "./future-industry-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryTerms } from "./glossary-data.js";
import { buildOfficialGlossary } from "./glossary-official-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { historyEvents } from "./history-data.js";
import {
  indicatorCountries,
  indicatorDefinitions
} from "./indicator-data.js";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js";
import { broadIndicatorDefinitions } from "./indicator-broad-data.js";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js";
import { countrySnapshots, lawChanges } from "./politics-data.js";

const markets = Object.entries(MARKET_KNOWLEDGE).map(([id, knowledge], index) => ({
  id,
  name: knowledge.label,
  value: 100 + index,
  changePercent: index % 2 ? -(index + 1) / 10 : (index + 1) / 10
}));
const allIndicators = [
  ...indicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions,
  ...broadIndicatorDefinitions
];
const glossarySeed = [
  ...glossaryTerms,
  ...glossaryCoreExtraTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms,
  ...glossaryExpandedTerms
];
const allGlossaryTerms = buildOfficialGlossary(glossarySeed);
const headlines = [
  {
    id: "same-event",
    eventKey: "same-event",
    title: "연준 금리와 나스닥 기술주 변동",
    source: "Test",
    section: "us",
    publishedAt: "2026-07-27T01:00:00Z"
  },
  {
    id: "same-event-copy",
    eventKey: "same-event",
    title: "같은 사건의 중복 기사",
    source: "Test 2",
    section: "us",
    publishedAt: "2026-07-27T01:01:00Z"
  },
  {
    id: "oil-event",
    eventKey: "oil-event",
    title: "OPEC 공급 변화로 국제유가 움직임 확대",
    source: "Test",
    section: "commodities-fx",
    publishedAt: "2026-07-27T02:00:00Z"
  }
];

function buildCompleteGraph() {
  return buildSharedDataGraph({
    generatedAt: "2026-07-27T03:00:00Z",
    markets,
    headlines,
    analysis: { riskScore: 58, pulse: "이 문장은 그래프에 복사되면 안 됩니다." },
    indicatorDefinitions: allIndicators,
    countries: indicatorCountries,
    countrySnapshots,
    industries: futureIndustries,
    companies: futureCompanies,
    glossaryTerms: allGlossaryTerms,
    historyEvents,
    lawChanges
  });
}

test("entity IDs are stable across chapters and entity types", () => {
  assert.equal(countryEntityId("korea"), "country:kor");
  assert.equal(countryEntityId("KR"), "country:kor");
  assert.equal(countryEntityId("KOR"), "country:kor");
  assert.equal(countryEntityId("한국"), "country:kor");
  assert.equal(createEntityId("market", "KOR"), "market:kor");
  assert.equal(termEntityId("실질금리"), "term:실질금리");
});

test("all sourced glossary terms receive collision-free IDs", () => {
  assert.equal(allGlossaryTerms.length, 1_298);
  const ids = allGlossaryTerms.map((item) => termEntityId(item.term));
  assert.equal(new Set(ids).size, ids.length);
});

test("all market relationship targets exist in the source datasets", () => {
  const indicatorIds = new Set(allIndicators.map((item) => item.id));
  const termIds = new Set(allGlossaryTerms.map((item) => termEntityId(item.term)));
  const historyIds = new Set(historyEvents.map((item) => item.id));
  const industryIds = new Set(futureIndustries.map((item) => item.id));
  const companyIds = new Set(futureCompanies.map((item) => item.id));
  const countryIds = new Set([
    ...indicatorCountries.map((item) => countryEntityId(item.id)),
    ...countrySnapshots.map((item) => countryEntityId(item.id))
  ]);

  assert.equal(Object.keys(MARKET_KNOWLEDGE).length, 8);
  Object.values(MARKET_KNOWLEDGE).forEach((knowledge) => {
    knowledge.indicators.forEach((item) => assert.ok(indicatorIds.has(item.id), item.id));
    knowledge.terms.forEach((item) => assert.ok(termIds.has(termEntityId(item.id)), item.id));
    knowledge.history.forEach((item) => assert.ok(historyIds.has(item.id), item.id));
    knowledge.industries.forEach((item) => assert.ok(industryIds.has(item.id), item.id));
    knowledge.companies.forEach((item) => assert.ok(companyIds.has(item.id), item.id));
    knowledge.countries.forEach((item) => assert.ok(countryIds.has(countryEntityId(item.id)), item.id));
  });
});

test("graph references shared analysis instead of copying analysis text", () => {
  const graph = buildCompleteGraph();
  assert.equal(graph.integrity.valid, true);
  assert.equal(graph.integrity.unresolvedRefs.length, 0);
  assert.equal(graph.integrity.marketRelationCount, 8);
  Object.values(graph.relations.markets).forEach((relation) => {
    assert.equal(relation.analysisRef, "analysis:market-common");
  });
  assert.equal(JSON.stringify(graph).includes("이 문장은 그래프에 복사되면 안 됩니다."), false);
  assert.equal(getGraphEntity(graph, "analysis:market-common").label, "공통 시장 분석");
});

test("news events are deduplicated and linked by market relevance", () => {
  const graph = buildCompleteGraph();
  assert.equal(Object.keys(graph.entities.newsEvents).length, 2);
  assert.equal(newsEventEntityId(headlines[0]), newsEventEntityId(headlines[1]));
  assert.deepEqual(matchHeadlineMarketIds(headlines[2]), ["wti"]);
  assert.ok(graph.relations.markets.nasdaq.newsRefs.length >= 1);
  assert.ok(graph.relations.markets.wti.newsRefs.length >= 1);
  assert.equal(
    new Set(graph.relations.markets.nasdaq.newsRefs).size,
    graph.relations.markets.nasdaq.newsRefs.length
  );
});

test("indicator and history reverse relationships resolve to markets", () => {
  const graph = buildCompleteGraph();
  assert.ok(getMarketIdsForIndicator("consumer-inflation").includes("wti"));
  assert.ok(getMarketIdsForHistoryEvent("global-financial-crisis").includes("kospi"));
  assert.deepEqual(
    graph.relations.indicators["consumer-inflation"].marketRefs.sort(),
    ["market:gold", "market:sp500", "market:usdkrw", "market:wti"]
  );
  assert.ok(
    graph.relations.history["global-financial-crisis"].marketRefs.includes("market:vix")
  );
});

test("regime catalog and current study market references are explicit", () => {
  const graph = buildCompleteGraph();
  assert.equal(REGIME_CATALOG.length, 12);
  assert.deepEqual(
    Object.values(graph.entities.regimes).map((item) => item.id).sort(),
    REGIME_CATALOG.map((item) => item.id).sort()
  );
  assert.equal(graph.relations.study.currentMarketRefs.length, 3);
  assert.ok(
    graph.relations.markets.kospi.regimeRefs.includes("regime:slowdown")
  );
});
