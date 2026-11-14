import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { JwtPayload } from '@app/common';
import {
  CreateEmployeeDto,
  FilterEmployeeListDto,
  ListEmployee,
  UpdateEmployeeDto,
} from '@app/common';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';
import { EmployeeService } from './employee.service.js';

@Controller('master/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('list')
  getEmployeeList(
    @Query() filterDto: FilterEmployeeListDto,
  ): Promise<ListEmployee[]> {
    return this.employeeService.getEmployeeList(filterDto);
  }

  @Get('count')
  getEmployeeCount(
    @Query() filterDto: FilterEmployeeListDto,
  ): Promise<number | null> {
    return this.employeeService.getEmployeeCount(filterDto);
  }

  @Post('create')
  createEmployee(
    @Body() inputDto: CreateEmployeeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<number> {
    return this.employeeService.createEmployee(inputDto, user);
  }

  @Patch('update/:id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() inputDto: UpdateEmployeeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<number> {
    return this.employeeService.updateEmployee(id, inputDto, user);
  }

  @Delete('delete/:id')
  deleteEmployee(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.employeeService.deleteEmployee(id);
  }
}
