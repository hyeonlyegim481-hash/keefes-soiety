import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { futureCompanies } from "./future-industry-data.js";
import {
  buildCompanyHeadlineFeeds,
  rankAndDedupeHeadlines,
  refreshSnapshotForUser,
  sanitizeCompanyRefreshIds
} from "./server.mjs";

test("company refresh accepts only unique known company IDs and caps the request", () => {
  const knownIds = futureCompanies.slice(0, 8).map((company) => company.id);
  const sanitized = sanitizeCompanyRefreshIds([
    knownIds[0],
    "unknown-company",
    knownIds[0],
    ...knownIds.slice(1)
  ]);

  assert.deepEqual(sanitized, knownIds.slice(0, 6));
  assert.equal(sanitizeCompanyRefreshIds("not-an-array").length, 0);
});

test("company feeds use the selected company and preserve its ID through ranking", () => {
  const company = futureCompanies[0];
  const [feed] = buildCompanyHeadlineFeeds([company.id]);

  assert.equal(feed.companyId, company.id);
  assert.equal(feed.section, "industry");
  assert.match(feed.query, new RegExp(company.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(feed.query, /when:5d/);

  const ranked = rankAndDedupeHeadlines(
    [
      {
        id: "watched-company-latest",
        topic: feed.topic,
        section: feed.section,
        companyId: feed.companyId,
        title: `${company.name} 실적과 매출 전망 발표`,
        source: "Reuters",
        url: "https://example.com/company-latest",
        publishedAt: "2026-07-29T03:00:00.000Z"
      }
    ],
    Date.parse("2026-07-29T04:00:00.000Z")
  );

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].companyId, company.id);
});

test("deduplication keeps the watched company association", () => {
  const company = futureCompanies[0];
  const title = company.name + " AI 투자와 실적 전망 발표";
  const publishedAt = "2026-07-29T03:00:00.000Z";
  const ranked = rankAndDedupeHeadlines(
    [
      {
        id: "general-copy",
        topic: "글로벌 기업·기술",
        section: "industry",
        title,
        source: "Reuters",
        url: "https://example.com/general-copy",
        publishedAt
      },
      {
        id: "targeted-copy",
        topic: "관심 기업 · " + company.name,
        section: "industry",
        companyId: company.id,
        title,
        source: "Reuters",
        url: "https://example.com/targeted-copy",
        publishedAt
      }
    ],
    Date.parse("2026-07-29T04:00:00.000Z")
  );

  assert.equal(ranked.length, 1);
  assert.ok(ranked[0].companyIds.includes(company.id));
});

test("company refresh consumes one manual slot and forwards only sanitized IDs", async () => {
  const companyIds = futureCompanies.slice(0, 2).map((company) => company.id);
  const calls = [];
  const result = await refreshSnapshotForUser("access-token", {
    companyIds: [companyIds[0], "unknown-company", companyIds[1]],
    validateUser: async () => ({ id: "11111111-1111-4111-8111-111111111111" }),
    consumeQuota: async () => ({
      allowed: true,
      used_count: 1,
      remaining_count: 2,
      reset_at: "2026-07-29T15:00:00.000Z"
    }),
    loadSnapshot: async (options) => {
      calls.push(options);
      return {
        generatedAt: "2026-07-29T04:00:00.000Z",
        markets: [],
        headlines: []
      };
    }
  });

  assert.deepEqual(calls, [
    {
      forceRefresh: true,
      forceNews: true,
      forceMacro: true,
      preferScheduledNews: false,
      companyIds
    }
  ]);
  assert.deepEqual(result.manualRefresh.companyIds, companyIds);
  assert.equal(result.manualRefresh.remaining, 2);
});

test("personal dashboard sends watched companies through the existing manual refresh", async () => {
  const [dashboard, app, profileClient, server] = await Promise.all([
    readFile(new URL("./personal-dashboard.js", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./profile-client.js", import.meta.url), "utf8"),
    readFile(new URL("./server.mjs", import.meta.url), "utf8")
  ]);

  assert.match(dashboard, /data-dashboard-company-refresh/);
  assert.match(dashboard, /onRequestLatestCompanies\(companyIds\)/);
  assert.match(app, /refreshSnapshot\(\{ manual: true, companyIds \}\)/);
  assert.match(profileClient, /body: JSON\.stringify\(\{ companyIds \}\)/);
  assert.match(server, /sanitizeCompanyRefreshIds\(input\?\.companyIds\)/);
});
