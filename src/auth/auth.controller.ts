import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  // Временный endpoint для тестирования конфигурации
  @Get('health')
  getHealth(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Auth module is working',
    };
  }

  // TODO: Реализовать все auth endpoints согласно требованиям:
  // - POST /register
  // - POST /login
  // - POST /logout
  // - POST /refresh
  // - POST /password/forgot
  // - POST /password/reset
}
