import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

/**
 * API Key Guard
 * - If request contains x-api-key header, it MUST match one of API_KEYS from env
 * - If header is absent, guard allows the request (normal cookie/JWT flow)
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly allowedKeys: string[]

  constructor() {
    this.allowedKeys = (process.env.API_KEYS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { headers: Headers }>()
    // Header can be string | string[] | undefined
    let key = req.headers?.['x-api-key'] as unknown as
      | string
      | string[]
      | undefined

    if (Array.isArray(key)) key = key[0]
    if (typeof key === 'string') key = key.trim()

    // No header => allow (this guard does not force API key for regular flows)
    if (!key) return true

    // Header present, but no configured keys => block
    if (this.allowedKeys.length === 0) {
      throw new ForbiddenException('API key is not configured')
    }

    // Validate key
    if (!this.allowedKeys.includes(key)) {
      throw new ForbiddenException('Invalid API key')
    }

    return true
  }
}
