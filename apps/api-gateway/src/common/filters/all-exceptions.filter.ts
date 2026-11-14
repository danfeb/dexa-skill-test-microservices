import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TimeoutError } from 'rxjs';
import {
  FILE_TOO_LARGE,
  INVALID_UPLOAD_REQUEST,
  SERVICE_UNAVAILABLE,
} from '@app/common';

const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'EPIPE',
  'ETIMEDOUT',
]);

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  result: null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const isServiceError = this.isServiceError(exception);
    const multerError = this.getMulterError(exception);

    const statusCode =
      multerError?.statusCode ??
      (isHttpException
        ? exception.getStatus()
        : isServiceError
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR);

    const message =
      multerError?.message ??
      (isHttpException
        ? this.resolveHttpMessage(exception)
        : isServiceError
          ? SERVICE_UNAVAILABLE
          : 'Internal server error');

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ApiErrorResponse = {
      statusCode,
      message,
      result: null,
    };

    response.status(statusCode).json(body);
  }

  private isServiceError(exception: unknown): boolean {
    if (exception instanceof TimeoutError) {
      return true;
    }

    if (typeof exception !== 'object' || exception === null) {
      return false;
    }

    if (
      'code' in exception &&
      CONNECTION_ERROR_CODES.has(String((exception as { code: unknown }).code))
    ) {
      return true;
    }

    return (
      'status' in exception &&
      (exception as { status: unknown }).status === 'error'
    );
  }

  private getMulterError(
    exception: unknown,
  ): { statusCode: number; message: string } | null {
    if (
      typeof exception !== 'object' ||
      exception === null ||
      !('name' in exception) ||
      (exception as { name: unknown }).name !== 'MulterError'
    ) {
      return null;
    }

    const code = (exception as { code?: unknown }).code;

    if (code === 'LIMIT_FILE_SIZE') {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: FILE_TOO_LARGE,
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: INVALID_UPLOAD_REQUEST,
    };
  }

  private resolveHttpMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return exception.message || 'Error';
  }
}
