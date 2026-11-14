import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateEmployeeDto,
  CreateEmployeePayloadDto,
  EMPLOYEE_MESSAGE_PATTERNS,
  EMPTY_VALUE,
  FilterEmployeeListDto,
  formatTimestamp,
  isServiceError,
  JwtPayload,
  ListEmployee,
  MASTER_SERVICES,
  ServiceError,
  UpdateEmployeeDto,
  UpdateEmployeePayloadDto,
} from '@app/common';
import { firstValueFrom, timeout } from 'rxjs';
import { throwHttpError } from '../../common/utils/http-error.util.js';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(MASTER_SERVICES) private readonly masterClient: ClientProxy,
  ) {}

  getEmployeeList(filterDto: FilterEmployeeListDto): Promise<ListEmployee[]> {
    return this.send<ListEmployee[]>(
      EMPLOYEE_MESSAGE_PATTERNS.GET_EMPLOYEE_LIST,
      filterDto,
    );
  }

  getEmployeeCount(filterDto: FilterEmployeeListDto): Promise<number | null> {
    return this.send<number | null>(
      EMPLOYEE_MESSAGE_PATTERNS.GET_EMPLOYEE_COUNT,
      filterDto,
    );
  }

  createEmployee(
    inputDto: CreateEmployeeDto,
    header: JwtPayload,
  ): Promise<number> {
    const now = formatTimestamp();

    const params: CreateEmployeePayloadDto = {
      code: inputDto.code,
      fullName: inputDto.fullName,
      dateOfBirth: inputDto.dateOfBirth,
      staffLevel: inputDto.staffLevel,
      joinSince: inputDto.joinSince,
      flgActive: inputDto.flgActive,
      createdBy: header.username,
      updatedBy: header.username,
      createdAt: now,
      updatedAt: now,
    };

    return this.send<number>(EMPLOYEE_MESSAGE_PATTERNS.CREATE_EMPLOYEE, params);
  }

  updateEmployee(
    id: number,
    inputDto: UpdateEmployeeDto,
    header: JwtPayload,
  ): Promise<number> {
    const params: UpdateEmployeePayloadDto = {
      id: id,
      code: EMPTY_VALUE,
      fullName: inputDto.fullName,
      dateOfBirth: inputDto.dateOfBirth,
      staffLevel: inputDto.staffLevel,
      joinSince: inputDto.joinSince,
      flgActive: inputDto.flgActive,
      updatedBy: header.username,
      updatedAt: formatTimestamp(),
    };

    return this.send<number>(EMPLOYEE_MESSAGE_PATTERNS.UPDATE_EMPLOYEE, params);
  }

  deleteEmployee(id: number): Promise<number> {
    return this.send<number>(EMPLOYEE_MESSAGE_PATTERNS.DELETE_EMPLOYEE, id);
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
