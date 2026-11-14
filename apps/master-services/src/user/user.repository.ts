import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import {
  CreateUserPayloadDto,
  EMPTY_ID,
  FilterUserListDto,
  ListUser,
  UpdateUserPayloadDto,
  User,
} from '@app/common';
import { DbService } from '../db/db.service.js';

const defineColumns = `
  id AS "id", employee_id AS "employeeId", username AS "username", email AS "email",
  password AS "password", role AS "role", flg_active AS "flgActive",
  created_by AS "createdBy", created_at AS "createdAt", updated_by AS "updatedBy", updated_at AS "updatedAt"
`;

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DbService) {}

  async getUserList(filterDto: FilterUserListDto): Promise<ListUser[]> {
    const conditions: string[] = [];
    const param: oracledb.BindParameters = {};

    let query = `
        SELECT
          A.id AS "id", A.employee_id AS "employeeId", B.code AS "employeeCode", B.full_name AS "employeeName",
          A.username AS "username", A.email AS "email", A.role AS "role", A.flg_active AS "flgActive",
          A.created_by AS "createdBy", A.created_at AS "createdAt", A.updated_by AS "updatedBy", A.updated_at AS "updatedAt"
        FROM m_user A
            INNER JOIN m_employee B ON B.id = A.employee_id
    `;

    if (filterDto.username?.trim()) {
      conditions.push('UPPER(A.username) LIKE UPPER(:username)');
      param.username = `%${filterDto.username.trim()}%`;
    }

    if (filterDto.email?.trim()) {
      conditions.push('UPPER(A.email) LIKE UPPER(:email)');
      param.email = `%${filterDto.email.trim()}%`;
    }

    if (filterDto.employeeKeyword?.trim()) {
      conditions.push(
        '(UPPER(B.code) LIKE UPPER(:employeeKeyword) OR UPPER(B.full_name) LIKE UPPER(:employeeKeyword))',
      );
      param.employeeKeyword = `%${filterDto.employeeKeyword.trim()}%`;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` 
      ORDER BY A.username ASC
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;
    param.offset = Number(filterDto.offset);
    param.limit = Number(filterDto.limit);

    return this.dbService.query<ListUser>(query, param);
  }

  async getUserCount(filterDto: FilterUserListDto): Promise<number | null> {
    const conditions: string[] = [];
    const param: oracledb.BindParameters = {};

    let query = `
      SELECT COUNT(1) AS "count"
      FROM m_user A
             INNER JOIN m_employee B ON B.id = A.employee_id
    `;

    if (filterDto.username?.trim()) {
      conditions.push('UPPER(A.username) LIKE UPPER(:username)');
      param.username = `%${filterDto.username.trim()}%`;
    }

    if (filterDto.email?.trim()) {
      conditions.push('UPPER(A.email) LIKE UPPER(:email)');
      param.email = `%${filterDto.email.trim()}%`;
    }

    if (filterDto.employeeKeyword?.trim()) {
      conditions.push(
        '(UPPER(B.code) LIKE UPPER(:employeeKeyword) OR UPPER(B.full_name) LIKE UPPER(:employeeKeyword))',
      );
      param.employeeKeyword = `%${filterDto.employeeKeyword.trim()}%`;
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

  async findUserById(id: number): Promise<User | null> {
    const query = `SELECT ${defineColumns} FROM m_user WHERE id = :id`;

    const params: oracledb.BindParameters = {
      id: Number(id),
    };

    const rows = await this.dbService.query<User>(query, params);

    return rows[0] ?? null;
  }

  async findUserByUnique(
    employeeId: number,
    username: string,
    email: string,
  ): Promise<User | null> {
    const query = `
      SELECT ${defineColumns}
      FROM m_user
      WHERE employee_id = :employeeId
         OR username = :username
         OR email = :email
    `;

    const params: oracledb.BindParameters = {
      employeeId: Number(employeeId),
      username: username,
      email: email,
    };

    const rows = await this.dbService.query<User>(query, params);

    return rows[0] ?? null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = `SELECT ${defineColumns} FROM m_user WHERE email = :email`;

    const params: oracledb.BindParameters = {
      email: email,
    };

    const rows = await this.dbService.query<User>(query, params);

    return rows[0] ?? null;
  }

  async createUser(inputDto: CreateUserPayloadDto): Promise<number> {
    const query = `
      INSERT INTO m_user (
        employee_id, username, email, password, role, flg_active,
        created_by, created_at, updated_by, updated_at
      ) VALUES (
        :employeeId, :username, :email, :password, :role, :flgActive,
        :createdBy, :createdAt, :updatedBy, :updatedAt
      )
      RETURNING id INTO :id
    `;

    const params: oracledb.BindParameters = {
      employeeId: inputDto.employeeId,
      username: inputDto.username,
      email: inputDto.email,
      password: inputDto.password,
      role: inputDto.role,
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

  async updateUser(inputDto: UpdateUserPayloadDto): Promise<number> {
    const query = `
      UPDATE m_user
         SET
            email = :email, role = :role, flg_active = :flgActive,
            updated_by = :updatedBy, updated_at = :updatedAt
       WHERE id = :id
      RETURNING id INTO :updatedId
    `;

    const param: oracledb.BindParameters = {
      id: inputDto.id,
      email: inputDto.email,
      role: inputDto.role,
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

  async deleteUser(id: number): Promise<number> {
    const query = 'DELETE FROM m_user WHERE id = :id';

    const params: oracledb.BindParameters = {
      id: Number(id),
    };

    const result = await this.dbService.execute(query, params);

    return (result.rowsAffected ?? 0) > 0 ? id : EMPTY_ID;
  }
}
