import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateUserPayloadDto,
  decodeBase64Password,
  EMPLOYEE_NOT_FOUND,
  EMPTY_ID,
  FilterUserListDto,
  hashPassword,
  INVALID_PASSWORD_FORMAT,
  ListUser,
  ServiceError,
  UpdateUserPayloadDto,
  User,
  USER_ALREADY_EXISTS,
  USER_CREATE_FAILED,
  USER_NOT_FOUND,
  USER_UPDATE_FAILED,
} from '@app/common';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { UserRepository } from './user.repository.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async getUserList(filterDto: FilterUserListDto): Promise<ListUser[]> {
    return this.userRepository.getUserList(filterDto);
  }

  async getUserCount(filterDto: FilterUserListDto): Promise<number | null> {
    return this.userRepository.getUserCount(filterDto);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }

  async createUser(
    inputDto: CreateUserPayloadDto,
  ): Promise<number | ServiceError> {
    const employeeDto = await this.employeeRepository.findEmployeeById(
      inputDto.employeeId,
    );
    if (!employeeDto) {
      return {
        error: EMPLOYEE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    inputDto.username = employeeDto.code;

    const password = decodeBase64Password(inputDto.password);
    if (!password) {
      return {
        error: INVALID_PASSWORD_FORMAT,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    inputDto.password = hashPassword(password);

    const duplicateDto = await this.userRepository.findUserByUnique(
      inputDto.employeeId,
      inputDto.username,
      inputDto.email,
    );

    if (duplicateDto) {
      return {
        error: USER_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      };
    }

    const id = await this.userRepository.createUser(inputDto);
    if (id === EMPTY_ID) {
      return {
        error: USER_CREATE_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return id;
  }

  async updateUser(
    inputDto: UpdateUserPayloadDto,
  ): Promise<number | ServiceError> {
    const userDto = await this.userRepository.findUserById(inputDto.id);

    if (!userDto) {
      return {
        error: USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    const duplicateDto = await this.userRepository.findUserByEmail(
      inputDto.email,
    );

    if (duplicateDto && duplicateDto.id !== inputDto.id) {
      return {
        error: USER_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      };
    }

    const id = await this.userRepository.updateUser(inputDto);

    if (id === EMPTY_ID) {
      return {
        error: USER_UPDATE_FAILED,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return id;
  }

  async deleteUser(id: number): Promise<number | ServiceError> {
    const userId = await this.userRepository.deleteUser(id);

    if (userId === EMPTY_ID) {
      return {
        error: USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    return userId;
  }
}
