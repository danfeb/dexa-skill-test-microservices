import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AttendanceLogRepository } from './attendance-log.repository.js';
import {
  ALREADY_ATTEND_FOR_TODAY,
  AttendanceLog,
  FilterAttendanceLogListDto,
  AttendanceLogList,
  EMPTY_ID,
  MASTER_SERVICES,
  PRESENCE_FAILED,
  PRESENCE_SUCCESS,
  PresencePayloadDto,
  ServiceError,
  UNAUTHORIZED_USER,
  User,
  USER_MESSAGE_PATTERNS,
} from '@app/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class AttendanceLogService {
  constructor(
    @Inject(MASTER_SERVICES) private readonly masterClient: ClientProxy,
    private readonly attendanceLogRepository: AttendanceLogRepository,
  ) {}

  async presence(inputDto: PresencePayloadDto): Promise<string | ServiceError> {
    const userDto = await firstValueFrom(
      this.masterClient
        .send<User | null>(
          USER_MESSAGE_PATTERNS.FIND_USER_BY_ID,
          inputDto.userId,
        )
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    if (!userDto || userDto.flgActive !== 'Y') {
      return {
        error: UNAUTHORIZED_USER,
        statusCode: HttpStatus.UNAUTHORIZED,
      };
    }

    const existsDto =
      await this.attendanceLogRepository.getTodayAttendanceLogByUserId(
        inputDto.userId,
      );

    if (existsDto) {
      return {
        error: ALREADY_ATTEND_FOR_TODAY,
        statusCode: HttpStatus.CONFLICT,
      };
    }

    inputDto.employeeId = userDto.employeeId;

    const id = await this.attendanceLogRepository.presence(inputDto);
    if (id === EMPTY_ID) {
      return {
        error: PRESENCE_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return PRESENCE_SUCCESS;
  }

  async getTodayAttendanceLogByUserId(
    userId: number,
  ): Promise<AttendanceLog | null> {
    return this.attendanceLogRepository.getTodayAttendanceLogByUserId(userId);
  }

  async getAttendanceLogList(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<AttendanceLogList[]> {
    return this.attendanceLogRepository.getAttendanceLogList(filterDto);
  }

  async getAttendanceLogCount(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<number | null> {
    return this.attendanceLogRepository.getAttendanceLogCount(filterDto);
  }
}
