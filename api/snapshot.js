import { getSnapshot } from "../server.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const snapshot = await getSnapshot();
    response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=900");
    return response.status(200).json(snapshot);
  } catch (error) {
    return response.status(500).json({
      error: "Snapshot generation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
