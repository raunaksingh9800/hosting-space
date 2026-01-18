import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // IMPORTANT: do NOT read req.json() or req.text()
    const evt = await verifyWebhook(req);

    if (evt.type !== "user.created") {
      return new Response("Ignored", { status: 200 });
    }

    const data = evt.data;

    if (!("id" in data)) {
      return new Response("Invalid payload", { status: 400 });
    }

    const clerkId = data.id as string;
    const firstName = (data as any).first_name ?? "";
    const lastName = (data as any).last_name ?? "";

    const fullName = `${firstName} ${lastName}`.trim();

    await prisma.user.upsert({
      where: { authId: clerkId },
      update: {},
      create: {
        authId: clerkId,
        name: fullName,
        aiCredits: 0,
        plan: "free",
        siteCount: 0,
      },
    });

    return new Response("OK", { status: 200 });

  } catch (err: any) {
    console.error("❌ CLERK WEBHOOK FAILED:", err?.message, err);
    return new Response(err?.message ?? "Webhook error", { status: 400 });
  }
}
