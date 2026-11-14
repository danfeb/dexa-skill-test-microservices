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
  CreateUserDto,
  FilterUserListDto,
  ListUser,
  UpdateUserDto,
} from '@app/common';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';
import { UserService } from './user.service.js';

@Controller('master/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  getUserList(@Query() filterDto: FilterUserListDto): Promise<ListUser[]> {
    return this.userService.getUserList(filterDto);
  }

  @Get('count')
  getUserCount(@Query() filterDto: FilterUserListDto): Promise<number | null> {
    return this.userService.getUserCount(filterDto);
  }

  @Post('create')
  createUser(
    @Body() inputDto: CreateUserDto,
    @CurrentUser() header: JwtPayload,
  ): Promise<number> {
    return this.userService.createUser(inputDto, header);
  }

  @Patch('update/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() inputDto: UpdateUserDto,
    @CurrentUser() header: JwtPayload,
  ): Promise<number> {
    return this.userService.updateUser(id, inputDto, header);
  }

  @Delete('delete/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.userService.deleteUser(id);
  }
}
