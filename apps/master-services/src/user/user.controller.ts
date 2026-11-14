import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserPayloadDto,
  FilterUserListDto,
  ListUser,
  ServiceError,
  UpdateUserPayloadDto,
  User,
  USER_MESSAGE_PATTERNS,
} from '@app/common';
import { UserService } from './user.service.js';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_MESSAGE_PATTERNS.GET_USER_LIST)
  getUserList(@Payload() filterDto: FilterUserListDto): Promise<ListUser[]> {
    return this.userService.getUserList(filterDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.GET_USER_COUNT)
  getUserCount(
    @Payload() filterDto: FilterUserListDto,
  ): Promise<number | null> {
    return this.userService.getUserCount(filterDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.FIND_USER_BY_EMAIL)
  findUserByEmail(@Payload() email: string): Promise<User | null> {
    return this.userService.findUserByEmail(email);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.FIND_USER_BY_ID)
  findUserById(@Payload() id: number): Promise<User | null> {
    return this.userService.findUserById(id);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.CREATE_USER)
  createUser(
    @Payload() inputDto: CreateUserPayloadDto,
  ): Promise<number | ServiceError> {
    return this.userService.createUser(inputDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.UPDATE_USER)
  updateUser(
    @Payload() inputDto: UpdateUserPayloadDto,
  ): Promise<number | ServiceError> {
    return this.userService.updateUser(inputDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.DELETE_USER)
  deleteUser(@Payload() id: number): Promise<number | ServiceError> {
    return this.userService.deleteUser(id);
  }
}
