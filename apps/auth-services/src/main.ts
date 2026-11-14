import { existsSync } from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServicesModule } from './auth-services.module.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServicesModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_SERVICE_HOST ?? '127.0.0.1',
        port: Number(process.env.PORT_AUTH_SERVICE ?? 3001),
      },
    },
  );

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT_AUTH_SERVICE') ?? '3001';
  const host = configService.get<string>('AUTH_SERVICE_HOST') ?? '127.0.0.1';

  await app.listen();
  console.log(`Auth service listening on ${host}:${port}`);
}

await bootstrap();
