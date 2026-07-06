import { pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);

const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return `${ITERATIONS}:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [iterationsRaw, salt, expectedHash] = storedHash.split(':');

  if (!iterationsRaw || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const actualHash = await pbkdf2Async(password, salt, iterations, expectedHash.length / 2, DIGEST);
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (expectedBuffer.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedBuffer);
}

