# Архитектурные правила (NestJS + MongoDB, адаптация под Nest CLI)

Цель
- Единый подход к организации кода, границам модулей и слоям, чтобы проект масштабировался и оставался тестопригодным.
- Использовать Nest CLI для генерации заготовок, но соблюдая архитектурные границы.

Базовые принципы
- Модульность по доменам: auth, users, todo-lists, tasks, files (upload/storage).
- Четкое разделение слоев: presentation (HTTP), application (use-cases), domain (модели/правила), infrastructure (репозитории/ODM/внешние сервисы).
- Зависимости направлены «вниз»: presentation → application → domain; infrastructure адаптирует домен к средам.
- Mongoose и внешние детали не протекают в domain/application (интерфейсы репозиториев скрывают реализацию).
- DTO ввода/вывода отделены от доменных сущностей. Не «светим» внутренние поля (например, passwordHash).

Структура каталогов (рекомендуемая)
- src/modules/<module>/
  - presentation/ (controllers, guards, interceptors)
  - application/ (use-cases, фасады, сервисы сценариев)
  - domain/ (entities, value-objects, repository interfaces)
  - infrastructure/ (mongoose schemas, repository impls, mappers, external clients)
  - dto/ (req/res DTO и валидаторы)
  - mappers/ (преобразование domain ⇄ DTO/ORM)

Генерация кода (Nest CLI)
- Всегда создавайте новые артефакты внутри src/modules/<module>:
  - Создать модуль: pnpm exec nest g module modules/todo-lists
  - Создать контроллер: pnpm exec nest g controller modules/todo-lists/presentation --flat
  - Создать сервис (use-case): pnpm exec nest g service modules/todo-lists/application/create-todo-list --flat
  - Создать ресурс (скелет CRUD): pnpm exec nest g resource modules/tasks (затем вручную разнести по слоям)
- После генерации переносите файлы в соответствующие слои, если CLI создал их в иных путях. Обновляйте импорты.
- Именование классов: <Name><Role> (CreateTaskUseCase, TasksController, TasksRepository, TasksMongoRepository).

Контроллеры (presentation)
- Только оркестрация: принимают DTO, вызывают use-cases, возвращают DTO ответа.
- Никакой бизнес-логики и доступа к Mongoose/ORM.
- Подключайте Guards/Interceptors/Filters на уровне контроллеров/роутов (JWT, Roles — при необходимости).

Use-cases (application)
- Каждый сценарий — отдельный сервис/класс: CreateTodoListUseCase, MoveTaskUseCase, ReorderTasksUseCase, UpdateTaskUseCase и т.п.
- Инъекция зависимостей по интерфейсам (репозитории, хранилище файлов, почта и т.д.).
- Валидация инвариантов и координация транзакций (start/commit/abort session в Mongo).

Доменный слой (domain)
- Entities/Value Objects — чистые классы/типы без зависимостей на Nest/Mongoose.
- Бизнес-правила, инварианты, фабрики, политики (например, ограничения заголовков, статусов, дедлайнов).
- Интерфейсы репозиториев (например, TasksRepository) с сигнатурами, поддерживающими сессии.

Инфраструктура (infrastructure)
- Mongoose схемы, индексы и реализации репозиториев.
- Репозитории принимают/возвращают доменные сущности; маппинг выполняется в mapper-утилитах.
- Используйте .lean() для чтений, когда не нужны методы документов.
- Индексация: users.email (unique); tasks: { listId: 1, order: 1 }, { listId: 1, status: 1, order: 1 }; TTL для токенов восстановления.

Хранение порядка задач и DnD
- Поле order определяет порядок в списке; сортировка по order asc (+ id для стабильности).
- Алгоритм:
  - Рекомендуется fractional ranking (например, вставка между 10 и 20 → 15) или LexoRank-подобные ключи.
  - Периодическая нормализация, когда «щелей» недостаточно.
- Перемещение между списками (move) и переупорядочивание (reorder) — атомарно в транзакции Mongo (session/withTransaction).
- На вход принимаем targetIndex или контекст соседей (beforeId/afterId); при конфликте возвращаем 409 + актуальное состояние.

