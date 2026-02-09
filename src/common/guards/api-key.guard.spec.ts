import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ApiKeyGuard } from './api-key.guard'

describe('ApiKeyGuard', () => {
  const createMockContext = (
    headers: Record<string, string | string[] | undefined>,
  ): ExecutionContext =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers }),
      }),
    }) as any

  afterEach(() => {
    delete process.env.API_KEYS
  })

  it('should allow request when no x-api-key header is present', () => {
    const guard = new ApiKeyGuard()
    const context = createMockContext({})

    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow request when x-api-key matches configured key', () => {
    process.env.API_KEYS = 'test-key-1,test-key-2'
    const guard = new ApiKeyGuard()
    const context = createMockContext({ 'x-api-key': 'test-key-1' })

    expect(guard.canActivate(context)).toBe(true)
  })

  it('should throw ForbiddenException when x-api-key is invalid', () => {
    process.env.API_KEYS = 'test-key-1'
    const guard = new ApiKeyGuard()
    const context = createMockContext({ 'x-api-key': 'wrong-key' })

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    expect(() => guard.canActivate(context)).toThrow('Invalid API key')
  })

  it('should throw ForbiddenException when API key header present but no keys configured', () => {
    process.env.API_KEYS = ''
    const guard = new ApiKeyGuard()
    const context = createMockContext({ 'x-api-key': 'some-key' })

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    expect(() => guard.canActivate(context)).toThrow(
      'API key is not configured',
    )
  })

  it('should handle array x-api-key header', () => {
    process.env.API_KEYS = 'test-key-1'
    const guard = new ApiKeyGuard()
    const context = createMockContext({
      'x-api-key': ['test-key-1', 'test-key-2'],
    })

    expect(guard.canActivate(context)).toBe(true)
  })

  it('should trim the api key before validation', () => {
    process.env.API_KEYS = 'test-key-1'
    const guard = new ApiKeyGuard()
    const context = createMockContext({ 'x-api-key': '  test-key-1  ' })

    expect(guard.canActivate(context)).toBe(true)
  })
})
