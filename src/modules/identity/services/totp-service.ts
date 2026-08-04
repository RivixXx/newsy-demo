import { generateSecret as otplibGenerateSecret, verify as otplibVerify, generateURI } from 'otplib';
import { toDataURL } from 'qrcode';
import { createHash, randomBytes } from 'node:crypto';

const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_BYTES = 6; // 12 hex chars
const TOTP_ISSUER = 'ЧИ';

/**
 * Generate a new TOTP secret for a user.
 */
export function generateSecret(): string {
  return otplibGenerateSecret();
}

/**
 * Verify a TOTP code against a secret.
 * epochTolerance of 90 means ±1 step (30s each), accepting codes from 30s before and after.
 */
export async function verifyTOTP(code: string, secret: string): Promise<boolean> {
  try {
    const result = await otplibVerify({
      secret,
      token: code,
      epochTolerance: 1, // ±1 step of 30s — standard TOTP window
    });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Generate a QR code data URL for scanning with an authenticator app.
 */
export async function generateQRDataURL(secret: string, email: string): Promise<string> {
  const otpauth = generateURI({
    issuer: TOTP_ISSUER,
    label: email,
    secret,
  });
  return toDataURL(otpauth, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000',
      light: '#fff',
    },
  });
}

/**
 * Generate backup codes as plain-text strings.
 * Returns an object with the plain codes (to show the user once)
 * and their hashed versions (to store).
 */
export function generateBackupCodes(count = BACKUP_CODE_COUNT): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = randomBytes(BACKUP_CODE_BYTES).toString('hex').toUpperCase();
    // Format as XXXXXX-XXXXXX
    const formatted = `${code.slice(0, 6)}-${code.slice(6, 12)}`;
    plain.push(formatted);
    hashed.push(hashBackupCode(formatted));
  }

  return { plain, hashed };
}

/**
 * Hash a backup code with SHA-256.
 */
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

/**
 * Verify a backup code against a list of hashed codes.
 * If matched, returns the index of the matched code (so it can be removed).
 * Returns -1 if no match.
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const inputHash = hashBackupCode(code.toUpperCase());
  return hashedCodes.indexOf(inputHash);
}