Аутентификация и авторизация
- JWT: короткий access и ротационный refresh. Refresh хранить в базе в хешированном виде с привязкой к пользователю/устройству.
- Guards: JWT Guard на защищенных роутовках, проверка владения ресурсом (ownerId) в use-case/репозитории.
- Rate limit на /auth/login и /auth/password/forgot; троттлинг на уровне глобального или маршрутов.

Пароли и восстановление
- Хеширование: argon2id или bcrypt с современными параметрами.
- Токен восстановления: одноразовый, хранить хеш + TTL, при сбросе пароля инвалидировать все refresh токены пользователя.

Файлы/изображения
- Хранить файлы вне БД (локально/S3/MinIO). В БД — только метаданные и URL.
- Валидация типа по сигнатуре (magic bytes), лимит размера, генерация безопасных имен.
- Абстракция стораджа через интерфейс (FilesStorage), реализации (Local, S3) в infrastructure.

Конфигурация и секреты
- @nestjs/config + схема-валидация (Joi/Zod). Никаких секретов/URL в коде — только через env.
- Подключение Mongo: MongooseModule.forRootAsync с ConfigService; параметры подключений берутся из env.
- Отдельные файлы конфигураций для dev/test/prod; настройка CORS, Helmet, лимитов тела запроса.

Обработка ошибок и ответы
- Глобальный ValidationPipe (whitelist, forbidNonWhitelisted, transform) в main.ts.
- Глобальный Exception Filter для единого формата ошибок.
- Стандарты статусов: 201 + Location при создании; 204 при delete/reorder; 400/401/403/404/409/413/429/500 — по семантике.

Наблюдаемость и логирование
- Структурированные логи (корреляционный requestId). Логирование ключевых бизнес-событий (аутентификация, переносы/переупорядочивания).
- Health/Readiness (Terminus): проверки Mongo, стораджа файлов, почтового сервиса.
- Метрики (Prometheus): RPS, ошибки, p95/p99, задержки БД, размеры очередей (если есть фоновые задачи).

Тестирование
- Unit: мокайте репозитории по интерфейсам; тестируйте use-cases в изоляции.
- Интеграционные: mongodb-memory-server/Testcontainers; e2e — сценарии auth/CRUD/DnD с проверкой консистентности order.
- Конфигурация тестов — отдельные env (тестовая БД, отключенные интеграции).

Документация API
- SwaggerModule в main.ts; описывать DTO и схемы, включить авторизацию Bearer.
- Поддерживать актуальность схем и примеров для критичных эндпоинтов (login, reset, move, reorder).

Миграции и индексы
- Хранить миграции индексов/данных в репозитории (например, migrate-mongo или кастомные скрипты Nest CLI command).
- Авто-создание индексов — только в dev/test; в prod — через миграции/скрипты.

Правила владения и доступа к данным
- Все операции над TodoList/Task разрешены только владельцу (ownerId). Фильтры ownerId применяются на уровне репозитория.

Практики производительности
- .lean() для чтений; проекции (select) только нужных полей; пагинация с ограничением размера страницы.
- Ещё кэширование ETag/If-None-Match на GET списков/задач (по необходимости) с инвалидиацией при изменениях.

Примеры Nest CLI (шаблоны)
- Создать доменный модуль тудулистов: pnpm exec nest g module modules/todo-lists
- Контроллер: pnpm exec nest g controller modules/todo-lists/presentation --flat
- Use-case сервис: pnpm exec nest g service modules/todo-lists/application/create-todo-list --flat
- Репозиторий (интерфейс): pnpm exec nest g class modules/todo-lists/domain/todo-lists.repository --flat
- Репозиторий (реализация): pnpm exec nest g service modules/todo-lists/infrastructure/todo-lists-mongo.repository --flat
- Схема Mongoose: pnpm exec nest g class modules/todo-lists/infrastructure/schemas/todo-list.schema --flat

Замечания по адаптации текущего кода
- Вынести Mongo URI в ConfigModule и перейти на MongooseModule.forRootAsync.
- Создать модульную структуру под требования: modules/auth, modules/users, modules/todo-lists, modules/tasks, modules/files.
- Реализовать алгоритм порядка (fractional/LexoRank) и транзакции для move/reorder.
- Включить глобальные ValidationPipe, Helmet, Throttler и Swagger.
