import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_MESSAGE_PATTERNS, LoginDto } from '@app/common';
import { AuthService } from './auth.service.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_MESSAGE_PATTERNS.LOGIN_PROCESS)
  loginProcess(@Payload() inputDto: LoginDto) {
    return this.authService.loginProcess(inputDto);
  }
}
