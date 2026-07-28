import {
  callProfileRpc,
  extractBearerToken,
  sanitizeProgressResult,
  validateSupabaseUser
} from "../profile-server.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  response.setHeader("Cache-Control", "private, no-store");
  try {
    const user = await validateSupabaseUser(extractBearerToken(request));
    const result = await callProfileRpc("record_daily_activity", {
      target_user: user.id
    });
    return response.status(200).json(sanitizeProgressResult(result));
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    return response.status(statusCode).json({
      error: statusCode === 401 ? "로그인이 만료되었습니다." : "접속 기록을 저장하지 못했습니다.",
      code: error?.code || "profile-activity-failed"
    });
  }
}
