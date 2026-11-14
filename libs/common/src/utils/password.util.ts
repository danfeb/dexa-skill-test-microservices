import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedPassword: string,
): boolean {
  const [salt, storedHash] = storedPassword.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const expectedHash = Buffer.from(storedHash, 'hex');
  const actualHash = scryptSync(password, salt, KEY_LENGTH);

  return (
    expectedHash.length === actualHash.length &&
    timingSafeEqual(expectedHash, actualHash)
  );
}

export function decodeBase64Password(encoded: string): string | null {
  const value = encoded.trim();

  if (!value || !BASE64_PATTERN.test(value) || value.length % 4 === 1) {
    return null;
  }

  const decoded = Buffer.from(value, 'base64');

  if (decoded.length === 0) {
    return null;
  }

  return decoded.toString('utf8');
}
