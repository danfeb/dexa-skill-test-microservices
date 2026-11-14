import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AttendanceLogService } from './attendance-log.service.js';
import type { JwtPayload } from '@app/common';
import {
  AttendanceLog,
  FilterAttendanceLogListDto,
  AttendanceLogList,
  PresenceDto,
} from '@app/common';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';

@Controller('attendance/attendance-log')
export class AttendanceLogController {
  constructor(private readonly attendanceLogService: AttendanceLogService) {}

  @Post('presence')
  presence(
    @Body() inputDto: PresenceDto,
    @CurrentUser() header: JwtPayload,
  ): Promise<string> {
    return this.attendanceLogService.presence(inputDto, header);
  }

  @Get('today-attendance-log/:userId')
  getTodayAttendanceLogByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AttendanceLog | null> {
    return this.attendanceLogService.getTodayAttendanceLogByUserId(userId);
  }

  @Get('list')
  getAttendanceLogList(
    @Query() filterDto: FilterAttendanceLogListDto,
  ): Promise<AttendanceLogList[]> {
    return this.attendanceLogService.getAttendanceLogList(filterDto);
  }

  @Get('count')
  getAttendanceLogCount(
    @Query() filterDto: FilterAttendanceLogListDto,
  ): Promise<number | null> {
    return this.attendanceLogService.getAttendanceLogCount(filterDto);
  }
}
