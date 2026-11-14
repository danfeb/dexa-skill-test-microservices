import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SignaturePayload {
  method: string;
  path: string;
  timestamp: string;
  nonce: string;
  body: string;
}

@Injectable()
export class SignatureService {
  private readonly usedNonces = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  get apiKey(): string {
    return this.configService.getOrThrow<string>('API_KEY');
  }

  get apiSecret(): string {
    return this.configService.getOrThrow<string>('API_SECRET');
  }

  get toleranceMs(): number {
    return Number(this.configService.get<string>('SIGNATURE_TOLERANCE_MS'));
  }

  createSignature(payload: SignaturePayload, secret: string): string {
    return createHmac('sha256', secret)
      .update(this.buildPayload(payload))
      .digest('hex');
  }

  isValidSignature(
    payload: SignaturePayload,
    secret: string,
    providedSignature: string,
  ): boolean {
    const expected = Buffer.from(this.createSignature(payload, secret), 'hex');
    const provided = Buffer.from(providedSignature, 'hex');

    return (
      expected.length === provided.length && timingSafeEqual(expected, provided)
    );
  }

  rememberNonce(nonce: string): boolean {
    const now = Date.now();
    this.pruneNonces(now);

    if (this.usedNonces.has(nonce)) {
      return false;
    }

    this.usedNonces.set(nonce, now + this.toleranceMs);
    return true;
  }

  private buildPayload(payload: SignaturePayload): string {
    return [
      payload.method.toUpperCase(),
      payload.path,
      payload.timestamp,
      payload.nonce,
      payload.body,
    ].join('\n');
  }

  private pruneNonces(now: number): void {
    for (const [nonce, expiresAt] of this.usedNonces) {
      if (expiresAt <= now) {
        this.usedNonces.delete(nonce);
      }
    }
  }
}
