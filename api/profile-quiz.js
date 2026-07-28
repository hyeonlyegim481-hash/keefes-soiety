import {
  callProfileRpc,
  extractBearerToken,
  sanitizeProgressResult,
  validateQuizSubmission,
  validateSupabaseUser
} from "../profile-server.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  response.setHeader("Cache-Control", "private, no-store");
  const submission = validateQuizSubmission(request.body || {});
  if (!submission.valid) {
    return response.status(400).json({
      error: "확인할 수 없는 퀴즈 응답입니다.",
      code: submission.reason
    });
  }
  try {
    const user = await validateSupabaseUser(extractBearerToken(request));
    const result = await callProfileRpc("record_quiz_attempt", {
      target_user: user.id,
      target_quiz_id: submission.questionId,
      target_selected_answer: submission.selectedIndex,
      target_correct: submission.correct
    });
    return response.status(200).json({
      ...sanitizeProgressResult(result),
      correct: submission.correct
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    return response.status(statusCode).json({
      error: statusCode === 401 ? "로그인이 만료되었습니다." : "퀴즈 기록을 저장하지 못했습니다.",
      code: error?.code || "profile-quiz-failed"
    });
  }
}
