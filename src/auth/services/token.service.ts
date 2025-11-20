import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

export interface TokenPayload {
  sub: string
  email: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class TokenService {
  constructor(
    readonly jwtService: JwtService,
    readonly configService: ConfigService,
  ) {}

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ])
    return { accessToken, refreshToken }
  }

  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    })
  }

  private async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    })
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      })
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Invalid access token')
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Invalid refresh token')
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const userPayload = await this.verifyRefreshToken(refreshToken)
      if (!userPayload) throw new BadRequestException('Invalid refresh token')
      return await this.generateTokenPair(userPayload)
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Failed to refresh tokens')
    }
  }
}
