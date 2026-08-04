import { randomBytes } from 'node:crypto';
import { Resend } from 'resend';

export interface EmailService {
  sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<void>;
}

/**
 * Генерирует криптографически стойкий токен верификации.
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Срок жизни токена — 24 часа.
 */
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function createEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const resend = apiKey ? new Resend(apiKey) : null;

  async function send(to: string, subject: string, html: string) {
    if (!resend) {
      return;
    }

    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  return {
    async sendVerificationEmail(to, token, baseUrl) {
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
      await send(to, 'Подтвердите email — ЧИ', `
        <h2>Добро пожаловать в ЧИ!</h2>
        <p>Для завершения регистрации подтвердите ваш email:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#FF385C;color:white;text-decoration:none;border-radius:8px;font-weight:700;">Подтвердить email</a>
        <p style="margin-top:16px;color:#666;">Если вы не регистрировались на ЧИ, просто проигнорируйте это письмо.</p>
        <p style="color:#999;font-size:12px;">Ссылка действительна 24 часа.</p>
      `);
    },

    async sendPasswordResetEmail(to, token, baseUrl) {
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      await send(to, 'Сброс пароля — ЧИ', `
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Перейдите по ссылке:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#FF385C;color:white;text-decoration:none;border-radius:8px;font-weight:700;">Сбросить пароль</a>
        <p style="margin-top:16px;color:#666;">Если вы не запрашивали сброс, проигнорируйте это письмо.</p>
        <p style="color:#999;font-size:12px;">Ссылка действительна 1 час.</p>
      `);
    },
  };
}
