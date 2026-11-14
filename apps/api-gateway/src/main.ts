import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ApiGatewayModule } from './api-gateway.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    ApiGatewayModule,
    {
      rawBody: true,
    },
  );

  app.set('json spaces', 2);

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'x-timestamp',
      'x-nonce',
      'x-signature',
      'x-file-sha256',
    ],
  });

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT_API_GATEWAY'));
  const host = configService.get<string>('HOST');

  await app.listen(port);
  console.log(`API gateway listening on ${host}:${port}`);
}

await bootstrap();
