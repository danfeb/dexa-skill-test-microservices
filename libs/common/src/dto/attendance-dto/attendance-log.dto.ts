import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OptionalInt } from '../../decorators/optional-int.decorator.js';

export class FilterAttendanceLogListDto {
  @OptionalInt()
  employeeId?: number;

  @OptionalInt()
  userId?: number;

  @IsString()
  @IsOptional()
  attendanceDateFrom?: string;

  @IsString()
  @IsOptional()
  attendanceDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class PresenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  workType!: string;

  @IsString()
  @IsNotEmpty()
  attachment!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class PresencePayloadDto extends PresenceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;

  @OptionalInt()
  employeeId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  attendanceDatetime!: string;

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
