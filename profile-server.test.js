import test from "node:test";
import assert from "node:assert/strict";
import {
  callProfileRpc,
  getProfilePublicConfig,
  getSupabaseEnvironment,
  sanitizeProgressResult,
  validateQuizSubmission
} from "./profile-server.js";

const completeEnv = {
  SUPABASE_URL: "https://project-ref.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public-value",
  SUPABASE_SECRET_KEY: "sb_secret_never-return-this"
};

test("public profile config exposes only browser-safe Supabase values", () => {
  const status = getSupabaseEnvironment(completeEnv);
  const config = getProfilePublicConfig(completeEnv);
  assert.equal(status.serverConfigured, true);
  assert.equal(config.configured, true);
  assert.equal(config.rewardsEnabled, true);
  assert.equal(config.publishableKey, completeEnv.SUPABASE_PUBLISHABLE_KEY);
  assert.equal(JSON.stringify(config).includes(completeEnv.SUPABASE_SECRET_KEY), false);
});

test("invalid Supabase URLs keep the profile feature disabled", () => {
  const config = getProfilePublicConfig({
    ...completeEnv,
    SUPABASE_URL: "https://example.com"
  });
  assert.equal(config.configured, false);
  assert.equal(config.supabaseUrl, "");
  assert.equal(config.publishableKey, "");
});

test("scenario quiz answers are checked against the shared source data", () => {
  const correct = validateQuizSubmission({
    questionId: "rate-hike",
    selectedAnswer: "시장금리와 대출이자 부담이 커진다"
  });
  const wrong = validateQuizSubmission({
    questionId: "rate-hike",
    selectedAnswer: "모든 주식이 반드시 오른다"
  });
  assert.equal(correct.valid, true);
  assert.equal(correct.correct, true);
  assert.equal(wrong.valid, true);
  assert.equal(wrong.correct, false);
});

test("term quiz IDs are stable and invented questions cannot earn XP", () => {
  const correct = validateQuizSubmission({
    questionId: "term:국내총생산",
    selectedAnswer: "국내총생산"
  });
  const wrong = validateQuizSubmission({
    questionId: "term:국내총생산",
    selectedAnswer: "국민총소득"
  });
  const invented = validateQuizSubmission({
    questionId: "term:없는용어",
    selectedAnswer: "없는용어"
  });
  assert.equal(correct.correct, true);
  assert.equal(wrong.correct, false);
  assert.equal(invented.valid, false);
});

test("progress responses discard invalid and non-finite values", () => {
  assert.deepEqual(
    sanitizeProgressResult({
      xp: Number.NaN,
      active_days: -10,
      quiz_correct_count: "12",
      xp_awarded: Infinity,
      tier: "silver"
    }),
    {
      xp: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakAvailable: false,
      quizCorrectCount: 12,
      lastActiveOn: null,
      xpAwarded: 0,
      tier: "silver"
    }
  );
});

test("progress responses normalize streak values from database fields", () => {
  const progress = sanitizeProgressResult({
    xp: 25,
    active_days: 8,
    current_streak: "5",
    longest_streak: 12
  });
  assert.equal(progress.currentStreak, 5);
  assert.equal(progress.longestStreak, 12);
  assert.equal(progress.streakAvailable, true);
});

test("secret-key RPC uses apikey and never sends the opaque key as a JWT", async () => {
  let capturedHeaders;
  const result = await callProfileRpc("record_daily_activity", { target_user: "user-id" }, {
    env: completeEnv,
    fetchImpl: async (_url, options) => {
      capturedHeaders = options.headers;
      return new Response(JSON.stringify({ xp: 5 }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
  });
  assert.equal(result.xp, 5);
  assert.equal(capturedHeaders.apikey, completeEnv.SUPABASE_SECRET_KEY);
  assert.equal("authorization" in capturedHeaders, false);
});