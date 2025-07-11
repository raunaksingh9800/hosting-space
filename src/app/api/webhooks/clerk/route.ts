import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { id, first_name, last_name } = body;

  if (!id) return NextResponse.json({ error: "Missing Clerk ID" }, { status: 400 });

  try {
    // Create user in Prisma
    await prisma.user.upsert({
      where: { authId: id },
      update: {},
      create: {
        authId: id,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      },
    });

    return NextResponse.json({ status: "User created or exists" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
