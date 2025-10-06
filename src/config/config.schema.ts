import { z } from 'zod'

/**
 * Схема валидации переменных окружения
 * Zod автоматически выведет типы для нашей конфигурации
 */
export const configSchema = z.object({
  // Application Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(5000),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Email Configuration
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  // File Storage Configuration
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  STORAGE_S3_BUCKET: z.string().optional(),
  STORAGE_S3_REGION: z.string().optional(),
  STORAGE_S3_ACCESS_KEY: z.string().optional(),
  STORAGE_S3_SECRET_KEY: z.string().optional(),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(10),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MAX_TODOLISTS_PER_USER: z.coerce.number().default(10),
})

/**
 * Тип конфигурации, автоматически выведенный из схемы Zod
 */
export type Config = z.infer<typeof configSchema>

/**
 * Функция валидации переменных окружения
 */
export function validateConfig(config: Record<string, unknown>): Config {
  const result = configSchema.safeParse(config)

  if (!result.success) {
    const errors = result.error.issues.map(
      (error) => `${error.path.join('.')}: ${error.message}`,
    )
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }

  return result.data
}
