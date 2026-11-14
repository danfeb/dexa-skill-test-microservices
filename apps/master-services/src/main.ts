import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MasterServicesModule } from './master-services.module.js';
import { ConfigService } from '@nestjs/config';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MasterServicesModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST,
        port: Number(process.env.PORT_MASTER_SERVICE),
      },
    },
  );

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT_MASTER_SERVICE');
  const host = configService.get<string>('HOST');

  await app.listen();
  console.log(`Master service listening on ${host}:${port}`);
}

await bootstrap();
