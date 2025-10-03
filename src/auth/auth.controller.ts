import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common'
import { type Response, type Request } from 'express'
import { AuthService } from './auth.service'
import { Public } from './decorators/auth.decorators'
import { RegisterDTO } from './dto/reginster.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  getHealth(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Auth module is working',
    }
  }

  @Public()
  @Post('register')
  async register(
    @Body() userDto: RegisterDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.register(userDto)
    response.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //TODO: replace with env expiration time
      path: '/api/v1/auth',
    })
    return {
      accessToken: user.accessToken,
      id: user.id,
      email: user.email,
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() userDto: RegisterDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(userDto)
    if (!user)
      return response.status(403).json({ message: 'Invalid email or password' })
    response.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //TODO: replace with env expiration time
      path: '/api/v1/auth',
    })
    return {
      accessToken: user.accessToken,
      id: user.id,
      email: user.email,
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken as unknown as string

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found')
    }

    await this.authService.logout({ refreshToken })

    response.clearCookie('refreshToken', {
      path: '/api/v1/auth',
    })

    return { message: 'Logged out successfully' }
  }
}
