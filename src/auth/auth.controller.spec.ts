import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  const mockResponse = () => {
    const res: any = {}
    res.cookie = jest.fn().mockReturnValue(res)
    res.clearCookie = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)
  })

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth()

      expect(result).toEqual({
        status: 'ok',
        message: 'Auth module is working',
      })
    })
  })

  describe('register', () => {
    it('should register a user and set refresh token cookie', async () => {
      const res = mockResponse()
      authService.register.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await controller.register(
        { email: 'test@test.com', password: 'password123' },
        res,
      )

      expect(result).toEqual({
        accessToken: 'access-token',
        id: 'user-1',
        email: 'test@test.com',
      })
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
        }),
      )
    })
  })

  describe('login', () => {
    it('should login and set refresh token cookie', async () => {
      const res = mockResponse()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      authService.login.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt,
      })

      const result = await controller.login(
        { email: 'test@test.com', password: 'password123' },
        res,
      )

      expect(result).toEqual({
        accessToken: 'access-token',
        id: 'user-1',
        email: 'test@test.com',
      })
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
          expires: expiresAt,
        }),
      )
    })
  })

  describe('logout', () => {
    it('should logout and clear refresh token cookie', async () => {
      const req = { cookies: { refreshToken: 'refresh-token' } } as any
      const res = mockResponse()
      authService.logout.mockResolvedValue(undefined)

      const result = await controller.logout(req, res)

      expect(result).toEqual({ message: 'Logged out successfully' })
      expect(authService.logout).toHaveBeenCalledWith({
        refreshToken: 'refresh-token',
      })
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
        path: '/api/v1/auth',
      })
    })

    it('should throw BadRequestException when no refresh token in cookies', async () => {
      const req = { cookies: {} } as any
      const res = mockResponse()

      await expect(controller.logout(req, res)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('refresh', () => {
    it('should refresh tokens and set new cookie', async () => {
      const req = { cookies: { refreshToken: 'old-refresh' } } as any
      const res = mockResponse()
      authService.refresh.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      })

      const result = await controller.refresh(req, res)

      expect(result).toEqual({ accessToken: 'new-access' })
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
        }),
      )
    })

    it('should throw BadRequestException when no refresh token in cookies', async () => {
      const req = { cookies: {} } as any
      const res = mockResponse()

      await expect(controller.refresh(req, res)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
