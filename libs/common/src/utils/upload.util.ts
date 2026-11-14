import { randomBytes } from 'node:crypto';
import { basename, extname } from 'node:path';

export function getFileExtension(originalName: string): string {
  return extname(basename(originalName)).toLowerCase();
}

export function isAllowedFileExtension(
  originalName: string,
  allowedExtensions: string[],
): boolean {
  const extension = getFileExtension(originalName);

  return extension !== '' && allowedExtensions.includes(extension);
}

export function buildUniqueFileName(originalName: string): string {
  const unique = randomBytes(6).toString('base64url');
  const safeName = basename(originalName);
  const originalExtension = extname(safeName);
  const extension = originalExtension.toLowerCase();
  const baseName =
    basename(safeName, originalExtension)
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 80) || 'file';

  return `${unique}_${baseName}${extension}`;
}
