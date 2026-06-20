import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const yookassa = createYooKassaService();
    const paymentService = createPaymentService(prisma, yookassa);

    await paymentService.handleWebhook(payload);

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
