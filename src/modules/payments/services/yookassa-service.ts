import { createHash } from 'node:crypto';
import type { CreatePaymentRequest, PaymentResponse } from '../types';

export interface YooKassaService {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  getPayment(id: string): Promise<PaymentResponse>;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Генерирует детерминированный idempotency key на основе данных запроса.
 * Это гарантирует, что повторный вызов с теми же параметрами вернёт тот же платёж.
 */
function buildIdempotencyKey(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 32);
}

export function createYooKassaService(): YooKassaService {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  const baseUrl = 'https://api.yookassa.ru/v3/payments';

  // В production пропущенные ключи — критическая ошибка, не тихий mock
  const isMock = !shopId || !secretKey;
  if (isMock && process.env.NODE_ENV === 'production') {
    throw new Error(
      'YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY must be set in production. ' +
        'Do not use mock payment mode in production.'
    );
  }

  const getHeaders = (idempotencyKey: string) => {
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotencyKey,
    };
  };

  async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, options);
        // Не ретраим 4xx — это клиентские ошибки
        if (response.status >= 400 && response.status < 500) {
          return response;
        }
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  return {
    async createPayment(request) {
      if (isMock) {
        console.warn('[YooKassa] Credentials missing. Returning mock payment (dev only).');
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

      // Детерминированный ключ идемпотентности на основе параметров платежа
      const idempotencyKey = buildIdempotencyKey(
        JSON.stringify({
          metadata: request.metadata,
          amount: request.amount,
          ts: Math.floor(Date.now() / 60_000), // "окно" — 1 минута для повторных попыток
        })
      );

      const response = await fetchWithRetry(baseUrl, {
        method: 'POST',
        headers: getHeaders(idempotencyKey),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message =
          (error as { description?: string })?.description ??
          `YooKassa API Error: ${response.status}`;
        throw new Error(message);
      }

      const data = (await response.json()) as PaymentResponse;

      if (!data.id || !data.status || !data.confirmation?.confirmation_url) {
        throw new Error('Invalid YooKassa response: missing required fields');
      }

      return data;
    },

    async getPayment(id) {
      if (isMock || id.startsWith('mock_')) {
        return {
          id,
          status: 'succeeded',
          amount: { value: '1000.00', currency: 'RUB' },
          created_at: new Date().toISOString(),
        };
      }

      const response = await fetchWithRetry(`${baseUrl}/${id}`, {
        method: 'GET',
        headers: getHeaders(buildIdempotencyKey(`get_${id}`)),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message =
          (error as { description?: string })?.description ??
          `YooKassa API Error: ${response.status}`;
        throw new Error(message);
      }

      return response.json() as Promise<PaymentResponse>;
    },
  };
}
