import { getCompanyMarketBatch } from "../company-market-batch.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ids = Array.isArray(request.query?.ids)
      ? request.query.ids.join(",")
      : request.query?.ids;
    const result = await getCompanyMarketBatch(ids);
    response.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=1800"
    );
    return response.status(200).json(result);
  } catch {
    response.setHeader("Cache-Control", "no-store");
    return response.status(500).json({
      error: "관심 기업 자료 수집에 실패했습니다.",
      code: "company-market-batch-failed"
    });
  }
}

