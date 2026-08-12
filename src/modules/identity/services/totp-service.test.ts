import { describe, it, expect } from 'vitest';
import { generate } from 'otplib';
import {
  generateSecret,
  generateQRDataURL,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  verifyTOTP,
  TOTP_PERIOD,
} from '@/modules/identity/services/totp-service';

describe('TOTP service', () => {
  it('generates a Base32 secret', () => {
    const secret = generateSecret();
    expect(secret).toBeTruthy();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it('generates two distinct secrets', () => {
    expect(generateSecret()).not.toBe(generateSecret());
  });

  it('generates a QR code data URL', async () => {
    const url = await generateQRDataURL('JBSWY3DPEHPK3PXP', 'user@example.com');
    expect(url.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('verifies a correct TOTP code', async () => {
    const secret = generateSecret();
    const code = await generate({ secret });
    const result = await verifyTOTP(code, secret);
    expect(result.valid).toBe(true);
    expect(result.verifiedStep).toBe(Math.floor(Date.now() / 1000 / TOTP_PERIOD));
  });

  it('rejects an incorrect TOTP code', async () => {
    const secret = generateSecret();
    const result = await verifyTOTP('000000', secret);
    expect(result.valid).toBe(false);
    expect(result.verifiedStep).toBeUndefined();
  });

  it('accepts a code from the previous step (clock drift tolerance)', async () => {
    const secret = generateSecret();
    const epoch = Math.floor(Date.now() / 1000) - TOTP_PERIOD;
    const prevCode = await generate({ secret, epoch });
    const result = await verifyTOTP(prevCode, secret);
    expect(result.valid).toBe(true);
  });

  it('rejects replay of an already used time step via afterTimeStep', async () => {
    const secret = generateSecret();
    const code = await generate({ secret });
    const first = await verifyTOTP(code, secret);
    expect(first.valid).toBe(true);

    const replay = await verifyTOTP(code, secret, first.verifiedStep);
    expect(replay.valid).toBe(false);
  });

  it('returns valid:false instead of throwing on malformed input', async () => {
    const result = await verifyTOTP('', 'not-a-valid-secret');
    expect(result.valid).toBe(false);
  });
});

describe('Backup codes', () => {
  it('generates 8 plain and hashed codes with matching format', () => {
    const { plain, hashed } = generateBackupCodes(8);
    expect(plain).toHaveLength(8);
    expect(hashed).toHaveLength(8);
    for (const code of plain) {
      expect(code).toMatch(/^[0-9A-F]{6}-[0-9A-F]{6}$/);
    }
  });

  it('hashes every plain code to its stored hash', () => {
    const { plain, hashed } = generateBackupCodes(3);
    plain.forEach((code, i) => {
      expect(hashBackupCode(code)).toBe(hashed[i]);
    });
  });

  it('verifies a backup code and reports its index', () => {
    const { plain, hashed } = generateBackupCodes(4);
    const idx = verifyBackupCode(plain[2], hashed);
    expect(idx).toBe(2);
  });

  it('is case-insensitive when verifying', () => {
    const { plain, hashed } = generateBackupCodes(2);
    const idx = verifyBackupCode(plain[0].toLowerCase(), hashed);
    expect(idx).toBe(0);
  });

  it('returns -1 for an unknown code', () => {
    const { hashed } = generateBackupCodes(2);
    expect(verifyBackupCode('ABCDEF-123456', hashed)).toBe(-1);
  });

  it('is single-use: a used code no longer verifies after removal', () => {
    const { plain, hashed } = generateBackupCodes(3);
    const idx = verifyBackupCode(plain[0], hashed);
    hashed.splice(idx, 1);
    expect(verifyBackupCode(plain[0], hashed)).toBe(-1);
  });
});