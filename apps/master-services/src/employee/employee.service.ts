import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateEmployeePayloadDto,
  EMPLOYEE_CODE_ALREADY_EXISTS,
  EMPLOYEE_CREATE_FAILED,
  EMPLOYEE_NOT_FOUND,
  EMPLOYEE_UPDATE_FAILED,
  EMPTY_ID,
  FilterEmployeeListDto,
  ListEmployee,
  ServiceError,
  UpdateEmployeePayloadDto,
} from '@app/common';
import { EmployeeRepository } from './employee.repository.js';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async getEmployeeList(
    filterDto: FilterEmployeeListDto,
  ): Promise<ListEmployee[]> {
    return this.employeeRepository.getEmployeeList(filterDto);
  }

  async getEmployeeCount(
    filterDto: FilterEmployeeListDto,
  ): Promise<number | null> {
    return this.employeeRepository.getEmployeeCount(filterDto);
  }

  async createEmployee(
    inputDto: CreateEmployeePayloadDto,
  ): Promise<number | ServiceError> {
    const employeeDto = await this.employeeRepository.findEmployeeByUnique(
      inputDto.code,
    );
    if (employeeDto) {
      return {
        error: EMPLOYEE_CODE_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      };
    }

    const id = await this.employeeRepository.createEmployee(inputDto);
    if (id === EMPTY_ID) {
      return {
        error: EMPLOYEE_CREATE_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return id;
  }

  async updateEmployee(
    inputDto: UpdateEmployeePayloadDto,
  ): Promise<number | ServiceError> {
    const employeeDto = await this.employeeRepository.findEmployeeById(
      inputDto.id,
    );

    if (!employeeDto) {
      return {
        error: EMPLOYEE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    inputDto.code = employeeDto.code;

    const id = await this.employeeRepository.updateEmployee(inputDto);

    if (id === EMPTY_ID) {
      return {
        error: EMPLOYEE_UPDATE_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return id;
  }

  async deleteEmployee(id: number): Promise<number | ServiceError> {
    const employeeId = await this.employeeRepository.deleteEmployee(id);

    if (employeeId === EMPTY_ID) {
      return {
        error: EMPLOYEE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    return employeeId;
  }
}
