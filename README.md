# 📝 TodoList API

REST API для управления списками задач, построенный на NestJS с MongoDB.

## 🚀 Особенности

- **NestJS** - современный Node.js фреймворк
- **MongoDB** с **Mongoose** ODM
- **JWT аутентификация** (Access + Refresh токены)
- **Bcrypt** для безопасного хеширования паролей
- **Zod** для валидации конфигурации
- **Чистая архитектура** с разделением на слои
- **Drag & Drop** для задач (планируется)
- **TypeScript** для типобезопасности

## 📋 Требования

- Node.js >= 18
- pnpm >= 8
- MongoDB >= 5.0 (или Docker)

## ⚡ Быстрый старт

### 1. Установить зависимости
```bash
pnpm install
```

### 2. Настроить переменные окружения
Файл `.env` уже настроен для разработки. Основные настройки:

```env
# Application
NODE_ENV=development
PORT=5000

# Database (Docker MongoDB)
DATABASE_URL=mongodb://root:password@localhost:27017/todolist-api?authSource=admin
DATABASE_NAME=todolist-api

# JWT (32+ символа обязательно!)
JWT_ACCESS_SECRET=super-secret-jwt-access-key-for-development-32-chars-long
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-for-development-32-chars-long
JWT_REFRESH_EXPIRATION=7d
```

### 3. Запустить для разработки

**🎯 Рекомендуемый способ** (все в одной команде):
```bash
# Запускает MongoDB в Docker + заполняет тестовыми данными + запускает API
pnpm run dev
```

**Альтернативные команды:**
```bash
# Чистый запуск (удаляет все данные и запускает заново)
pnpm run dev:clean

# Только поднять MongoDB
pnpm run db:start

# Только заполнить БД тестовыми данными
pnpm run db:seed

# Сбросить и заново заполнить БД
pnpm run db:reset

# Остановить все сервисы
pnpm run docker:down

# Посмотреть логи MongoDB
pnpm run docker:logs
```

### 4. Тестовые данные

После запуска доступны:
- **API:** `http://localhost:3000/api/v1`
- **MongoDB Admin:** `http://localhost:8081` (admin/admin)
- **Тестовый пользователь:** `test@example.com` / `password123`
- **4 тестовые задачи** в списке "My First Todo List"

## 📚 API Документация

### Аутентификация

#### Регистрация
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Ответ
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "createdAt": "2023-10-02T20:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Защищенные эндпоинты
```http
Authorization: Bearer <accessToken>
```

## 🏗️ Архитектура

```
src/
├── auth/                    # Аутентификация
│   ├── decorators/         # @Public(), @User()
│   ├── guards/            # JWT Guard
│   ├── services/          # TokenService
│   └── strategies/        # JWT Strategy
├── modules/users/         # Модуль пользователей
│   ├── domain/           # Бизнес-логика
│   ├── infrastructure/   # MongoDB репозитории
│   └── presentation/     # HTTP контроллеры
├── config/               # Конфигурация
└── common/              # Утилиты
```

## 🐳 Docker

### Разработка (рекомендуется)
Используйте команды из package.json для автоматического управления:

```bash
# Запуск всего окружения разработки
pnpm run dev

# Остановка всех сервисов
pnpm run docker:down
```

### Ручное управление Docker Compose
```bash
# Только MongoDB
docker-compose up -d mongodb

# MongoDB + Mongo Express (веб-интерфейс)
docker-compose --profile tools up -d

# Полный production stack
docker-compose up -d

# Development режим в Docker
docker-compose --profile dev up -d
```

### Сервисы
- **MongoDB:** `localhost:27017` (root/password)
- **Mongo Express:** `http://localhost:8081` (admin/admin)
- **API (prod):** `http://localhost:5000`
- **API (dev):** `http://localhost:5001`

## 📝 TODO

- [ ] TodoLists CRUD API
- [ ] Tasks CRUD API  
- [ ] Drag & Drop функциональность
- [ ] Upload изображений
- [ ] Swagger документация
- [ ] Unit/E2E тесты

---

**Разработано для изучения NestJS, Mongoose и MongoDB** ❤️
