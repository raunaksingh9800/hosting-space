import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    const data = evt.data;

    // We're only interested in user.created events
    if (eventType !== 'user.created') {
      return new Response('Event not handled', { status: 200 });
    }

    const {
      id: clerkId,
      first_name,
      last_name,
    } = data;

    const fullName = `${first_name ?? ''} ${last_name ?? ''}`.trim();

    // Upsert user in DB
    await prisma.user.upsert({
      where: { authId: clerkId },
      update: {},
      create: {
        authId: clerkId,
        name: fullName,
        aiCredits: 0,
        plan: 'free',
        siteCount: 0,

      },
    });

    console.log(`✅ Synced user ${fullName} (${clerkId})`);
    return new Response('Webhook received and user synced', { status: 200 });

  } catch (err) {
    console.error('❌ Error verifying or handling webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
