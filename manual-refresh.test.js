import test from "node:test";
import assert from "node:assert/strict";
import { refreshSnapshotForUser } from "./server.mjs";

const userId = "11111111-1111-4111-8111-111111111111";
const quotaResetAt = "2026-07-29T15:00:00.000Z";

test("manual refresh validates the user, consumes one slot, and forces every live source", async () => {
  const calls = [];
  const result = await refreshSnapshotForUser("access-token", {
    validateUser: async (token) => {
      calls.push(["validate", token]);
      return { id: userId };
    },
    consumeQuota: async (targetUser) => {
      calls.push(["quota", targetUser]);
      return {
        allowed: true,
        used_count: 1,
        remaining_count: 2,
        reset_at: quotaResetAt
      };
    },
    loadSnapshot: async (options) => {
      calls.push(["snapshot", options]);
      return {
        generatedAt: "2026-07-29T03:00:00.000Z",
        markets: [{ id: "kospi" }],
        headlines: []
      };
    }
  });

  assert.deepEqual(calls, [
    ["validate", "access-token"],
    ["quota", userId],
    [
      "snapshot",
      {
        forceRefresh: true,
        forceNews: true,
        forceMacro: true,
        preferScheduledNews: false
      }
    ]
  ]);
  assert.deepEqual(result.manualRefresh, {
    allowed: true,
    dailyLimit: 3,
    used: 1,
    remaining: 2,
    resetAt: quotaResetAt,
    refreshedAt: "2026-07-29T03:00:00.000Z"
  });
});

test("manual refresh stops before network collection when the daily quota is exhausted", async () => {
  let loadCount = 0;
  await assert.rejects(
    () => refreshSnapshotForUser("access-token", {
      validateUser: async () => ({ id: userId }),
      consumeQuota: async () => ({
        allowed: false,
        used_count: 3,
        remaining_count: 0,
        reset_at: quotaResetAt
      }),
      loadSnapshot: async () => {
        loadCount += 1;
        return {};
      }
    }),
    (error) => {
      assert.equal(error.statusCode, 429);
      assert.equal(error.code, "manual-refresh-limit");
      assert.equal(error.quota.remaining, 0);
      return true;
    }
  );
  assert.equal(loadCount, 0);
});

test("manual refresh reports an unapplied database migration without collecting data", async () => {
  let loadCount = 0;
  await assert.rejects(
    () => refreshSnapshotForUser("access-token", {
      validateUser: async () => ({ id: userId }),
      consumeQuota: async () => {
        const error = new Error("RPC was not found");
        error.statusCode = 404;
        throw error;
      },
      loadSnapshot: async () => {
        loadCount += 1;
        return {};
      }
    }),
    (error) => {
      assert.equal(error.statusCode, 503);
      assert.equal(error.code, "manual-refresh-not-configured");
      return true;
    }
  );
  assert.equal(loadCount, 0);
});
