# Используем официальный Node.js образ в качестве базового
FROM node:18-alpine AS base

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml ./

# ============================================
# Этап для установки зависимостей
# ============================================
FROM base AS deps

# Устанавливаем только production зависимости
RUN pnpm install --frozen-lockfile --prod

# ============================================  
# Этап для разработки (с dev зависимостями)
# ============================================
FROM base AS dev-deps

# Устанавливаем все зависимости (включая dev)
RUN pnpm install --frozen-lockfile

# ============================================
# Этап сборки приложения
# ============================================
FROM dev-deps AS builder

# Копируем исходный код
COPY . .

# Собираем приложение
RUN pnpm run build

# Удаляем dev зависимости и исходники после сборки
RUN pnpm prune --prod && \
    rm -rf src/ test/ && \
    rm -rf node_modules/@types/ && \
    rm -rf node_modules/typescript

# ============================================
# Production образ
# ============================================
FROM node:18-alpine AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из builder этапа
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Создаем директорию для логов и загрузок
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nestjs:nodejs /app/logs /app/uploads

# Переключаемся на non-root пользователя
USER nestjs

# Открываем порт приложения
EXPOSE 5000

# Добавляем health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js || exit 1

# Запускаем приложение
CMD ["node", "dist/main.js"]

# ============================================
# Development образ
# ============================================
FROM dev-deps AS development

# Копируем исходный код
COPY . .

# Открываем порты для разработки (app + debug)
EXPOSE 5000 9229

# Запускаем в dev режиме с hot reload
CMD ["pnpm", "run", "start:dev"]