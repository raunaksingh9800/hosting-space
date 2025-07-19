import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { editHtmlWithGemini } from "@/lib/gemini";
import { getUserApiKey } from "@/lib/enc";

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

    // Get user from DB with AI provider and API key info
    const user = await prisma.user.findUnique({
      where: { authId: userId },
      select: {
        id: true,
        aiProvider: true,
        apiKey: true,
      },
    });

    if (!user || site.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine API key to use
    let apiKeyToUse: string | undefined = undefined;
    try {
      apiKeyToUse = getUserApiKey(user, "gemini");
    } catch (error) {
      console.error("Error decrypting user API key:", error);
      return NextResponse.json(
        {
          error: "Invalid API key configuration. Please reconfigure your API key.",
        },
        { status: 400 }
      );
    }

    // Call the updated Gemini function that returns both HTML and response
    const result = await editHtmlWithGemini(
      existingHtml,
      editPrompt,
      name,
      apiKeyToUse
    );

    // Return both the updated HTML and Gemini's response message
    return NextResponse.json({
      html: result.html,
      message: result.message,
      success: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error editing HTML:", error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: "Failed to edit HTML with Gemini",
        details: errorMessage,
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}