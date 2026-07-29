import { refreshSnapshotForUser } from "../server.mjs";
import { extractBearerToken } from "../profile-server.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  response.setHeader("Cache-Control", "private, no-store");
  try {
    const snapshot = await refreshSnapshotForUser(extractBearerToken(request));
    return response.status(200).json(snapshot);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    const quota = error?.quota || null;
    if (statusCode === 429 && quota?.resetAt) {
      const retryAfter = Math.max(
        1,
        Math.ceil((Date.parse(quota.resetAt) - Date.now()) / 1000)
      );
      response.setHeader("Retry-After", String(retryAfter));
    }
    return response.status(statusCode).json({
      error: statusCode === 429
        ? "오늘 즉시 갱신 3회를 모두 사용했습니다."
        : error instanceof Error
          ? error.message
          : "즉시 갱신에 실패했습니다.",
      code: error?.code || "manual-refresh-failed",
      manualRefresh: quota
    });
  }
}
