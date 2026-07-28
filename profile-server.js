import { scenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";
import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";
import { glossaryTerms } from "./glossary-data.js";
import { glossaryCoreExtraTerms } from "./glossary-core-extra-data.js";
import { glossaryExtraTerms } from "./glossary-extra-data.js";
import { glossaryMoreTerms } from "./glossary-more-data.js";
import { glossaryProTerms } from "./glossary-pro-data.js";
import { glossarySpecialTerms } from "./glossary-special-data.js";
import { glossaryExpandedTerms } from "./glossary-expanded-data.js";

const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;
const scenarioById = new Map(
  [
    ...scenarioQuestions,
    ...extraScenarioQuestions,
    ...moreScenarioQuestions,
    ...expandedScenarioQuestions
  ].map((question) => [question.id, question])
);
const glossaryTermSet = new Set(
  [
    ...glossaryTerms,
    ...glossaryCoreExtraTerms,
    ...glossaryExtraTerms,
    ...glossaryMoreTerms,
    ...glossaryProTerms,
    ...glossarySpecialTerms,
    ...glossaryExpandedTerms
  ].map((item) => item.term)
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

  const question = scenarioById.get(questionId);
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

export function sanitizeProgressResult(value = {}) {
  const nonNegativeNumber = (input) => {
    const numeric = Number(input);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
  };
  const xp = nonNegativeNumber(value?.xp);
  return {
    xp,
    activeDays: nonNegativeNumber(value?.active_days ?? value?.activeDays),
    quizCorrectCount: nonNegativeNumber(
      value?.quiz_correct_count ?? value?.quizCorrectCount
    ),
    lastActiveOn: value?.last_active_on ?? value?.lastActiveOn ?? null,
    xpAwarded: nonNegativeNumber(value?.xp_awarded ?? value?.xpAwarded),
    tier: String(value?.tier || "iron")
  };
}
