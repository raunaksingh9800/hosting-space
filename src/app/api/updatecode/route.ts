import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { routeName, code } = await req.json();
  if (!routeName || typeof code !== "string") {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { authId: userId },
    include: { sites: true },
  });

  const site = user?.sites.find((s) => s.routeName === routeName);
  if (!site) {
    return NextResponse.json({ error: "Not authorized for this site" }, { status: 403 });
  }

  // Update Redis
  const redis = await getRedisClient();
  await redis.set(routeName, code);

  // Update timestamp in DB
  await prisma.site.update({
    where: { id: site.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
