import { Inject, Injectable } from '@nestjs/common';
import {
  ATTENDANCE_LOG_MESSAGE_PATTERNS,
  ATTENDANCE_SERVICES,
  AttendanceLog,
  FilterAttendanceLogListDto,
  AttendanceLogList,
  EMPTY_ID,
  formatTimestamp,
  isServiceError,
  JwtPayload,
  PresenceDto,
  PresencePayloadDto,
  ServiceError,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { throwHttpError } from '../../common/utils/http-error.util.js';

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class AttendanceLogService {
  constructor(
    @Inject(ATTENDANCE_SERVICES) private readonly attendanceClient: ClientProxy,
  ) {}

  presence(inputDto: PresenceDto, header: JwtPayload): Promise<string> {
    const now = formatTimestamp();
    const params: PresencePayloadDto = {
      userId: Number(header.uid),
      employeeId: EMPTY_ID,
      attendanceDatetime: now,
      workType: inputDto.workType,
      attachment: inputDto.attachment,
      description: inputDto.description,
      createdBy: header.username,
      createdAt: now,
      updatedBy: header.username,
      updatedAt: now,
    };

    return this.send<string>(ATTENDANCE_LOG_MESSAGE_PATTERNS.PRESENCE, params);
  }

  getTodayAttendanceLogByUserId(userId: number): Promise<AttendanceLog | null> {
    return this.send<AttendanceLog>(
      ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_TODAY_ATTENDANCE_LOG_BY_USER_ID,
      userId,
    );
  }

  getAttendanceLogList(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<AttendanceLogList[]> {
    return this.send<AttendanceLogList[]>(
      ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_ATTENDANCE_LOG_LIST,
      filterDto,
    );
  }

  getAttendanceLogCount(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<number | null> {
    return this.send<number | null>(
      ATTENDANCE_LOG_MESSAGE_PATTERNS.GET_ATTENDANCE_LOG_COUNT,
      filterDto,
    );
  }

  private async send<T>(pattern: object, data: unknown): Promise<T> {
    const result = await firstValueFrom(
      this.attendanceClient
        .send<T | ServiceError>(pattern, data)
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );

    if (isServiceError(result)) {
      throwHttpError(result.error, result.statusCode);
    }

    return result;
  }
}
