import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null
  private url: string | undefined

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.url = this.config.get<string>('REDIS_URL')
    if (!this.url) {
      return
    }
    this.client = createClient({ url: this.url })
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err)
    })
    await this.client.connect()
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit()
    }
  }

  private async ensureConnected() {
    if (!this.client) {
      if (!this.url) {
        throw new Error('REDIS_URL is not configured')
      }
      this.client = createClient({ url: this.url })
      this.client.on('error', (err) => {
        console.error('Redis Client Error', err)
      })
      await this.client.connect()
    }
  }

  async getClient() {
    await this.ensureConnected()
    return this.client as RedisClientType
  }

  async ping() {
    await this.ensureConnected()
    return (this.client as RedisClientType).ping()
  }
}
