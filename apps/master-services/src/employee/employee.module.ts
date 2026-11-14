import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module.js';
import { EmployeeController } from './employee.controller.js';
import { EmployeeRepository } from './employee.repository.js';
import { EmployeeService } from './employee.service.js';

@Module({
  imports: [DbModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeRepository],
})
export class EmployeeModule {}
