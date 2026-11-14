import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  CreateUserPayloadDto,
  EMPTY_VALUE,
  FilterUserListDto,
  formatTimestamp,
  isServiceError,
  JwtPayload,
  ListUser,
  MASTER_SERVICES,
  ServiceError,
  UpdateUserDto,
  UpdateUserPayloadDto,
  USER_MESSAGE_PATTERNS,
} from '@app/common';
import { firstValueFrom, timeout } from 'rxjs';
import { throwHttpError } from '../../common/utils/http-error.util.js';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class UserService {
  constructor(
    @Inject(MASTER_SERVICES) private readonly masterClient: ClientProxy,
  ) {}

  getUserList(filterDto: FilterUserListDto): Promise<ListUser[]> {
    return this.send<ListUser[]>(
      USER_MESSAGE_PATTERNS.GET_USER_LIST,
      filterDto,
    );
  }

  getUserCount(filterDto: FilterUserListDto): Promise<number | null> {
    return this.send<number | null>(
      USER_MESSAGE_PATTERNS.GET_USER_COUNT,
      filterDto,
    );
  }

  createUser(inputDto: CreateUserDto, header: JwtPayload): Promise<number> {
    const now = formatTimestamp();

    const params: CreateUserPayloadDto = {
      employeeId: inputDto.employeeId,
      username: EMPTY_VALUE,
      email: inputDto.email,
      password: inputDto.password,
      role: inputDto.role,
      flgActive: inputDto.flgActive,
      createdBy: header.username,
      updatedBy: header.username,
      createdAt: now,
      updatedAt: now,
    };

    return this.send<number>(USER_MESSAGE_PATTERNS.CREATE_USER, params);
  }

  updateUser(
    id: number,
    inputDto: UpdateUserDto,
    header: JwtPayload,
  ): Promise<number> {
    const params: UpdateUserPayloadDto = {
      id: id,
      email: inputDto.email,
      role: inputDto.role,
      flgActive: inputDto.flgActive,
      updatedBy: header.username,
      updatedAt: formatTimestamp(),
    };

    return this.send<number>(USER_MESSAGE_PATTERNS.UPDATE_USER, params);
  }

  deleteUser(id: number): Promise<number> {
    return this.send<number>(USER_MESSAGE_PATTERNS.DELETE_USER, id);
  }

  private async send<T>(pattern: object, data: unknown): Promise<T> {
    const result = await firstValueFrom(
      this.masterClient
        .send<T | ServiceError>(pattern, data)
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    if (isServiceError(result)) {
      throwHttpError(result.error, result.statusCode);
    }

    return result;
  }
}
