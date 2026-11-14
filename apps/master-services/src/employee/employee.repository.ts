import { Injectable } from '@nestjs/common';
import {
  CreateEmployeePayloadDto,
  Employee,
  EMPTY_ID,
  FilterEmployeeListDto,
  ListEmployee,
  UpdateEmployeePayloadDto,
} from '@app/common';
import oracledb from 'oracledb';
import { DbService } from '../db/db.service.js';

const defineColumns = `
  id AS "id", code AS "code", full_name AS "fullName", date_of_birth AS "dateOfBirth", 
  staff_level AS "staffLevel", join_since AS "joinSince", flg_active AS "flgActive",
  created_by AS "createdBy", created_at AS "createdAt", updated_by AS "updatedBy", updated_at AS "updatedAt"
`;

@Injectable()
export class EmployeeRepository {
  constructor(private readonly dbService: DbService) {}

  async getEmployeeList(
    filterDto: FilterEmployeeListDto,
  ): Promise<ListEmployee[]> {
    const conditions: string[] = [];
    const param: oracledb.BindParameters = {};

    let query = `
      SELECT
        id AS "id", code AS "code", full_name AS "fullName", date_of_birth AS "dateOfBirth",
        staff_level AS "staffLevel", join_since AS "joinSince", flg_active AS "flgActive",
        created_by AS "createdBy", created_at AS "createdAt", updated_by AS "updatedBy", updated_at AS "updatedAt"
      FROM m_employee
    `;

    if (filterDto.keyword?.trim()) {
      conditions.push(
        '(UPPER(full_name) LIKE UPPER(:keyword) OR UPPER(code) LIKE UPPER(:keyword))',
      );
      param.keyword = `%${filterDto.keyword.trim()}%`;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` 
      ORDER BY full_name ASC, id ASC
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;
    param.offset = Number(filterDto.offset);
    param.limit = Number(filterDto.limit);

    return this.dbService.query<ListEmployee>(query, param);
  }

  async getEmployeeCount(
    filterDto: FilterEmployeeListDto,
  ): Promise<number | null> {
    const conditions: string[] = [];
    const param: oracledb.BindParameters = {};

    let query = `
      SELECT COUNT(1) AS "count"
      FROM m_employee
    `;

    if (filterDto.keyword?.trim()) {
      conditions.push(
        '(UPPER(full_name) LIKE UPPER(:keyword) OR UPPER(code) LIKE UPPER(:keyword))',
      );
      param.keyword = `%${filterDto.keyword.trim()}%`;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countDto = await this.dbService.query<{ count: number }>(
      query,
      param,
    );
    return countDto[0].count ?? null;
  }

  async findEmployeeById(id: number): Promise<Employee | null> {
    const query = `SELECT ${defineColumns} FROM m_employee WHERE id = :id`;

    const params: oracledb.BindParameters = {
      id: Number(id),
    };

    const rows = await this.dbService.query<Employee>(query, params);

    return rows[0] ?? null;
  }

  async findEmployeeByUnique(code: string): Promise<Employee | null> {
    const query = `SELECT ${defineColumns} FROM m_employee WHERE code = :code`;

    const params: oracledb.BindParameters = {
      code: code,
    };

    const rows = await this.dbService.query<Employee>(query, params);

    return rows[0] ?? null;
  }

  async createEmployee(inputDto: CreateEmployeePayloadDto): Promise<number> {
    const query = `
      INSERT INTO m_employee (
        code, full_name, date_of_birth, 
        staff_level, join_since, flg_active, 
        created_by, created_at, updated_by, updated_at
      ) VALUES (
        :code, :fullName, :dateOfBirth, :staffLevel, :joinSince,
        :flgActive, :createdBy, :createdAt, :updatedBy, :updatedAt
      )
      RETURNING id INTO :id
    `;

    const params: oracledb.BindParameters = {
      code: inputDto.code,
      fullName: inputDto.fullName,
      dateOfBirth: inputDto.dateOfBirth,
      staffLevel: inputDto.staffLevel,
      joinSince: inputDto.joinSince,
      flgActive: inputDto.flgActive,
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

  async updateEmployee(inputDto: UpdateEmployeePayloadDto): Promise<number> {
    const query = `
      UPDATE m_employee
         SET 
            code = :code, full_name = :fullName, date_of_birth = :dateOfBirth,
            staff_level = :staffLevel, join_since = :joinSince, flg_active = :flgActive,
            updated_by = :updatedBy, updated_at = :updatedAt
       WHERE id = :id
      RETURNING id INTO :updatedId
    `;

    const param: oracledb.BindParameters = {
      id: inputDto.id,
      code: inputDto.code,
      fullName: inputDto.fullName,
      dateOfBirth: inputDto.dateOfBirth,
      staffLevel: inputDto.staffLevel,
      joinSince: inputDto.joinSince,
      flgActive: inputDto.flgActive,
      updatedBy: inputDto.updatedBy,
      updatedAt: inputDto.updatedAt,
      updatedId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await this.dbService.execute<{ updatedId: number[] }>(
      query,
      param,
    );
    const id = result.outBinds?.updatedId?.[0];

    return id === undefined ? EMPTY_ID : Number(id);
  }

  async deleteEmployee(id: number): Promise<number> {
    const query = 'DELETE FROM m_employee WHERE id = :id';

    const params: oracledb.BindParameters = {
      id: Number(id),
    };

    const result = await this.dbService.execute(query, params);

    return (result.rowsAffected ?? 0) > 0 ? id : EMPTY_ID;
  }
}
