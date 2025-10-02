import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type UserDTO } from '../modules/users/DTO/user.dto';
import { Public } from './decorators/auth.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  getHealth(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Auth module is working',
    };
  }

  @Public()
  @Post('register')
  async register(@Body() userDto: UserDTO) {
    return this.authService.register(userDto);
  }
}
