import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUrlForState,
  canonicalizeCurrentUrl,
  normalizeUrlState,
  syncUrlState
} from "./url-state.js";

test("invalid chapters and child values normalize to safe defaults", () => {
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=unknown&indicator=made-up"),
    { chapter: "brief" }
  );
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=indicators&indicator=made-up&indicatorView=bad"),
    {
      chapter: "indicators",
      indicator: "fertility",
      indicatorView: "explorer"
    }
  );
});

test("legacy history chapter restores the study history view", () => {
  assert.deepEqual(
    normalizeUrlState("https://example.test/?chapter=history"),
    { chapter: "study", study: "history" }
  );
  assert.equal(
    buildUrlForState(
      normalizeUrlState("https://example.test/?chapter=history"),
      "https://example.test/?chapter=history"
    ).search,
    "?chapter=study&study=history"
  );
});

test("chapter allowlists remove stale and unknown parameters", () => {
  const url = buildUrlForState(
    {
      chapter: "future",
      future: "outlook",
      industry: "bio-health",
      indicator: "fertility",
      country: "china",
      unexpected: "value"
    },
    "https://example.test/?chapter=indicators&indicator=fertility&indicatorView=compare"
  );
  assert.equal(url.search, "?chapter=future&future=outlook");
});

test("future climate subchapter keeps a canonical URL without an industry parameter", () => {
  const state = normalizeUrlState(
    "https://example.test/?chapter=future&future=climate&industry=bio-health"
  );
  assert.deepEqual(state, {
    chapter: "future",
    future: "climate",
    industry: "bio-health"
  });
  assert.equal(
    buildUrlForState(state, "https://example.test/").search,
    "?chapter=future&future=climate"
  );
});

test("country and industry parameters are kept only in matching subviews", () => {
  assert.equal(
    buildUrlForState(
      { chapter: "politics", politics: "countries", country: "china" },
      "https://example.test/"
    ).search,
    "?chapter=politics&politics=countries&country=china"
  );
  assert.equal(
    buildUrlForState(
      { chapter: "politics", politics: "laws", country: "china" },
      "https://example.test/"
    ).search,
    "?chapter=politics&politics=laws"
  );
  assert.equal(
    buildUrlForState(
      { chapter: "future", future: "industries", industry: "bio-health" },
      "https://example.test/"
    ).search,
    "?chapter=future&industry=bio-health"
  );
});

function createNavigation(initialHref) {
  const locationRef = { href: initialHref };
  const calls = [];
  const update = (method, state, url) => {
    locationRef.href = new URL(url, locationRef.href).href;
    calls.push({ method, state, href: locationRef.href });
  };
  const historyRef = {
    pushState: (state, _title, url) => update("push", state, url),
    replaceState: (state, _title, url) => update("replace", state, url)
  };
  return { locationRef, historyRef, calls };
}

test("switching chapters drops the previous chapter state", () => {
  const navigation = createNavigation(
    "https://example.test/?chapter=indicators&indicator=fertility&indicatorView=compare"
  );
  const result = syncUrlState(
    { chapter: "future" },
    { ...navigation, emit: false }
  );
  assert.equal(result.url.search, "?chapter=future");
  assert.equal(navigation.calls.length, 1);
  assert.equal(navigation.calls[0].method, "push");
});

test("same chapter state is not repeatedly added to history", () => {
  const navigation = createNavigation(
    "https://example.test/?chapter=markets&market=nasdaq"
  );
  const first = syncUrlState(
    { chapter: "markets", market: "nasdaq" },
    { ...navigation, emit: false }
  );
  const second = syncUrlState(
    { chapter: "markets", market: "gold" },
    { ...navigation, emit: false }
  );
  assert.equal(first.changed, false);
  assert.equal(second.changed, true);
  assert.equal(navigation.calls.length, 1);
  assert.equal(navigation.calls[0].method, "push");
});

test("canonicalization replaces invalid URL without adding history", () => {
  const navigation = createNavigation(
    "https://example.test/?chapter=politics&politics=bad&country=unknown&old=1"
  );
  const result = canonicalizeCurrentUrl({ ...navigation, emit: false });
  assert.equal(result.state.chapter, "politics");
  assert.equal(result.state.politics, "overview");
  assert.equal(result.url.search, "?chapter=politics");
  assert.equal(navigation.calls.length, 1);
  assert.equal(navigation.calls[0].method, "replace");
});
