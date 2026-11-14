import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class FilterEmployeeListDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  staffLevel!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  joinSince!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  flgActive!: string;
}

export class CreateEmployeePayloadDto extends CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  updatedBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  createdAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  updatedAt!: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  staffLevel!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  joinSince!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  flgActive!: string;
}

export class UpdateEmployeePayloadDto extends UpdateEmployeeDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  updatedBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  updatedAt!: string;
}
