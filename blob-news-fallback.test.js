import assert from "node:assert/strict";
import test from "node:test";

import { createVerifiedNewsFallback } from "./blob-maintenance.js";
import { getNewsBundle } from "./server.mjs";

const headline = {
  id: "news-1",
  eventKey: "event-1",
  title: "검증된 마지막 정상 뉴스",
  source: "테스트 언론사",
  publishedAt: "2026-07-26T03:00:00.000Z",
  url: "https://example.com/news-1",
  topic: "market",
  section: "markets"
};

test("maintenance reuses only news from a valid latest Blob version", async () => {
  const latest = {
    status: "valid",
    manifest: { generatedAt: "2026-07-26T04:00:00.000Z" },
    files: {
      "news-index.json": {
        generatedAt: "2026-07-26T04:00:00.000Z",
        data: { events: [headline] }
      },
      "data-status.json": {
        data: {
          dataQuality: { availableNewsFeedCount: 12 },
          sourceDetails: {
            news: { basisAt: "2026-07-26T03:30:00.000Z" }
          }
        }
      }
    }
  };

  const fallback = createVerifiedNewsFallback(latest);
  assert.equal(fallback.headlines.length, 1);
  assert.equal(fallback.fetchedAt, "2026-07-26T03:30:00.000Z");
  assert.equal(fallback.availableNewsFeedCount, 12);

  const bundle = await getNewsBundle({
    now: Date.parse("2026-07-27T12:00:00.000Z"),
    preferScheduled: true,
    verifiedFallback: fallback,
    allowLive: false
  });
  assert.equal(bundle.sourceMode, "blob-last-known");
  assert.equal(bundle.headlines[0].eventKey, "event-1");
  assert.equal(bundle.fetchedAt, "2026-07-26T03:30:00.000Z");
});

test("maintenance reports unavailable news instead of fetching or inventing it", async () => {
  assert.equal(createVerifiedNewsFallback({ status: "invalid" }), null);

  const bundle = await getNewsBundle({
    now: Date.parse("2026-07-27T12:00:00.000Z"),
    preferScheduled: true,
    verifiedFallback: null,
    allowLive: false
  });
  assert.equal(bundle.sourceMode, "unavailable");
  assert.deepEqual(bundle.headlines, []);
  assert.equal(bundle.fetchedAt, null);
});
