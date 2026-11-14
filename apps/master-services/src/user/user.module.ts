import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module.js';
import { EmployeeModule } from '../employee/employee.module.js';
import { UserController } from './user.controller.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

@Module({
  imports: [DbModule, EmployeeModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
