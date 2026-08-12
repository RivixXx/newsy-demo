import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { createStripeService } from '@/modules/payments/services/stripe-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { withErrorHandler, withValidation, successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const createPaymentSchema = z.object({
  challengeId: z.string().uuid('Неверный формат ID челленджа'),
});

async function handlePost(request: NextRequest, body: z.infer<typeof createPaymentSchema>) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const { challengeId } = body;

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

  const stripeService = createStripeService();
  const paymentService = createPaymentService(prisma, stripeService);
  const { checkoutUrl, isExisting } = await paymentService.initiatePublishPayment(challengeId, session.user.id);

  return successResponse({ checkoutUrl, isExisting });
}

export const POST = withErrorHandler(
  withValidation(createPaymentSchema, handlePost)
);