import { registerAs } from '@nestjs/config'
import { Config, validateConfig } from './config.schema'

/**
 * Конфигурация приложения
 * Функция registerAs позволяет создать именованную конфигурацию
 * которую можно инжектировать в сервисы
 */
export const appConfig = registerAs('app', (): Config => {
  const config = validateConfig(process.env)
  return config
})

/**
 * Конфигурация базы данных
 * Выделяем отдельно для удобства использования
 */
export const databaseConfig = registerAs('database', () => {
  const config = validateConfig(process.env)
  return {
    url: config.DATABASE_URL,
    name: config.DATABASE_NAME,
  }
})

/**
 * Конфигурация JWT
 */
export const jwtConfig = registerAs('jwt', () => {
  const config = validateConfig(process.env)
  return {
    accessSecret: config.JWT_ACCESS_SECRET,
    accessExpirationTime: config.JWT_ACCESS_EXPIRATION,
    refreshSecret: config.JWT_REFRESH_SECRET,
    refreshExpirationTime: config.JWT_REFRESH_EXPIRATION,
  }
})

/**
 * Конфигурация почты
 */
export const mailConfig = registerAs('mail', () => {
  const config = validateConfig(process.env)
  return {
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
    from: config.MAIL_FROM,
  }
})

/**
 * Конфигурация хранения файлов
 */
export const storageConfig = registerAs('storage', () => {
  const config = validateConfig(process.env)
  return {
    type: config.STORAGE_TYPE,
    local: {
      path: config.STORAGE_LOCAL_PATH,
    },
    s3: {
      bucket: config.STORAGE_S3_BUCKET,
      region: config.STORAGE_S3_REGION,
      accessKey: config.STORAGE_S3_ACCESS_KEY,
      secretKey: config.STORAGE_S3_SECRET_KEY,
    },
  }
})

/**
 * Конфигурация rate limiting
 */
export const throttleConfig = registerAs('throttle', () => {
  const config = validateConfig(process.env)
  return {
    ttl: config.THROTTLE_TTL,
    limit: config.THROTTLE_LIMIT,
  }
})
export const todolistsConfig = registerAs('todolists', () => {
  const config = validateConfig(process.env)
  return {
    maxPerUser: config.MAX_TODOLISTS_PER_USER,
  }
})
