import { Controller, Get } from '@nestjs/common'
import { RedisService } from './redis.service'
import { Public } from '../auth/decorators/auth.decorators'

@Controller('redis')
export class RedisController {
  constructor(private readonly redis: RedisService) {}

  @Get('ping')
  @Public()
  async ping() {
    try {
      const pong = await this.redis.ping()
      return { connected: true, pong }
    } catch (e: any) {
      return { connected: false, error: e?.message ?? 'unknown' }
    }
  }
}
