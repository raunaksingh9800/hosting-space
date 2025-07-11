import { getRedisClient } from "@/lib/redis"

export async function GET(request, context) {
  const redis = await getRedisClient()
  const { site } = context.params

  const html = await redis.get(site)

  return new Response(html || "404 Not Found", {
    headers: { "Content-Type": "text/html" },
    status: html ? 200 : 404
  })
}
