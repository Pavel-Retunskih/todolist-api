import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { TokenService } from './services/token.service'
import { createMockUserRepository } from '../../test/mocks/repository.mocks'
import { createMockSessionRepository } from '../../test/mocks/repository.mocks'
import { User } from '../modules/users/domain/user.entity'
import { type UserRepository } from '../modules/users/domain/user.repository'
import { type SessionRepository } from '../modules/sessions/domain/sessions.repository'
import { PasswordUtil } from '../common/utils/password.util'

describe('AuthService', () => {
  let authService: AuthService
  let userRepository: jest.Mocked<UserRepository>
  let sessionRepository: jest.Mocked<SessionRepository>
  let tokenService: jest.Mocked<TokenService>
  let configService: jest.Mocked<ConfigService>

  const mockUser = new User(
    'user-1',
    'test@test.com',
    '$2b$12$hashedpassword',
    new Date(),
    new Date(),
  )

  beforeEach(async () => {
    userRepository = createMockUserRepository()
    sessionRepository = createMockSessionRepository()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: userRepository },
        { provide: 'SessionsRepository', useValue: sessionRepository },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
            verifyRefreshToken: jest.fn(),
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

    authService = module.get<AuthService>(AuthService)
    tokenService = module.get(TokenService)
    configService = module.get(ConfigService)
  })

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null)
      userRepository.createUser.mockResolvedValue(mockUser)
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })

      const result = await authService.register({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('accessToken', 'access-token')
      expect(result).toHaveProperty('refreshToken', 'refresh-token')
      expect(result).toHaveProperty('email', 'test@test.com')
      expect(result).toHaveProperty('id', 'user-1')
      expect(userRepository.createUser).toHaveBeenCalled()
    })

    it('should throw BadRequestException if email already exists', async () => {
      userRepository.getUserByEmail.mockResolvedValue(mockUser)

      await expect(
        authService.register({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('login', () => {
    it('should login user and return tokens with session', async () => {
      const userWithPassword = new User(
        'user-1',
        'test@test.com',
        '$2b$12$hashedpassword',
        new Date(),
        new Date(),
      )
      userRepository.findUserByEmailWithPassword.mockResolvedValue(
        userWithPassword,
      )
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
      configService.get.mockReturnValue('7d')

      jest
        .spyOn(PasswordUtil, 'verifyPassword')
        .mockResolvedValue(true)

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('accessToken', 'access-token')
      expect(result).toHaveProperty('refreshToken', 'refresh-token')
      expect(result).toHaveProperty('id', 'user-1')
      expect(result).toHaveProperty('email', 'test@test.com')
      expect(result).toHaveProperty('expiresAt')
      expect(sessionRepository.createSession).toHaveBeenCalled()
    })

    it('should throw BadRequestException when user not found', async () => {
      userRepository.findUserByEmailWithPassword.mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'notexist@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when password is wrong', async () => {
      userRepository.findUserByEmailWithPassword.mockResolvedValue(mockUser)

      jest
        .spyOn(PasswordUtil, 'verifyPassword')
        .mockResolvedValue(false)

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('logout', () => {
    it('should verify refresh token and delete session', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        sub: 'user-1',
        email: 'test@test.com',
      })
      sessionRepository.deleteByUserIdAndRefreshToken.mockResolvedValue(
        'deleted',
      )

      await authService.logout({ refreshToken: 'refresh-token' })

      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      )
      expect(
        sessionRepository.deleteByUserIdAndRefreshToken,
      ).toHaveBeenCalledWith('user-1', 'refresh-token')
    })
  })

  describe('refresh', () => {
    it('should verify old token, generate new pair, and rotate session', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({
        sub: 'user-1',
        email: 'test@test.com',
      })
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      })
      configService.get.mockReturnValue('7d')

      const result = await authService.refresh('old-refresh')

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      })
      expect(sessionRepository.rotateRefreshToken).toHaveBeenCalledWith(
        'user-1',
        'old-refresh',
        'new-refresh',
        expect.any(Date),
      )
    })
  })

  describe('logoutAll', () => {
    it('should delete all sessions for the user', async () => {
      sessionRepository.deleteAllByUserId.mockResolvedValue(3)

      await authService.logoutAll('user-1')

      expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith(
        'user-1',
      )
    })
  })

  describe('logoutOthers', () => {
    it('should delete other sessions for the user', async () => {
      sessionRepository.deleteOthersByUserIdAndRefreshToken.mockResolvedValue(2)

      await authService.logoutOthers('user-1', 'current-refresh')

      expect(
        sessionRepository.deleteOthersByUserIdAndRefreshToken,
      ).toHaveBeenCalledWith('user-1', 'current-refresh')
    })
  })
})
