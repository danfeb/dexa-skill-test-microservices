import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AttendanceServicesModule } from './attendance-services.module.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AttendanceServicesModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST,
        port: Number(process.env.PORT_ATTENDANCE_SERVICE),
      },
    },
  );

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT_ATTENDANCE_SERVICE');
  const host = configService.get<string>('HOST');

  await app.listen();
  console.log(`Attendance service listening on ${host}:${port}`);
}

await bootstrap();
