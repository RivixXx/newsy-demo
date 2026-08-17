import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { errorResponse, successResponse, withValidation } from '@/lib/api-response';
import { createStripeService } from '@/modules/payments/services/stripe-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';

const schema = z.object({
  challengeId: z.string().uuid(),
  checkoutSessionId: z.string().startsWith('cs_'),
});

async function handlePost(_request: NextRequest, body: z.infer<typeof schema>) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) return errorResponse('Необходима авторизация', 401);

  const challenge = await prisma.challenge.findUnique({
    where: { id: body.challengeId },
    include: { organizer: { include: { members: true } } },
  });
  const canManage = challenge?.organizer.members.some(
    (member) => member.userId === session.user.id && member.status === 'ACTIVE' && !member.deletedAt
  );
  if (!challenge || !canManage) return errorResponse('Нет доступа к этому челленджу', 403);

  const stripe = createStripeService();
  const checkout = await stripe.getPaymentIntent(body.checkoutSessionId);
  if (checkout.metadata?.challengeId !== body.challengeId || checkout.metadata?.userId !== session.user.id) {
    return errorResponse('Платёж не относится к этому челленджу', 400);
  }
  if (checkout.status !== 'complete') {
    return errorResponse('Платёж ещё не завершён', 409);
  }

  await createPaymentService(prisma, stripe).handleWebhook({
    event: 'payment.succeeded',
    type: 'notification',
    object: {
      id: body.checkoutSessionId,
      status: 'succeeded',
      amount: { value: String(challenge.publishPrice ?? 0), currency: 'RUB' },
      created_at: new Date().toISOString(),
      metadata: checkout.metadata,
    },
  });

  return successResponse({ status: 'PENDING_REVIEW' });
}

export const POST = withValidation(schema, handlePost);
