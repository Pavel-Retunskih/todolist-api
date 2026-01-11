import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import cookieParser from 'cookie-parser'

let mongod: MongoMemoryServer | undefined

/**
 * Создает in-memory MongoDB для тестов
 */
export const createTestDatabase = async (): Promise<string> => {
  mongod = await MongoMemoryServer.create()
  return mongod.getUri()
}

/**
 * Закрывает in-memory MongoDB
 */
export const closeTestDatabase = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop()
  }
}

/**
 * Создает NestJS приложение для E2E тестов
 */
export const createTestApp = async (
  moduleMetadata: any,
): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule(
    moduleMetadata,
  ).compile()

  const app = moduleFixture.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.use(cookieParser())
  app.setGlobalPrefix('api/v1')

  await app.init()
  return app
}

/**
 * Утилита для создания тестового модуля с in-memory MongoDB
 */
export const createTestModuleWithDb = async (imports: any[]) => {
  const uri = await createTestDatabase()

  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            database: { url: uri, name: 'test-db' },
            jwt: {
              accessSecret: 'test-access-secret-32-chars-long-key',
              accessExpiration: '15m',
              refreshSecret: 'test-refresh-secret-32-chars-long-key',
              refreshExpiration: '7d',
            },
            todolists: { maxPerUser: 10 },
            app: { port: 3000, nodeEnv: 'test' },
          }),
        ],
      }),
      MongooseModule.forRoot(uri, { dbName: 'test-db' }),
      ...imports,
    ],
  })
}

/**
 * Очищает все коллекции в тестовой БД
 */
export const cleanDatabase = async (app: INestApplication): Promise<void> => {
  const connection = app.get('DatabaseConnection')
  if (connection) {
    const collections = await connection.db.collections()
    for (const collection of collections) {
      await collection.deleteMany({})
    }
  }
}
