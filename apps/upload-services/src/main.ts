import { existsSync } from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UploadServicesModule } from './upload-services.module.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UploadServicesModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST ?? '127.0.0.1',
        port: Number(process.env.PORT_UPLOAD_SERVICE ?? 3005),
      },
    },
  );

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT_UPLOAD_SERVICE') ?? '3005';
  const host = configService.get<string>('HOST') ?? '127.0.0.1';

  await app.listen();
  console.log(`Upload service listening on ${host}:${port}`);
}

await bootstrap();
