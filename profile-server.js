import { scenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";
import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";
import { scenarioValidationQuestions } from "./quiz-scenario-validation-data.js";
import { historyQuizQuestions } from "./quiz-history-data.js";
import { glossaryTerms } from "./glossary-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js";
import { buildOfficialGlossary } from "./glossary-official-data.js";

const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;
const scenarioById = new Map(
  [
    ...scenarioQuestions,
    ...extraScenarioQuestions,
    ...moreScenarioQuestions,
    ...expandedScenarioQuestions,
    ...scenarioValidationQuestions
  ].map((question) => [question.id, question])
);
const historyQuizById = new Map(
  historyQuizQuestions.map((question) => [question.id, question])
);
const choiceQuestionById = new Map([...scenarioById, ...historyQuizById]);
const glossarySeedTerms = [
  ...glossaryTerms,
  ...glossaryCoreExtraTerms,
  ...glossaryExtraTerms,
  ...glossaryMoreTerms,
  ...glossaryProTerms,
  ...glossarySpecialTerms,
  ...glossaryExpandedTerms
];
const officialGlossaryTerms = buildOfficialGlossary(glossarySeedTerms);
const glossaryTermSet = new Set(
  officialGlossaryTerms
    .filter((item) => item.quizEligible !== false)
    .map((item) => item.term)
);

export function getSupabaseEnvironment(env = process.env) {
  const url = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const publishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || "").trim();
  const secretKey = String(env.SUPABASE_SECRET_KEY || "").trim();
  const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url);
  return {
    url: validUrl ? url : "",
    publishableKey,
    secretKey,
    publicConfigured: Boolean(validUrl && publishableKey),
    serverConfigured: Boolean(validUrl && publishableKey && secretKey)
  };
}

export function getProfilePublicConfig(env = process.env) {
  const config = getSupabaseEnvironment(env);
  return {
    configured: config.publicConfigured,
    rewardsEnabled: config.serverConfigured,
    supabaseUrl: config.publicConfigured ? config.url : "",
    publishableKey: config.publicConfigured ? config.publishableKey : ""
  };
}

export function extractBearerToken(request) {
  const header = String(request?.headers?.authorization || "");
  const match = header.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] || "";
}

