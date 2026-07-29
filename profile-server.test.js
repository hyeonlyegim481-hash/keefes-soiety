import test from "node:test";
import assert from "node:assert/strict";
import { historyQuizQuestions } from "./quiz-history-data.js";
import { scenarioValidationQuestions } from "./quiz-scenario-validation-data.js";
import {
  calculateActivityStreak,
  callProfileRpc,
  fetchProfileActivityStreak,
  getProfilePublicConfig,
  getSupabaseEnvironment,
  sanitizeManualRefreshQuota,
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

test("history and validation scenario answers use the shared server bank", () => {
  const historyQuestion = historyQuizQuestions[0];
  const validationQuestion = scenarioValidationQuestions[0];
  const historyCorrect = validateQuizSubmission({
    questionId: historyQuestion.id,
    selectedAnswer: historyQuestion.choices[historyQuestion.answerIndex]
  });
  const scenarioCorrect = validateQuizSubmission({
    questionId: validationQuestion.id,
    selectedAnswer: validationQuestion.choices[validationQuestion.answerIndex]
  });
  const scenarioWrong = validateQuizSubmission({
    questionId: validationQuestion.id,
    selectedAnswer: validationQuestion.choices.find(
      (_choice, index) => index !== validationQuestion.answerIndex
    )
  });
  assert.equal(historyCorrect.correct, true);
  assert.equal(scenarioCorrect.correct, true);
  assert.equal(scenarioWrong.correct, false);
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
  const generated = validateQuizSubmission({
    questionId: "term:보통예금 표시금리",
    selectedAnswer: "보통예금 표시금리"
  });
  const invented = validateQuizSubmission({
    questionId: "term:없는용어",
    selectedAnswer: "없는용어"
  });
  assert.equal(correct.correct, true);
  assert.equal(wrong.correct, false);
  assert.equal(generated.correct, true);
  assert.equal(invented.valid, false);
});

test("manual refresh quota responses are bounded and keep the KST reset time", () => {
  assert.deepEqual(
    sanitizeManualRefreshQuota({
      allowed: true,
      used_count: 2,
      remaining_count: 1,
      reset_at: "2026-07-29T15:00:00.000Z"
    }),
    {
      allowed: true,
      dailyLimit: 3,
      used: 2,
      remaining: 1,
      resetAt: "2026-07-29T15:00:00.000Z"
    }
  );
  assert.deepEqual(
    sanitizeManualRefreshQuota({ allowed: false, used_count: 99, remaining_count: -4 }),
    {
      allowed: false,
      dailyLimit: 3,
      used: 3,
      remaining: 0,
      resetAt: null
    }
  );
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

test("quiz progress responses preserve the signed XP delta within its allowed range", () => {
  assert.equal(sanitizeProgressResult({ xp: 20, xp_awarded: -5 }).xpAwarded, -5);
  assert.equal(sanitizeProgressResult({ xp: 20, xp_awarded: -50 }).xpAwarded, -5);
  assert.equal(sanitizeProgressResult({ xp: 20, xp_awarded: 50 }).xpAwarded, 10);
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

test("activity dates calculate the current and longest streak independently", () => {
  assert.deepEqual(
    calculateActivityStreak(
      ["2026-07-20", "2026-07-21", "2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28"],
      "2026-07-28"
    ),
    { currentStreak: 4, longestStreak: 4 }
  );
  assert.deepEqual(
    calculateActivityStreak(["2026-07-20", "2026-07-21"], "2026-07-28"),
    { currentStreak: 0, longestStreak: 2 }
  );
});

test("activity streak fallback reads the signed-in user's stored dates", async () => {
  let capturedUrl;
  let capturedHeaders;
  const result = await fetchProfileActivityStreak(
    "11111111-1111-4111-8111-111111111111",
    {
      env: completeEnv,
      now: new Date("2026-07-28T03:00:00.000Z"),
      fetchImpl: async (url, options) => {
        capturedUrl = url;
        capturedHeaders = options.headers;
        return new Response(JSON.stringify([
          { activity_date: "2026-07-26" },
          { activity_date: "2026-07-27" },
          { activity_date: "2026-07-28" }
        ]), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    }
  );
  assert.deepEqual(result, { currentStreak: 3, longestStreak: 3 });
  assert.match(capturedUrl, /daily_activity/);
  assert.match(capturedUrl, /user_id=eq\.11111111-1111-4111-8111-111111111111/);
  assert.equal(capturedHeaders.apikey, completeEnv.SUPABASE_SECRET_KEY);
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
