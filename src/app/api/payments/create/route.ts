import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { createStripeService } from '@/modules/payments/services/stripe-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { withErrorHandler, withValidation, successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';

const createPaymentSchema = z.object({
  challengeId: z.string().uuid('Неверный формат ID челленджа'),
  tariffId: z.enum(['basic', 'pro', 'premium']),
});

async function handlePost(request: NextRequest, body: z.infer<typeof createPaymentSchema>) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const { challengeId, tariffId } = body;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { organizer: { include: { members: true } } },
  });

  if (!challenge) {
    return errorResponse('Челлендж не найден', 404);
  }

  const isMember = challenge.organizer.members.some(
    (m) => m.userId === session.user.id && m.status === 'ACTIVE' && !m.deletedAt
  );
  if (!isMember) {
    return errorResponse('Нет доступа к этому челленджу', 403);
  }

  const tariff = PUBLISH_TARIFFS.find((item) => item.id === tariffId);
  if (!tariff) {
    return errorResponse('Тариф не найден', 400);
  }

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      publishPrice: tariff.price,
      // Older clients could mark a zero-price draft as published before the
      // moderation flow was introduced. Choosing a paid tariff is an explicit
      // upgrade, so restore that legacy state before initiating checkout.
      ...(challenge.status === 'PUBLISHED' && tariff.price > 0
        ? { status: 'DRAFT' as const }
        : {}),
    },
  });

  const stripeService = createStripeService();
  const paymentService = createPaymentService(prisma, stripeService);
  const { checkoutUrl, isExisting } = await paymentService.initiatePublishPayment(challengeId, session.user.id);

  return successResponse({ checkoutUrl, isExisting, isFree: tariff.price === 0 });
}

export const POST = withErrorHandler(
  withValidation(createPaymentSchema, handlePost)
);
