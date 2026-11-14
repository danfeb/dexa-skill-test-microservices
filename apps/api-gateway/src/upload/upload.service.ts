import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createHash } from 'node:crypto';
import { firstValueFrom, timeout } from 'rxjs';
import {
  INVALID_FILE_HASH,
  isServiceError,
  ServiceError,
  UPLOAD_MESSAGE_PATTERNS,
  UPLOAD_SERVICES,
  UploadFilePayloadDto,
  UploadFileResult,
} from '@app/common';
import { throwHttpError } from '../common/utils/http-error.util.js';

const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_SERVICES) private readonly uploadClient: ClientProxy,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    fileSha256?: string,
  ): Promise<UploadFileResult> {
    if (!fileSha256) {
      throw new UnauthorizedException(INVALID_FILE_HASH);
    }

    const actualHash = createHash('sha256').update(file.buffer).digest('hex');

    if (actualHash !== fileSha256.toLowerCase()) {
      throw new UnauthorizedException(INVALID_FILE_HASH);
    }

    const params: UploadFilePayloadDto = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer.toString('base64'),
    };

    return this.send<UploadFileResult>(
      UPLOAD_MESSAGE_PATTERNS.UPLOAD_FILE,
      params,
    );
  }

  private async send<T>(pattern: object, data: unknown): Promise<T> {
    const result = await firstValueFrom(
      this.uploadClient
        .send<T | ServiceError>(pattern, data)
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    if (isServiceError(result)) {
      throwHttpError(result.error, result.statusCode);
    }

    return result;
  }
}
