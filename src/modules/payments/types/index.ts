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
  event: 'payment.succeeded' | 'payment.canceled' | 'payment_intent.payment_failed' | 'charge.refunded' | 'payment_intent.requires_payment_method';
  type: 'notification';
  object: PaymentResponse;
}
