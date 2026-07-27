import assert from "node:assert/strict";
import test from "node:test";

import handler from "./api/data-status.js";

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

test("data status reports an unconfigured Blob store without exposing secrets", async () => {
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN;
  const previousOidc = process.env.VERCEL_OIDC_TOKEN;
  const previousStore = process.env.BLOB_STORE_ID;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.BLOB_STORE_ID;
  try {
    const response = createResponse();
    await handler({ method: "GET" }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.blob.configured, false);
    assert.equal(response.body.latest.status, "not-configured");
    assert.equal(JSON.stringify(response.body).includes("TOKEN"), false);
  } finally {
    if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
    if (previousOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN;
    else process.env.VERCEL_OIDC_TOKEN = previousOidc;
    if (previousStore === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = previousStore;
  }
});

test("data status rejects non-GET requests", async () => {
  const response = createResponse();
  await handler({ method: "POST" }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET");
});
