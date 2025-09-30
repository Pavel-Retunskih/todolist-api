# Требования к API тудулиста

Общее
- Базовый URL: /api/v1
- Формат данных: JSON (кроме загрузки изображения — multipart/form-data)
- Часовой пояс и даты: ISO 8601 (UTC)
- Идентификаторы: строки (ObjectId/UUID — по реализации)
- Авторизация: Bearer JWT (короткоживущий access + долгоживущий refresh)
- Доступ: все маршруты, кроме входа и восстановления пароля, требуют заголовок Authorization: Bearer <access_token>

Аутентификация и восстановление пароля
- Механизм входа: email + password
- Хеширование пароля: bcrypt (или argon2)
- Токены: access (например, 15 минут), refresh (например, 7 дней)
- Восстановление пароля: одноразовый токен/код со сроком действия (например, 15 минут), одноразовое использование

Эндпоинты Auth
- POST /api/v1/auth/login
  - Body: { email: string, password: string }
  - 200: { accessToken: string, refreshToken: string, expiresIn: number }
  - 401: неверные учетные данные
- POST /api/v1/auth/refresh
  - Body: { refreshToken: string }
  - 200: { accessToken: string, refreshToken: string, expiresIn: number }
  - 401/403: недействительный/просроченный refresh
- POST /api/v1/auth/logout
  - Body: { refreshToken: string }
  - 204: refresh отозван
- POST /api/v1/auth/password/forgot
  - Body: { email: string }
  - 202: письмо отправлено (всегда возвращать 202 без раскрытия существования email)
- POST /api/v1/auth/password/reset
  - Body: { token: string, newPassword: string }
  - 204: пароль обновлен, все refresh отозваны

Пользователь
- GET /api/v1/users/me
  - Headers: Authorization
  - 200: { id, email, createdAt, ... }

Доменные модели
- User: { id, email (уник.), passwordHash, createdAt, updatedAt }
- TodoList: { id, ownerId (ref User), title, imageUrl?, createdAt, updatedAt }
- Task: { id, listId (ref TodoList), title, description?, status: 'active'|'completed', deadline?, order: number, createdAt, updatedAt }

Валидация (рекомендуется)
- email: RFC-валидный
- password: минимум 8 символов
- title (лист): 1..100 символов
- title (таск): 1..200 символов
- description: максимум 10_000 символов
- deadline: валидная дата (опционально, может быть в будущем)
- image: PNG/JPEG/WebP, до 5 МБ

Права доступа
- Пользователь видит и изменяет только свои тудулисты и связанные задачи
- Все операции с TodoList/Task проверяют ownerId относительно текущего пользователя

Эндпоинты TodoList
- POST /api/v1/todo-lists
  - Body: { title: string }
  - 201: { id, title, imageUrl?, createdAt, updatedAt }
- GET /api/v1/todo-lists
  - Query (опц.): ?page=1&limit=50
  - 200: { items: TodoList[], total: number, page, limit }
- GET /api/v1/todo-lists/:listId
  - 200: TodoList
  - 404: не найдено или не принадлежит пользователю
- PATCH /api/v1/todo-lists/:listId
  - Body: { title?: string }
  - 200: обновленный TodoList
- DELETE /api/v1/todo-lists/:listId
  - 204: удалено (каскадно удаляются задачи списка)
- POST /api/v1/todo-lists/:listId/image
  - Headers: Content-Type: multipart/form-data
  - Body: form-data: image=<file>
  - 200: { id, title, imageUrl, ... }
  - Примечание: сервер сохраняет файл (локально/S3/иное), imageUrl — публичная/подписанная ссылка

Эндпоинты Task
- POST /api/v1/todo-lists/:listId/tasks
  - Body: { title: string, description?: string, deadline?: string (ISO) }
  - Логика: status='active' по умолчанию; order — (макс по списку)+1
  - 201: Task
- GET /api/v1/todo-lists/:listId/tasks
  - Query (опц.): ?status=active|completed&sort=order|deadline&order=asc|desc&page=1&limit=50
  - 200: { items: Task[], total, page, limit }
- GET /api/v1/tasks/:taskId
  - 200: Task (если принадлежит пользователю)
- PATCH /api/v1/tasks/:taskId
  - Body: { title?, description?, status?, deadline? }
  - 200: обновленный Task
- DELETE /api/v1/tasks/:taskId
  - 204: удалено

Drag & Drop — перенос между тудулистами
- POST /api/v1/tasks/:taskId/move
  - Body: { targetListId: string, targetIndex?: number }
  - Логика:
    - Меняет listId на targetListId
    - Вставляет задачу в новую позицию задач целевого списка
    - Пересчитывает order c учетом targetIndex (см. ниже)
  - 200: обновленный Task (с новым listId и order)

Drag & Drop — смена порядка в рамках одного списка
- POST /api/v1/todo-lists/:listId/tasks/reorder
  - Body варианты:
    - Одиночное: { taskId: string, targetIndex: number }
    - Пакетное: { updates: [{ taskId: string, targetIndex: number }, ...] }
  - 204 или 200: порядок сохранен

Поле order и алгоритм ранжирования
- Задачи в списке сортируются по order asc (вторичный ключ — id для стабильности)
- Варианты:
  1) Ранки с дробными значениями: при вставке между A(order=10) и B(order=20) — присвоить 15; периодическая нормализация
  2) Явный targetIndex с полной реиндексацией списка в транзакции

Коды ошибок (общие)
- 400 ValidationError: некорректные входные данные
- 401 Unauthorized: отсутствует/недействителен токен
- 403 Forbidden: ресурс не принадлежит пользователю
- 404 NotFound: ресурс не найден
- 409 Conflict: конфликт порядка/версий (при оптимистической блокировке)
- 413 PayloadTooLarge: слишком большой файл изображения
- 429 TooManyRequests: лимит на /password/forgot
- 500 InternalServerError: прочее

Идемпотентность и конкурентность
- /auth/password/reset — идемпотентно по токену
- Для reorder/move — сервер возвращает актуализированные order; операции обрабатывать последовательно
- Для PATCH — опционально If-Match/ETag или версионное поле

Безопасность
- Все защищенные маршруты — только по Bearer access token
- Refresh токены: хранить/помечать как отозванные при logout/reset password
- Ограничение частоты /auth/password/forgot (например, 5 запросов/час на email/IP)
- Проверка типа и размера файла при загрузке изображения

Технические заметки (рекомендуемые)
- Индексы MongoDB:
  - tasks: { listId: 1, order: 1 }
  - todo-lists: { ownerId: 1, createdAt: -1 }
- Транзакции/сеансы MongoDB — при массовых reorder/move (по необходимости)
- Хранение изображений: локально/S3/MinIO (в зависимости от окружения); imageUrl — публичная/подписанная ссылка
