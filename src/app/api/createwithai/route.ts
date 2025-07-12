import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { generateHtmlWithGemini } from "@/lib/gemini"

// Import Gemini API client (assume you have a utility for this)

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, routeName, buildType, prompt } = await req.json();

    if (!name || !routeName || !buildType || !prompt) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if routeName already exists
    const exists = await prisma.site.findFirst({ where: { routeName } });
    if (exists) {
        return NextResponse.json({ error: "Route already taken" }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { authId: userId } });
    if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate HTML using Gemini
    let generatedHtml: string;
    try {
        generatedHtml = await generateHtmlWithGemini(prompt, name);
    } catch {
        return NextResponse.json({ error: "Failed to generate site" }, { status: 500 });
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