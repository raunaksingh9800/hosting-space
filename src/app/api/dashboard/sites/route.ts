// app/api/dashboard/sites/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const user = await prisma.user.findUnique({
    where: { authId: userId },
    include: {
      sites: {
        select: {
          id: true,
          routeName: true,
          buildType: true,
          createdAt: true,
          
          name: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(user?.sites || []);
}
