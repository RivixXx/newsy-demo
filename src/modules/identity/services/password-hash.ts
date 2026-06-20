import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [iterationsRaw, salt, expectedHash] = storedHash.split(':');

  if (!iterationsRaw || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, iterations, expectedHash.length / 2, DIGEST);
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (expectedBuffer.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedBuffer);
}

