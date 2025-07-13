import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { encryptApiKey, decryptApiKey } from "@/lib/enc";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { aiProvider, apiKey } = await req.json();
  
  if (!aiProvider || !apiKey) {
    return NextResponse.json({ error: "Missing AI provider or API key" }, { status: 400 });
  }

  // Validate provider
  const validProviders = ["gemini", "openai", "claude", "other"];
  if (!validProviders.includes(aiProvider)) {
    return NextResponse.json({ error: "Invalid AI provider" }, { status: 400 });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { authId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Encrypt API key before storing
    const encryptedApiKey = encryptApiKey(apiKey);

    // Update user with AI provider and encrypted API key
    await prisma.user.update({
      where: { authId: userId },
      data: {
        aiProvider: aiProvider,
        apiKey: encryptedApiKey,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "AI settings updated successfully" 
    });
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { authId: userId },
      select: {
        aiProvider: true,
        apiKey: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return provider and indicate if API key exists (but don't return the actual key)
    return NextResponse.json({
      aiProvider: user.aiProvider,
      hasApiKey: !!user.apiKey,
      // Only return decrypted API key if specifically requested and for internal use
      // apiKey: user.apiKey ? decryptApiKey(user.apiKey) : null,
    });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Remove AI provider and API key
    await prisma.user.update({
      where: { authId: userId },
      data: {
        aiProvider: null,
        apiKey: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "AI settings removed successfully" 
    });
  } catch (error) {
    console.error("Error removing AI settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to get user's decrypted API key (for internal use)
// Note: This function is now available in @/lib/enc as getUserApiKey
// export async function getDecryptedUserApiKey(userId: string): Promise<string | null> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { authId: userId },
//       select: { 
//         aiProvider: true,
//         apiKey: true 
//       },
//     });

//     if (!user?.apiKey) return null;
//     return decryptApiKey(user.apiKey);
//   } catch (error) {
//     console.error("Error getting user API key:", error);
//     return null;
//   }
// }