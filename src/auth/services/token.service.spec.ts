import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { BadRequestException } from '@nestjs/common'
import { TokenService } from './token.service'

describe('TokenService', () => {
  let tokenService: TokenService
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    tokenService = module.get<TokenService>(TokenService)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
  })

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com' }
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_ACCESS_EXPIRATION: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        }
        return map[key]
      })
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')

      const result = await tokenService.generateTokenPair(payload)

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'access-secret',
        expiresIn: '15m',
      })
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      })
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com' }
      configService.get.mockReturnValue('access-secret')
      jwtService.verifyAsync.mockResolvedValue(payload)

      const result = await tokenService.verifyAccessToken('valid-token')

      expect(result).toEqual(payload)
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'access-secret',
      })
    })

    it('should throw BadRequestException for an invalid access token', async () => {
      configService.get.mockReturnValue('access-secret')
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'))

      await expect(
        tokenService.verifyAccessToken('invalid-token'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should rethrow BadRequestException from jwt verification', async () => {
      configService.get.mockReturnValue('access-secret')
      jwtService.verifyAsync.mockRejectedValue(
        new BadRequestException('custom error'),
      )

      await expect(
        tokenService.verifyAccessToken('invalid-token'),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com' }
      configService.get.mockReturnValue('refresh-secret')
      jwtService.verifyAsync.mockResolvedValue(payload)

      const result = await tokenService.verifyRefreshToken('valid-refresh')

      expect(result).toEqual(payload)
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh', {
        secret: 'refresh-secret',
      })
    })

    it('should throw BadRequestException for an invalid refresh token', async () => {
      configService.get.mockReturnValue('refresh-secret')
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'))

      await expect(
        tokenService.verifyRefreshToken('invalid-token'),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('refreshTokens', () => {
    it('should verify the refresh token and generate a new pair', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com' }
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_ACCESS_EXPIRATION: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        }
        return map[key]
      })
      jwtService.verifyAsync.mockResolvedValue(payload)
      jwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh')

      const result = await tokenService.refreshTokens('old-refresh')

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      })
    })

    it('should throw BadRequestException when refresh token is invalid', async () => {
      configService.get.mockReturnValue('refresh-secret')
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'))

      await expect(
        tokenService.refreshTokens('bad-token'),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
