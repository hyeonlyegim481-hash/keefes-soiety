import assert from "node:assert/strict";
import test from "node:test";

import handler from "./api/blob-maintenance.js";

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

test("maintenance endpoint rejects unsupported methods", async () => {
  const response = createResponse();
  await handler({ method: "POST", headers: {} }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET");
});

test("maintenance endpoint rejects missing and incorrect cron secrets", async () => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "1234567890abcdef1234567890abcdef";
  try {
    const missing = createResponse();
    await handler({ method: "GET", headers: {} }, missing);
    assert.equal(missing.statusCode, 401);

    const incorrect = createResponse();
    await handler({
      method: "GET",
      headers: { authorization: "Bearer incorrect" }
    }, incorrect);
    assert.equal(incorrect.statusCode, 401);
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});
