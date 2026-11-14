import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { EMPTY_ID } from '../constants/empty-constant.js';

export function OptionalInt(min: number = EMPTY_ID): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (value === '' || value === null || value === undefined) {
        return EMPTY_ID;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return EMPTY_ID;
      }

      return Number(value);
    }),
    IsOptional(),
    IsInt(),
    Min(min),
  );
}
