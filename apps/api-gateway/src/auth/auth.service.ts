import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_MESSAGE_PATTERNS,
  AUTH_SERVICES,
  isServiceError,
  LoginDto,
  LoginResponse,
  ServiceError,
} from '@app/common';
import { firstValueFrom, timeout } from 'rxjs';
import { throwHttpError } from '../common/utils/http-error.util.js';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_SERVICES) private readonly authClient: ClientProxy,
  ) {}

  async loginProcess(inputDto: LoginDto): Promise<LoginResponse> {
    return this.send<LoginResponse>(
      AUTH_MESSAGE_PATTERNS.LOGIN_PROCESS,
      inputDto,
    );
  }

  private async send<T>(pattern: object, data: unknown): Promise<T> {
    const result = await firstValueFrom(
      this.authClient
        .send<T | ServiceError>(pattern, data)
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    if (isServiceError(result)) {
      throwHttpError(result.error, result.statusCode);
    }

    return result;
  }
}
