import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';

export async function POST(req: NextRequest) {
  try {
    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    const yookassa = createYooKassaService();
    const paymentService = createPaymentService(prisma, yookassa);

    const { checkoutUrl } = await paymentService.initiatePublishPayment(challengeId);

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
