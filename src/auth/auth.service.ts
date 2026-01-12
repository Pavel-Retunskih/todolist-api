import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { PasswordUtil } from '../common/utils/password.util'
import { TokenService } from './services/token.service'
import { type UserRepository } from '../modules/users/domain/user.repository'
import { RegisterDTO } from './dto/reginster.dto'
import { LoginDTO } from './dto/login.dto'
import { LogoutDTO } from './dto/logout.dto'
import { type SessionRepository } from '../modules/sessions/domain/sessions.repository'
import ms from 'ms'

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async register(user: RegisterDTO) {
    const existingUser = await this.userRepository.getUserByEmail(user.email)
    if (existingUser) {
      throw new BadRequestException({
        error: 'Bad Request',
        statusCode: 400,
        field: 'email',
        message: 'Email already in use',
      })
    }
    const hashedPassword = await PasswordUtil.hashPassword(user.password)

    const createdUser = await this.userRepository.createUser({
      email: user.email,
      passwordHash: hashedPassword,
    })
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokenPair({
        email: createdUser.email,
        sub: createdUser.id,
      })
    return { ...createdUser.toPublicData(), accessToken, refreshToken }
  }

  async login(user: LoginDTO, deviceId?: string) {
    const foundUser = await this.userRepository.findUserByEmailWithPassword(
      user.email,
      user.password,
    )
    if (!foundUser) {
      throw new BadRequestException('Invalid email or password')
    }

    if (
      !(await PasswordUtil.verifyPassword(
        user.password,
        foundUser.passwordHash,
      ))
    ) {
      throw new BadRequestException('Invalid email or password')
    }

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokenPair({
        email: foundUser.email,
        sub: foundUser.id,
      })
    const refreshTokenExpiration = (user.rememberMe ? '30d' : this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    ) || '7d') as ms.StringValue
    const expirationMs = ms(refreshTokenExpiration)
    const expiresAt = new Date(Date.now() + expirationMs)

    await this.sessionsRepository.createSession({
      userId: foundUser.id,
      refreshToken,
      deviceId: deviceId ?? randomUUID(),
      expiresAt,
    })
    return {
      id: foundUser.id,
      email: foundUser.email,
      accessToken,
      refreshToken,
      expiresAt,
    }
  }

  async logout({ refreshToken }: LogoutDTO) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.sessionsRepository.deleteByUserIdAndRefreshToken(
      payload.sub,
      refreshToken,
    )
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken)

    const { accessToken, refreshToken: newRefresh } =
      await this.tokenService.generateTokenPair({
        email: payload.email,
        sub: payload.sub,
      })

    const refreshTokenExpiration = (this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    ) || '7d') as ms.StringValue
    const expirationMs = ms(refreshTokenExpiration)
    const newExpiresAt = new Date(Date.now() + expirationMs)

    await this.sessionsRepository.rotateRefreshToken(
      payload.sub,
      refreshToken,
      newRefresh,
      newExpiresAt,
    )

    return { accessToken, refreshToken: newRefresh }
  }

  async logoutAll(userId: string) {
    await this.sessionsRepository.deleteAllByUserId(userId)
  }

  async logoutOthers(userId: string, refreshToken: string) {
    await this.sessionsRepository.deleteOthersByUserIdAndRefreshToken(
      userId,
      refreshToken,
    )
  }
}
