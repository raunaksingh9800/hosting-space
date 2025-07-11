// app/api/site/delete/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { routeName } = await req.json();
  if (!routeName) return NextResponse.json({ error: "Missing routeName" }, { status: 400 });

  const site = await prisma.site.findFirst({ where: { routeName } });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { authId: userId } });
  if (!user || site.ownerId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete site from DB
  await prisma.site.delete({ where: { id: site.id } });

  // Decrement siteCount for the user
  await prisma.user.update({
    where: { id: user.id },
    data: { siteCount: { decrement: 1 } },
  });

  // Remove from Redis (if exists)
  const redis = await getRedisClient();
  await redis.del(routeName);

  return NextResponse.json({ success: true });
}
