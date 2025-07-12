import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { editHtmlWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { existingHtml, editPrompt, name } = await req.json();

    if (!existingHtml || !editPrompt || !name) {
      return NextResponse.json(
        { error: "Missing required fields: existingHtml, editPrompt, name" },
        { status: 400 }
      );
    }

    // Fetch site from DB by name
    const site = await prisma.site.findFirst({
      where: { name },
      include: { owner: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get user from DB to compare
    const user = await prisma.user.findUnique({ where: { authId: userId } });

    if (!user || site.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedHtml = await editHtmlWithGemini(existingHtml, editPrompt, name);

    return NextResponse.json({ html: updatedHtml });
  } catch  {
    return NextResponse.json(
      { error: "Failed to edit HTML with Gemini" },
      { status: 500 }
    );
  }
}
