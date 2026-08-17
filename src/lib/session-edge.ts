import type { AuthSession } from './auth';

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return secret;
}

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes.buffer;
}

async function verify(payload: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    return crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

/** Edge-safe session validation used exclusively by middleware. */
export async function parseEdgeSessionCookie(value: string): Promise<AuthSession | null> {
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !(await verify(payload, signature))) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as AuthSession;
    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!parsed.user?.id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
