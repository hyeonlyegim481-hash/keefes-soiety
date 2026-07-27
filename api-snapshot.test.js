import assert from "node:assert/strict";
import test from "node:test";

import { createSnapshotHandler } from "./api/snapshot.js";

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

test("snapshot API preserves the normal response cache policy", async () => {
  const response = createResponse();
  const snapshot = { generatedAt: "2026-07-28T01:00:00.000Z", markets: [{}] };
  const handler = createSnapshotHandler({
    getSnapshotImpl: async () => snapshot,
    logger: { error() {} }
  });

  await handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["cache-control"], "public, s-maxage=60, stale-while-revalidate=900");
  assert.equal(response.body, snapshot);
});

test("snapshot API hides internal errors and prevents error caching", async () => {
  const response = createResponse();
  const logged = [];
  const secretMessage = "C:\\private\\snapshot.json BLOB_READ_WRITE_TOKEN=secret";
  const handler = createSnapshotHandler({
    getSnapshotImpl: async () => {
      throw new Error(secretMessage);
    },
    logger: {
      error(message, details) {
        logged.push({ message, details });
      }
    }
  });

  await handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.deepEqual(response.body, {
    error: "Snapshot generation failed",
    code: "SNAPSHOT_BUILD_FAILED"
  });
  assert.equal(JSON.stringify(response.body).includes(secretMessage), false);
  assert.equal(logged[0].details.message, secretMessage);
});

test("snapshot API rejects non-GET requests", async () => {
  const response = createResponse();
  const handler = createSnapshotHandler({
    getSnapshotImpl: async () => ({ markets: [] }),
    logger: { error() {} }
  });

  await handler({ method: "POST" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET");
});
