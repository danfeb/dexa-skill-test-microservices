import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateEmployeePayloadDto,
  EMPLOYEE_MESSAGE_PATTERNS,
  FilterEmployeeListDto,
  ListEmployee,
  ServiceError,
  UpdateEmployeePayloadDto,
} from '@app/common';
import { EmployeeService } from './employee.service.js';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern(EMPLOYEE_MESSAGE_PATTERNS.GET_EMPLOYEE_LIST)
  getEmployeeList(
    @Payload() filterDto: FilterEmployeeListDto,
  ): Promise<ListEmployee[]> {
    return this.employeeService.getEmployeeList(filterDto);
  }

  @MessagePattern(EMPLOYEE_MESSAGE_PATTERNS.GET_EMPLOYEE_COUNT)
  getEmployeesCount(
    @Payload() filterDto: FilterEmployeeListDto,
  ): Promise<number | null> {
    return this.employeeService.getEmployeeCount(filterDto);
  }

  @MessagePattern(EMPLOYEE_MESSAGE_PATTERNS.CREATE_EMPLOYEE)
  createEmployee(
    @Payload() inputDto: CreateEmployeePayloadDto,
  ): Promise<number | ServiceError> {
    return this.employeeService.createEmployee(inputDto);
  }

  @MessagePattern(EMPLOYEE_MESSAGE_PATTERNS.UPDATE_EMPLOYEE)
  updateEmployee(
    @Payload() inputDto: UpdateEmployeePayloadDto,
  ): Promise<number | ServiceError> {
    return this.employeeService.updateEmployee(inputDto);
  }

  @MessagePattern(EMPLOYEE_MESSAGE_PATTERNS.DELETE_EMPLOYEE)
  deleteEmployee(@Payload() id: number): Promise<number | ServiceError> {
    return this.employeeService.deleteEmployee(id);
  }
}
