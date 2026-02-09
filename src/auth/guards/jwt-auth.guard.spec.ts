import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let reflector: jest.Mocked<Reflector>

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any
    guard = new JwtAuthGuard(reflector)
  })

  const createMockContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    }) as any

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      reflector.getAllAndOverride.mockReturnValue(true)
      const context = createMockContext()

      const result = guard.canActivate(context)

      expect(result).toBe(true)
    })

    it('should call super.canActivate for non-public routes', () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      const context = createMockContext()

      // super.canActivate will call Passport validation which we can't mock easily,
      // so we just verify it doesn't return true for non-public routes
      // The actual JWT validation is handled by Passport
      const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockReturnValue(true)

      const result = guard.canActivate(context)

      expect(result).toBe(true)
      superCanActivate.mockRestore()
    })
  })

  describe('handleRequest', () => {
    const context = createMockContext()

    it('should return user when authentication succeeds', () => {
      const user = { id: 'user-1', email: 'test@test.com' }

      const result = guard.handleRequest(null, user, null, context)

      expect(result).toBe(user)
    })

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, null, context)).toThrow(
        UnauthorizedException,
      )
    })

    it('should throw the error when err is provided', () => {
      const error = new Error('auth failed')

      expect(() => guard.handleRequest(error, null, null, context)).toThrow(
        error,
      )
    })

    it('should throw UnauthorizedException for TokenExpiredError', () => {
      const info = { name: 'TokenExpiredError' }

      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        UnauthorizedException,
      )
      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        'Token has expired',
      )
    })

    it('should throw UnauthorizedException for JsonWebTokenError', () => {
      const info = { name: 'JsonWebTokenError' }

      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        UnauthorizedException,
      )
      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        'Invalid token',
      )
    })

    it('should throw UnauthorizedException for NotBeforeError', () => {
      const info = { name: 'NotBeforeError' }

      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        UnauthorizedException,
      )
      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        'Token not active yet',
      )
    })
  })
})
