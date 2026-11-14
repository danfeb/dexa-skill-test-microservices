import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import {
  AttendanceLog,
  FilterAttendanceLogListDto,
  AttendanceLogList,
  EMPTY_ID,
  formatDateOnly,
  PresencePayloadDto,
} from '@app/common';
import oracledb from 'oracledb';

const defineColumns = `
  id AS "id", user_id AS "userId", employee_id AS "employeeId",
  work_type AS "workType", attachment AS "attachment", attendance_datetime AS "attendanceDatetime", description AS "description",
  created_by AS "createdBy", created_at AS "createdAt", updated_by AS "updatedBy", updated_at AS "updatedAt"
`;

@Injectable()
export class AttendanceLogRepository {
  constructor(private readonly dbService: DbService) {}

  async findAttendanceLogById(id: number): Promise<AttendanceLog | null> {
    const query = `SELECT ${defineColumns} FROM atd_attendance_log WHERE id = :id`;

    const params: oracledb.BindParameters = {
      id: Number(id),
    };

    const rows = await this.dbService.query<AttendanceLog>(query, params);
    return rows[0] ?? null;
  }

  async presence(inputDto: PresencePayloadDto): Promise<number> {
    const query = `
        INSERT INTO atd_attendance_log (
            user_id, employee_id, work_type, attachment,
            attendance_datetime, description,
            created_by, created_at, updated_by, updated_at
        ) VALUES (
            :userId, :employeeId, :workType, :attachment,
            :attendanceDatetime, :description, 
            :createdBy, :createdAt, :updatedBy, :updatedAt
        )
        RETURNING id INTO :id
    `;

    const params: oracledb.BindParameters = {
      userId: inputDto.userId,
      employeeId: inputDto.employeeId,
      workType: inputDto.workType,
      attachment: inputDto.attachment,
      attendanceDatetime: inputDto.attendanceDatetime,
      description: inputDto.description,
      createdBy: inputDto.createdBy,
      createdAt: inputDto.createdAt,
      updatedBy: inputDto.updatedBy,
      updatedAt: inputDto.updatedAt,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await this.dbService.execute<{ id: number[] }>(
      query,
      params,
    );

    const id = result.outBinds?.id?.[0];

    return id === undefined ? EMPTY_ID : Number(id);
  }

  async getTodayAttendanceLogByUserId(
    userId: number,
  ): Promise<AttendanceLog | null> {
    const query = `
        SELECT ${defineColumns}
        FROM atd_attendance_log
        WHERE SUBSTR(attendance_datetime, 1, 8) = :currentDate
            AND user_id = :userId
    `;

    const params: oracledb.BindParameters = {
      currentDate: formatDateOnly(),
      userId: Number(userId),
    };

    const rows = await this.dbService.query<AttendanceLog>(query, params);

    return rows[0] ?? null;
  }

  async getAttendanceLogList(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<AttendanceLogList[]> {
    const conditions: string[] = [];
    const params: oracledb.BindParameters = {};

    let query = `
        SELECT 
          A.id AS "id", A.user_id AS "userId", A.employee_id AS "employeeId", B.code AS "employeeCode", B.full_name AS "employeeName",
          C.email AS "email", A.work_type AS "workType", A.attachment AS "attachment", A.attendance_datetime AS "attendanceDatetime", A.description AS "description"
        FROM atd_attendance_log A
            INNER JOIN m_employee B ON B.id = A.employee_id
            INNER JOIN m_user C ON C.id = A.user_id
    `;

    if (
      filterDto.employeeId !== undefined &&
      filterDto.employeeId !== EMPTY_ID &&
      filterDto.employeeId > 0
    ) {
      conditions.push('A.employee_id = :employeeId');
      params.employeeId = Number(filterDto.employeeId);
    }

    if (
      filterDto.userId !== undefined &&
      filterDto.userId !== EMPTY_ID &&
      filterDto.userId > 0
    ) {
      conditions.push('A.user_id = :userId');
      params.userId = Number(filterDto.userId);
    }

    if (filterDto.attendanceDateFrom?.trim()) {
      conditions.push(
        'SUBSTR(A.attendance_datetime, 1, 8) >= :attendanceDateFrom',
      );
      params.attendanceDateFrom = filterDto.attendanceDateFrom;
    }

    if (filterDto.attendanceDateTo?.trim()) {
      conditions.push(
        'SUBSTR(A.attendance_datetime, 1, 8) <= :attendanceDateTo',
      );
      params.attendanceDateTo = filterDto.attendanceDateTo;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      ORDER BY A.attendance_datetime DESC
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;
    params.offset = Number(filterDto.offset);
    params.limit = Number(filterDto.limit);

    return this.dbService.query<AttendanceLogList>(query, params);
  }

  async getAttendanceLogCount(
    filterDto: FilterAttendanceLogListDto,
  ): Promise<number | null> {
    const conditions: string[] = [];
    const params: oracledb.BindParameters = {};

    let query = `
        SELECT COUNT(1) AS "count"
        FROM atd_attendance_log A
            INNER JOIN m_employee B ON B.id = A.employee_id
            INNER JOIN m_user C ON C.id = A.user_id
    `;

    if (
      filterDto.employeeId !== undefined &&
      filterDto.employeeId !== EMPTY_ID &&
      filterDto.employeeId > 0
    ) {
      conditions.push('A.employee_id = :employeeId');
      params.employeeId = Number(filterDto.employeeId);
    }

    if (
      filterDto.userId !== undefined &&
      filterDto.userId !== EMPTY_ID &&
      filterDto.userId > 0
    ) {
      conditions.push('A.user_id = :userId');
      params.userId = Number(filterDto.userId);
    }

    if (filterDto.attendanceDateFrom?.trim()) {
      conditions.push(
        'SUBSTR(A.attendance_datetime, 1, 8) >= :attendanceDateFrom',
      );
      params.attendanceDateFrom = filterDto.attendanceDateFrom;
    }

    if (filterDto.attendanceDateTo?.trim()) {
      conditions.push(
        'SUBSTR(A.attendance_datetime, 1, 8) <= :attendanceDateTo',
      );
      params.attendanceDateTo = filterDto.attendanceDateTo;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countDto = await this.dbService.query<{ count: number }>(
      query,
      params,
    );
    return countDto[0].count ?? null;
  }
}
