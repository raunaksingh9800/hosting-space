import { getRedisClient } from "@/lib/redis"

export async function GET(request, { params }) {
  const redis = await getRedisClient()
  const { site } = await params

  const html = await redis.get(site)

  return new Response(html ?? "404 Not Found", {
    status: html ? 200 : 404,
    headers: {
      "Content-Type": "text/html",
    },
  })
}
