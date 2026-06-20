export interface CreatePaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  capture: boolean;
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: 'redirect';
    confirmation_url: string;
  };
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhookPayload {
  event: 'payment.succeeded' | 'payment.waiting_for_capture' | 'payment.canceled' | 'refund.succeeded';
  type: 'notification';
  object: PaymentResponse;
}
