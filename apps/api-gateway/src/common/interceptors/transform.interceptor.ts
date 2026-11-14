import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { map, Observable } from 'rxjs';

const HTTP_CODE_METADATA = '__httpCode__';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  result: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    const customStatus = Reflect.getMetadata(
      HTTP_CODE_METADATA,
      context.getHandler(),
    ) as number | undefined;

    const statusCode =
      customStatus ??
      (request.method === 'POST' ? HttpStatus.CREATED : HttpStatus.OK);

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'Success',
        result: data,
      })),
    );
  }
}
