import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import oracledb from 'oracledb';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private pool?: oracledb.Pool;

  constructor(private readonly configService: ConfigService) {
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  async onModuleInit(): Promise<void> {
    const user = this.configService.getOrThrow<string>('ORACLE_USER');
    const password = this.configService.getOrThrow<string>('ORACLE_PASSWORD');
    const connectString = this.configService.get<string>(
      'ORACLE_CONNECT_STRING',
    );

    this.pool = await oracledb.createPool({
      user,
      password,
      connectString,
      poolMin: Number(this.configService.get<string>('ORACLE_POOL_MIN')),
      poolMax: Number(this.configService.get<string>('ORACLE_POOL_MAX')),
    });

    this.logger.log(`Oracle connection pool ready (${connectString})`);
  }

  async query<T>(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<T[]> {
    const connection = await this.getPool().getConnection();

    try {
      const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return (result.rows ?? []) as T[];
    } finally {
      await connection.close();
    }
  }

  async execute<T>(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<oracledb.Result<T>> {
    const connection = await this.getPool().getConnection();

    try {
      return await connection.execute<T>(sql, binds, {
        autoCommit: true,
      });
    } finally {
      await connection.close();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.close(10);
    }
  }

  private getPool(): oracledb.Pool {
    if (!this.pool) {
      throw new Error('Oracle connection pool is not initialized');
    }

    return this.pool;
  }
}
