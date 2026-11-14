import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@app/common';
import type { AuthenticatedRequest } from '../guard/jwt-auth.guard.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
