import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MASTER_SERVICES } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbModule } from '../db/db.module.js';
import { AttendanceLogService } from './attendance-log.service.js';
import { AttendanceLogRepository } from './attendance-log.repository.js';
import { AttendanceLogController } from './attendance-log.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: MASTER_SERVICES,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('HOST'),
              port: Number(configService.get<string>('PORT_MASTER_SERVICE')),
            },
          }),
        },
      ],
    }),
    DbModule,
  ],
  controllers: [AttendanceLogController],
  providers: [AttendanceLogService, AttendanceLogRepository],
})
export class AttendanceLogModule {}
