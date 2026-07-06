import { randomBytes } from 'node:crypto';

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

/**
 * Заглушка email-сервиса.
 * Заменить на реальную интеграцию с Resend / Brevo / SendGrid
 * после настройки SMTP-сервиса.
 *
 * В development логирует письмо в консоль.
 */
export function createEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY || process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@chillenge-russia.ru';

  async function send(to: string, subject: string, html: string) {
    if (!apiKey) {
      console.log(`[email-service] No API key configured. Would send to ${to}:`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Body preview: ${html.replace(/<[^>]+>/g, '').slice(0, 200)}...`);
      return;
    }

    // TODO: Replace with actual Resend / Brevo SDK call
    // Example for Resend:
    // import { Resend } from 'resend';
    // const resend = new Resend(apiKey);
    // await resend.emails.send({ from, to, subject, html });

    console.log(`[email-service] Email sent to ${to}: ${subject}`);
  }

  return {
    async sendVerificationEmail(to, token, baseUrl) {
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
      await send(to, 'Подтвердите email — NEWSY', `
        <h2>Добро пожаловать в NEWSY!</h2>
        <p>Для завершения регистрации подтвердите ваш email:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#FF385C;color:white;text-decoration:none;border-radius:8px;font-weight:700;">Подтвердить email</a>
        <p style="margin-top:16px;color:#666;">Если вы не регистрировались на NEWSY, просто проигнорируйте это письмо.</p>
        <p style="color:#999;font-size:12px;">Ссылка действительна 24 часа.</p>
      `);
    },

    async sendPasswordResetEmail(to, token, baseUrl) {
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      await send(to, 'Сброс пароля — NEWSY', `
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Перейдите по ссылке:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#FF385C;color:white;text-decoration:none;border-radius:8px;font-weight:700;">Сбросить пароль</a>
        <p style="margin-top:16px;color:#666;">Если вы не запрашивали сброс, проигнорируйте это письмо.</p>
        <p style="color:#999;font-size:12px;">Ссылка действительна 1 час.</p>
      `);
    },
  };
}
