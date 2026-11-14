import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ATTENDANCE_SERVICES,
  AUTH_SERVICES,
  MASTER_SERVICES,
  UPLOAD_SERVICES,
} from '@app/common';
import { AuthModule } from './auth/auth.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { EmployeeModule } from './master/employee/employee.module.js';
import { UserModule } from './master/user/user.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { SignatureGuard } from './common/guard/signature.guard.js';
import { SignatureModule } from './common/signature/signature.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guard/jwt-auth.guard.js';
import { AttendanceLogModule } from './attendance/attendance-log/attendance-log.module.js';
import { UploadModule } from './upload/upload.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
      }),
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: AUTH_SERVICES,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('HOST'),
              port: Number(configService.get<string>('PORT_AUTH_SERVICE')),
            },
          }),
        },
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
        {
          name: ATTENDANCE_SERVICES,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('HOST'),
              port: Number(
                configService.get<string>('PORT_ATTENDANCE_SERVICE'),
              ),
            },
          }),
        },
        {
          name: UPLOAD_SERVICES,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('HOST'),
              port: Number(configService.get<string>('PORT_UPLOAD_SERVICE')),
            },
          }),
        },
      ],
    }),
    SignatureModule,
    AuthModule,
    EmployeeModule,
    UserModule,
    AttendanceLogModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: SignatureGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class ApiGatewayModule {}
