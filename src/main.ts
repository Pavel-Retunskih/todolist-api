import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { ApiKeyGuard } from './common/guards/api-key.guard'
import cookieParser from 'cookie-parser'
import cors, { CorsRequest } from 'cors'
import { CorsOptions } from 'cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Устанавливаем глобальный префикс для всех API маршрутов
  app.setGlobalPrefix('api/v1')

  // Подключаем парсинг cookies для доступа к request.cookies
  app.use(cookieParser())

  // Динамический CORS: с API key разрешаем любой origin без credentials,
  // иначе — строго по списку из CORS_ORIGIN и с credentials (для cookie)

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3006')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const corsDelegate = (
    req: CorsRequest,
    callback: (err: null, options: CorsOptions) => void,
  ) => {
    const origin = req.headers.origin
    let key = req.headers['x-api-key']
    const acrh = (req.headers['access-control-request-headers'] || '')
      .toString()
      .toLowerCase()
    if (typeof key === 'string') key = key.trim()
    if (Array.isArray(key)) key = key[0]

    const wantsApiKey = acrh.includes('x-api-key') || !!key
    if (wantsApiKey) {
      // Для API key — открываем CORS и разрешаем cookies (credentials)
      callback(null, {
        origin: true,
        credentials: true,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'x-api-key',
          'x-refresh-token',
        ],
        exposedHeaders: ['Authorization'],
      })
      return
    }

    // Обычный режим: строгие origin и включаем credentials для cookie
    const originAllowed = !origin || allowedOrigins.includes(origin)
    callback(null, {
      origin: originAllowed ? origin : false,
      credentials: true,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-api-key',
        'x-refresh-token',
      ],
      exposedHeaders: ['Authorization'],
    })
  }

  app.use(cors(corsDelegate))

  // Включаем гарды после CORS (чтобы preflight не блокировался)
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new ApiKeyGuard(), new JwtAuthGuard(reflector))

  await app.listen(process.env.PORT ?? 5000)
}

bootstrap().then(() =>
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 5000}/api/v1`,
  ),
)
