import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { type Response } from 'express';
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
  async register(
    @Body() userDto: UserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.register(userDto);
    response.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: 'api/v1/auth',
    });
    return {
      accessToken: user.accessToken,
      id: user.id,
      email: user.email,
    };
  }
}
