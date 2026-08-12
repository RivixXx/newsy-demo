import { generateSecret as otplibGenerateSecret, verify as otplibVerify, generateURI } from 'otplib';
import { toDataURL } from 'qrcode';
import { createHash, randomBytes } from 'node:crypto';

const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_BYTES = 6; // 12 hex chars
const TOTP_ISSUER = 'ЧИ';

/**
 * TOTP period in seconds (RFC 6238 §5.2 default).
 */
export const TOTP_PERIOD = 30;

/**
 * Time tolerance in seconds for TOTP verification.
 * otplib v13 accepts this value in SECONDS, so `30` means ±1 step of 30s
 * (RFC 6238 §5.2 recommended window). Passing `1` (as before) would only
 * accept codes within 1 second — effectively no clock-drift tolerance.
 */
export const TOTP_TOKEN_TOLERANCE = TOTP_PERIOD;

/**
 * Generate a new TOTP secret for a user.
 */
export function generateSecret(): string {
  return otplibGenerateSecret();
}

export interface TOTPVerifyResult {
  valid: boolean;
  /**
   * RFC 6238 time step at which the code matched. Persist it and pass it back
   * as `afterTimeStep` in subsequent verifications to prevent replay attacks.
   */
  verifiedStep?: number;
}

/**
 * Verify a TOTP code against a secret.
 *
 * `afterTimeStep` enables replay protection: codes from time steps <= the given
 * value are rejected. Persist {@link TOTPVerifyResult.verifiedStep} after a
 * successful verification and pass it on the next attempt.
 */
export async function verifyTOTP(
  code: string,
  secret: string,
  afterTimeStep?: number
): Promise<TOTPVerifyResult> {
  try {
    const result = await otplibVerify({
      secret,
      token: code,
      epochTolerance: TOTP_TOKEN_TOLERANCE,
      ...(typeof afterTimeStep === 'number' ? { afterTimeStep } : {}),
    });
    return result.valid
      ? { valid: true, verifiedStep: (result as { timeStep?: number }).timeStep }
      : { valid: false };
  } catch {
    return { valid: false };
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
