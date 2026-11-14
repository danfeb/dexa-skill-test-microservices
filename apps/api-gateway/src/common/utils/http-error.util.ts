import { HttpException, HttpStatus } from '@nestjs/common';

export function throwHttpError(
  message: string,
  statusCode: number = HttpStatus.BAD_REQUEST,
): never {
  throw new HttpException(message, statusCode);
}
