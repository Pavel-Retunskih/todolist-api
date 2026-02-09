import { Test, TestingModule } from '@nestjs/testing'
import { RedisController } from './redis.controller'
import { RedisService } from './redis.service'

describe('RedisController', () => {
  let controller: RedisController
  let redisService: jest.Mocked<RedisService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedisController],
      providers: [
        {
          provide: RedisService,
          useValue: {
            ping: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<RedisController>(RedisController)
    redisService = module.get(RedisService)
  })

  describe('ping', () => {
    it('should return connected status when redis responds', async () => {
      redisService.ping.mockResolvedValue('PONG')

      const result = await controller.ping()

      expect(result).toEqual({ connected: true, pong: 'PONG' })
    })

    it('should return disconnected status on error', async () => {
      redisService.ping.mockRejectedValue(new Error('Connection refused'))

      const result = await controller.ping()

      expect(result).toEqual({
        connected: false,
        error: 'Connection refused',
      })
    })

    it('should return unknown error when error has no message', async () => {
      redisService.ping.mockRejectedValue({})

      const result = await controller.ping()

      expect(result).toEqual({ connected: false, error: 'unknown' })
    })
  })
})
