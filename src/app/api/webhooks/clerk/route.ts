import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body;

  if (type !== "user.created") {
    return NextResponse.json({ message: "Unhandled event type" }, { status: 400 });
  }

  const { id, first_name, last_name } = data;

  try {
    await prisma.user.upsert({
      where: { authId: id },
      update: {},
      create: {
        authId: id,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        // You can also store email or image if needed
        // email: email_addresses?.[0]?.email_address,
        // image: image_url
      },
    });

    return NextResponse.json({ status: "User created or exists" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
