import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { generateHtmlWithGemini } from "@/lib/gemini";
import { getUserApiKey } from "@/lib/enc";

// Route validation function
const validateRoute = (routeName: string): boolean => {
  if (!routeName) return false;
  
  // Only allow letters, numbers, and hyphens
  const validRouteRegex = /^[a-zA-Z0-9-]+$/;
  return validRouteRegex.test(routeName);
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, routeName, buildType, prompt } = await req.json();

  if (!name || !routeName || !buildType || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate route name format
  if (!validateRoute(routeName)) {
    return NextResponse.json(
      { error: "Route name can only contain letters, numbers, and hyphens (-)" },
      { status: 400 }
    );
  }

  // Check if routeName already exists
  const exists = await prisma.site.findFirst({ where: { routeName } });
  if (exists) {
    return NextResponse.json({ error: "Route already taken" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({
    where: { authId: userId },
    select: {
      id: true,
      aiProvider: true,
      apiKey: true,
      siteCount: true,
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Determine API key to use
  let apiKeyToUse: string | undefined = undefined;
  try {
    apiKeyToUse = getUserApiKey(user, "gemini");
  } catch (error) {
    console.error("Error decrypting user API key:", error);
    return NextResponse.json(
      {
        error:
          "Invalid API key configuration. Please reconfigure your API key.",
      },
      { status: 400 }
    );
  }

  // If no AI provider or not Gemini, apiKeyToUse stays undefined
  // This will make the generateHtmlWithGemini function use your stored API key

  // Generate HTML using Gemini (with user's API key if available, otherwise your stored key)
  let generatedHtml: string;
  try {
    generatedHtml = await generateHtmlWithGemini(prompt, name, apiKeyToUse);
  } catch (error) {
    console.error("Error generating HTML:", error);
    return NextResponse.json(
      {
        error: "Failed to generate site. Please try again.",
      },
      { status: 500 }
    );
  }

  // Create the site
  const site = await prisma.site.create({
    data: {
      name,
      routeName,
      buildType,
      ownerId: user.id,
    },
  });

  // Increment the user's site count
  await prisma.user.update({
    where: { id: user.id },
    data: { siteCount: { increment: 1 } },
  });

  const redis = await getRedisClient();
  await redis.set(routeName, generatedHtml);

  return NextResponse.json({ site }, { status: 201 });
}