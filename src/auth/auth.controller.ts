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
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Public } from './decorators/auth.decorators'
import { RegisterDTO } from './dto/reginster.dto'
import { LoginDTO } from './dto/login.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Auth health check' })
  @ApiOkResponse({ schema: { example: { status: 'ok', message: 'Auth module is working' } } })
  getHealth(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Auth module is working',
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDTO })
  @ApiCreatedResponse({ description: 'User registered', schema: { example: { accessToken: 'jwt.access.token', id: '665f1d2c9f1b2c0012345678', email: 'user@example.com' } } })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async register(
    @Body() userDto: RegisterDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('Registering user:', userDto)
    if (!userDto) return new BadRequestException('Invalid request body')
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
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDTO })
  @ApiOkResponse({ description: 'Logged in', schema: { example: { accessToken: 'jwt.access.token', id: '665f1d2c9f1b2c0012345678', email: 'user@example.com' } } })
  @ApiForbiddenResponse({ description: 'Invalid email or password' })
  async login(
    @Body() userDto: LoginDTO,
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
  @ApiOperation({ summary: 'Logout and invalidate current refresh token (cookie)' })
  @ApiOkResponse({ schema: { example: { message: 'Logged out successfully' } } })
  @ApiBadRequestResponse({ description: 'Refresh token not found' })
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

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate refresh token (cookie) and issue new access token' })
  @ApiOkResponse({ schema: { example: { accessToken: 'jwt.access.token' } } })
  @ApiBadRequestResponse({ description: 'Refresh token not found' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentRefresh = request.cookies?.refreshToken as unknown as string
    if (!currentRefresh) {
      throw new BadRequestException('Refresh token not found')
    }

    const { accessToken, refreshToken } =
      await this.authService.refresh(currentRefresh)

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    })

    return { accessToken }
  }
}
