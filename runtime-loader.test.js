import test from "node:test";
import assert from "node:assert/strict";
import {
  APP_VERSION,
  ResourceLoadError,
  createFeatureLoader,
  importVersioned,
  versionedResource,
  withTimeout
} from "./runtime-loader.js";

test("APP_VERSION is shared through versioned resource URLs", () => {
  const url = new URL(versionedResource("./module.js", {
    attempt: 3,
    baseUrl: "https://example.test/app.js"
  }));
  assert.equal(url.searchParams.get("v"), APP_VERSION);
  assert.equal(url.searchParams.get("retry"), "3");
});

test("feature loader shares an in-flight promise", async () => {
  const logger = { error() {} };
  const { loadFeature } = createFeatureLoader({ logger });
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const first = loadFeature("future", async () => {
    calls += 1;
    await gate;
    return "loaded";
  });
  const second = loadFeature("future", async () => "duplicate");
  assert.equal(first, second);
  assert.equal(calls, 0);
  release();
  assert.equal(await first, "loaded");
  assert.equal(calls, 1);
});

test("feature loader removes a failed promise and increments retry attempt", async () => {
  const logger = { error() {} };
  const { loadFeature, getFeatureStatus } = createFeatureLoader({ logger });
  const attempts = [];
  await assert.rejects(
    loadFeature("politics", async ({ attempt }) => {
      attempts.push(attempt);
      throw new Error("failed");
    })
  );
  assert.equal(getFeatureStatus("politics"), "idle");
  const value = await loadFeature("politics", async ({ attempt }) => {
    attempts.push(attempt);
    return "recovered";
  });
  assert.equal(value, "recovered");
  assert.deepEqual(attempts, [1, 2]);
});

test("resource timeout rejects instead of remaining pending", async () => {
  await assert.rejects(
    withTimeout(new Promise(() => {}), 5, "stalled.css"),
    (error) =>
      error instanceof ResourceLoadError &&
      error.code === "timeout" &&
      error.resource === "stalled.css"
  );
});

test("module retry receives a new versioned URL", async () => {
  let requestedUrl = "";
  const result = await importVersioned("./future.js", {
    attempt: 2,
    baseUrl: "https://example.test/app.js",
    importer: async (url) => {
      requestedUrl = url;
      return { ready: true };
    }
  });
  assert.equal(result.ready, true);
  const url = new URL(requestedUrl);
  assert.equal(url.searchParams.get("v"), APP_VERSION);
  assert.equal(url.searchParams.get("retry"), "2");
});
