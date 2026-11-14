import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import {
  decodeBase64Password,
  INVALID_CREDENTIALS,
  LoginDto,
  LoginResponse,
  MASTER_SERVICES,
  ServiceError,
  USER_MESSAGE_PATTERNS,
  UserRecord,
  verifyPassword,
} from '@app/common';
import { firstValueFrom, timeout } from 'rxjs';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class AuthService {
  constructor(
    @Inject(MASTER_SERVICES) private readonly masterClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async loginProcess(
    inputDto: LoginDto,
  ): Promise<LoginResponse | ServiceError> {
    const userDto = await firstValueFrom(
      this.masterClient
        .send<UserRecord | null>(
          USER_MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
          inputDto.email,
        )
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    const password = decodeBase64Password(inputDto.password);

    if (
      !userDto ||
      !password ||
      userDto.flgActive !== 'Y' ||
      !verifyPassword(password, userDto.password)
    ) {
      return {
        error: INVALID_CREDENTIALS,
        statusCode: HttpStatus.UNAUTHORIZED,
      };
    }

    const token = this.jwtService.sign({
      uid: String(userDto.id),
      username: userDto.username,
      email: userDto.email,
      role: userDto.role,
    });

    return {
      token: token,
      user: {
        id: userDto.id,
        username: userDto.username,
        email: userDto.email,
        role: userDto.role,
      },
    };
  }
}