export async function validateSupabaseUser(accessToken, {
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const config = getSupabaseEnvironment(env);
  if (!config.serverConfigured) {
    const error = new Error("Supabase server environment is not configured");
    error.statusCode = 503;
    throw error;
  }
  if (!accessToken) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }
  const response = await fetchImpl(`${config.url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: config.publishableKey,
      authorization: `Bearer ${accessToken}`
    },
    signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) {
    const error = new Error("Supabase session is invalid or expired");
    error.statusCode = response.status === 401 ? 401 : 502;
    throw error;
  }
  const user = await response.json();
  if (!/^[0-9a-f-]{36}$/i.test(String(user?.id || ""))) {
    const error = new Error("Supabase returned an invalid user");
    error.statusCode = 502;
    throw error;
  }
  return user;
}

export async function callProfileRpc(functionName, payload, {
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const config = getSupabaseEnvironment(env);
  if (!config.serverConfigured) {
    const error = new Error("Supabase server environment is not configured");
    error.statusCode = 503;
    throw error;
  }
  const response = await fetchImpl(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: config.secretKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(result?.message || "Supabase profile update failed");
    error.statusCode = response.status >= 500 ? 502 : response.status;
    error.code = result?.code || "profile-rpc-failed";
    throw error;
  }
  return Array.isArray(result) ? result[0] : result;
}

function toUtcDayNumber(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const day = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(day) ? Math.floor(day / 86_400_000) : null;
}

export function getKstDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

export function calculateActivityStreak(activityDates = [], today = getKstDateString()) {
  const days = [...new Set(activityDates.map(toUtcDayNumber).filter(Number.isInteger))]
    .sort((left, right) => left - right);
  if (!days.length) return { currentStreak: 0, longestStreak: 0 };

  let run = 1;
  let longestStreak = 1;
  for (let index = 1; index < days.length; index += 1) {
    run = days[index] === days[index - 1] + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  const todayDay = toUtcDayNumber(today);
  let currentStreak = 0;
  if (days.at(-1) === todayDay) {
    currentStreak = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (days[index - 1] !== days[index] - 1) break;
      currentStreak += 1;
    }
  }
  return { currentStreak, longestStreak };
}

export async function fetchProfileActivityStreak(userId, {
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = new Date()
} = {}) {
  const config = getSupabaseEnvironment(env);
  if (!config.serverConfigured) {
    const error = new Error("Supabase server environment is not configured");
    error.statusCode = 503;
    throw error;
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(userId || ""))) {
    const error = new Error("A valid profile user is required");
    error.statusCode = 400;
    throw error;
  }

  const rows = [];
  const pageSize = 1_000;
  const maxPages = 5;
  for (let page = 0; page < maxPages; page += 1) {
    const query = new URLSearchParams({
      select: "activity_date",
      user_id: `eq.${userId}`,
      order: "activity_date.asc",
      limit: String(pageSize),
      offset: String(page * pageSize)
    });
    const response = await fetchImpl(`${config.url}/rest/v1/daily_activity?${query}`, {
      method: "GET",
      headers: { apikey: config.secretKey },
      signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(result)) {
      const error = new Error(result?.message || "Supabase activity lookup failed");
      error.statusCode = response.status >= 500 ? 502 : response.status;
      error.code = result?.code || "profile-activity-lookup-failed";
      throw error;
    }
    rows.push(...result);
    if (result.length < pageSize) break;
  }

  return calculateActivityStreak(
    rows.map((row) => row?.activity_date),
    getKstDateString(now)
  );
}

export function validateQuizSubmission(input = {}) {
  const questionId = String(input.questionId || "").trim();
  const selectedAnswer = String(input.selectedAnswer || "").trim();
  if (!questionId || questionId.length > 100 || !selectedAnswer || selectedAnswer.length > 240) {
    return { valid: false, reason: "invalid-input" };
  }

  if (questionId.startsWith("term:")) {
    const term = questionId.slice(5);
    if (!glossaryTermSet.has(term)) return { valid: false, reason: "unknown-question" };
    return {
      valid: true,
      questionId,
      selectedIndex: selectedAnswer === term ? 0 : 1,
      correct: selectedAnswer === term
    };
  }

  const question = choiceQuestionById.get(questionId);
  if (!question) return { valid: false, reason: "unknown-question" };
  const selectedIndex = question.choices.indexOf(selectedAnswer);
  if (selectedIndex < 0) return { valid: false, reason: "unknown-answer" };
  return {
    valid: true,
    questionId,
    selectedIndex,
    correct: selectedIndex === question.answerIndex
  };
}

export function sanitizeManualRefreshQuota(value = {}, dailyLimit = 3) {
  const limitValue = Number(dailyLimit);
  const limit = Number.isInteger(limitValue)
    ? Math.min(10, Math.max(1, limitValue))
    : 3;
  const usedValue = Number(value?.used_count ?? value?.usedCount);
  const used = Number.isFinite(usedValue)
    ? Math.min(limit, Math.max(0, Math.trunc(usedValue)))
    : 0;
  const remainingValue = Number(value?.remaining_count ?? value?.remainingCount);
  const remaining = Number.isFinite(remainingValue)
    ? Math.min(limit, Math.max(0, Math.trunc(remainingValue)))
    : Math.max(0, limit - used);
  const resetTimestamp = Date.parse(value?.reset_at ?? value?.resetAt);
  return {
    allowed: value?.allowed === true,
    dailyLimit: limit,
    used,
    remaining,
    resetAt: Number.isFinite(resetTimestamp)
      ? new Date(resetTimestamp).toISOString()
      : null
  };
}
export function sanitizeProgressResult(value = {}) {
  const nonNegativeNumber = (input) => {
    const numeric = Number(input);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
  };
  const xp = nonNegativeNumber(value?.xp);
  const streakAvailable = value?.current_streak !== undefined
    || value?.currentStreak !== undefined;
  return {
    xp,
    activeDays: nonNegativeNumber(value?.active_days ?? value?.activeDays),
    currentStreak: nonNegativeNumber(
      value?.current_streak ?? value?.currentStreak
    ),
    longestStreak: nonNegativeNumber(
      value?.longest_streak ?? value?.longestStreak
    ),
    streakAvailable,
    quizCorrectCount: nonNegativeNumber(
      value?.quiz_correct_count ?? value?.quizCorrectCount
    ),
    lastActiveOn: value?.last_active_on ?? value?.lastActiveOn ?? null,
    xpAwarded: (() => {
      const awarded = Number(value?.xp_awarded ?? value?.xpAwarded);
      return Number.isFinite(awarded) ? Math.min(10, Math.max(-5, awarded)) : 0;
    })(),
    tier: String(value?.tier || "iron")
  };
}
