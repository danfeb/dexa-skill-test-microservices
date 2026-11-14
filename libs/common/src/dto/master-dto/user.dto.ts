import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class FilterUserListDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  employeeKeyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;
}

export class CreateUserDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId!: number;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  role!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  flgActive!: string;
}

export class CreateUserPayloadDto extends CreateUserDto {
  @IsString()
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  createdAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  updatedBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  updatedAt!: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  role!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  flgActive!: string;
}

export class UpdateUserPayloadDto extends UpdateUserDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  updatedBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  updatedAt!: string;
}
