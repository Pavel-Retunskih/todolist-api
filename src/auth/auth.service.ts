import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { PasswordUtil } from '../common/utils/password.util'
import { TokenService } from './services/token.service'
import { type UserRepository } from '../modules/users/domain/user.repository'
import { RegisterDTO } from './dto/reginster.dto'
import { LoginDTO } from './dto/login.dto'
import { LogoutDTO } from './dto/logout.dto'

import ms from 'ms'
import { type SessionRepository } from '../modules/sessions/domain/sessions.repository'

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
    try {
      const existingUser = await this.userRepository.getUserByEmail(user.email)
      if (existingUser) {
        throw new BadRequestException('Email already in use')
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
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Failed to register user')
    }
  }

  async login(user: LoginDTO, deviceId?: string) {
    try {
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
      const refreshTokenExpiration = (this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRATION',
      ) || '7d') as ms.StringValue
      const expirationMs = ms(refreshTokenExpiration)
      const expiresAt = new Date(Date.now() + expirationMs)

      await this.sessionsRepository.createSession({
        userId: foundUser.id,
        refreshToken,
        deviceId: deviceId ?? randomUUID(),
        expiresAt: expiresAt,
      })
      return {
        id: foundUser.id,
        email: foundUser.email,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Failed to login user')
    }
  }

  async logout({ refreshToken }: LogoutDTO) {
    await this.sessionsRepository.deleteSession(refreshToken)
  }
}
