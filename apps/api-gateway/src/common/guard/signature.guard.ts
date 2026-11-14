import {
  CanActivate,
  ExecutionContext,
  Injectable,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { INVALID_FILE_HASH } from '@app/common';
import { SignatureService } from '../signature/signature.service.js';

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private readonly signatureService: SignatureService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();

    const apiKey = request.header('x-api-key');
    const timestamp = request.header('x-timestamp');
    const nonce = request.header('x-nonce');
    const signature = request.header('x-signature');

    if (!apiKey || !timestamp || !nonce || !signature) {
      throw new UnauthorizedException('Missing API signature headers');
    }

    if (apiKey !== this.signatureService.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const requestTime = Number(timestamp);

    if (
      !Number.isFinite(requestTime) ||
      Math.abs(Date.now() - requestTime) > this.signatureService.toleranceMs
    ) {
      throw new UnauthorizedException('Expired request signature');
    }

    const isMultipart = Boolean(request.is('multipart/form-data'));
    const fileSha256 = request.header('x-file-sha256');

    if (isMultipart && (!fileSha256 || !/^[a-f0-9]{64}$/i.test(fileSha256))) {
      throw new UnauthorizedException(INVALID_FILE_HASH);
    }

    const isValid = this.signatureService.isValidSignature(
      {
        method: request.method,
        path: request.originalUrl,
        timestamp,
        nonce,
        body: isMultipart
          ? fileSha256!
          : (request.rawBody?.toString('utf8') ?? ''),
      },
      this.signatureService.apiSecret,
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid request signature');
    }

    if (!this.signatureService.rememberNonce(nonce)) {
      throw new UnauthorizedException('Request nonce has already been used');
    }

    return true;
  }
}
