import { HttpStatus, Injectable } from '@nestjs/common';
import { stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  buildUniqueFileName,
  FILE_TOO_LARGE,
  INVALID_FILE_EXTENSION,
  isAllowedFileExtension,
  ServiceError,
  UPLOAD_ALLOWED_EXTENSIONS,
  UPLOAD_DIR,
  UPLOAD_DIRECTORY_NOT_FOUND,
  UPLOAD_FAILED,
  UPLOAD_MAX_SIZE_MB,
  UPLOAD_PUBLIC_PREFIX,
  UploadFilePayloadDto,
  UploadFileResult,
} from '@app/common';

@Injectable()
export class UploadService {
  async uploadFile(
    inputDto: UploadFilePayloadDto,
  ): Promise<UploadFileResult | ServiceError> {
    if (
      !isAllowedFileExtension(
        inputDto.originalName,
        UPLOAD_ALLOWED_EXTENSIONS,
      )
    ) {
      return {
        error: INVALID_FILE_EXTENSION,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    const maxSizeBytes = UPLOAD_MAX_SIZE_MB * 1024 * 1024;

    const buffer = Buffer.from(inputDto.data, 'base64');
    if (buffer.length === 0) {
      return {
        error: UPLOAD_FAILED,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    if (buffer.length > maxSizeBytes) {
      return {
        error: FILE_TOO_LARGE,
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      };
    }

    const uploadDir = resolve(process.cwd(), UPLOAD_DIR);
    const uploadDirectory = await stat(uploadDir).catch(() => null);

    if (!uploadDirectory?.isDirectory()) {
      return {
        error: UPLOAD_DIRECTORY_NOT_FOUND,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    const fileName = await this.writeUniqueFile(
      uploadDir,
      inputDto.originalName,
      buffer,
    );

    if (!fileName) {
      return {
        error: UPLOAD_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    const publicPrefix = UPLOAD_PUBLIC_PREFIX.replace(/\/$/, '');

    return {
      fileName: fileName,
      url: `${publicPrefix}/${fileName}`,
    };
  }

  private async writeUniqueFile(
    uploadDir: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<string | null> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const fileName = buildUniqueFileName(originalName);

      try {
        await writeFile(join(uploadDir, fileName), buffer, { flag: 'wx' });
        return fileName;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          return null;
        }
      }
    }

    return null;
  }
}
