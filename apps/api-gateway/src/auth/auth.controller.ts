import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '@app/common';
import { Public } from '../common/decorator/public.decorator.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  loginProcess(@Body() loginDto: LoginDto) {
    return this.authService.loginProcess(loginDto);
  }
}
