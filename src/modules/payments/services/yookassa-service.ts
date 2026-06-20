import { CreatePaymentRequest, PaymentResponse } from '../types';

export interface YooKassaService {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  getPayment(id: string): Promise<PaymentResponse>;
}

export function createYooKassaService(): YooKassaService {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  const baseUrl = 'https://api.yookassa.ru/v3/payments';

  const getHeaders = () => {
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': Math.random().toString(36).substring(7),
    };
  };

  return {
    async createPayment(request) {
      if (!shopId || !secretKey) {
        // Fallback for development/demo if keys are missing
        console.warn('YooKassa credentials missing. Returning mock payment.');
        return {
          id: `mock_pay_${Date.now()}`,
          status: 'pending',
          amount: request.amount,
          confirmation: {
            type: 'redirect',
            confirmation_url: `${request.confirmation.return_url}?status=success&mock=true`,
          },
          created_at: new Date().toISOString(),
          metadata: request.metadata,
        };
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YooKassa API Error: ${JSON.stringify(error)}`);
      }

      return response.json();
    },

    async getPayment(id) {
      if (!shopId || !secretKey || id.startsWith('mock_')) {
        return {
          id,
          status: 'succeeded', // Mock success
          amount: { value: '1000.00', currency: 'RUB' },
          created_at: new Date().toISOString(),
        };
      }

      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YooKassa API Error: ${JSON.stringify(error)}`);
      }

      return response.json();
    },
  };
}
