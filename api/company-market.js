import { getCompanyMarket } from "../company-market-server.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const companyId = Array.isArray(request.query?.id)
      ? request.query.id[0]
      : request.query?.id;
    const result = await getCompanyMarket(companyId);
    response.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=1800"
    );
    return response.status(200).json(result);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    response.setHeader("Cache-Control", "no-store");
    return response.status(status).json({
      error: status === 404 ? "확인할 수 없는 기업입니다." : "기업 시세 수집에 실패했습니다.",
      code: error?.code || "company-market-failed"
    });
  }
}

