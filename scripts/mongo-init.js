// MongoDB Initialization Script
// Этот скрипт выполняется при первом запуске MongoDB контейнера

print('============================================');
print('🚀 Initializing TodoList API Database');
print('============================================');

// Создаем базу данных todolist-api
db = db.getSiblingDB('todolist-api');

// Создаем пользователя для приложения (опционально)
// db.createUser({
//   user: 'todolist-user',
//   pwd: 'todolist-password',
//   roles: [
//     {
//       role: 'readWrite',
//       db: 'todolist-api'
//     }
//   ]
// });

// Создаем коллекции с индексами

// Users коллекция
print('📝 Creating users collection...');
db.createCollection('users');

// Создаем уникальный индекс на email
db.users.createIndex(
  { email: 1 }, 
  { 
    unique: true,
    name: 'unique_email_index'
  }
);

print('✅ Users collection created with unique email index');

// TodoLists коллекция (планируется)
print('📋 Creating todolists collection...');
db.createCollection('todolists');

// Индекс для быстрого поиска списков пользователя
db.todolists.createIndex(
  { ownerId: 1, createdAt: -1 },
  { name: 'owner_created_index' }
);

print('✅ TodoLists collection created with owner index');

// Tasks коллекция (планируется)
print('📌 Creating tasks collection...');
db.createCollection('tasks');

// Индексы для tasks
db.tasks.createIndex(
  { listId: 1, order: 1 },
  { name: 'list_order_index' }
);

db.tasks.createIndex(
  { listId: 1, status: 1, order: 1 },
  { name: 'list_status_order_index' }
);

print('✅ Tasks collection created with order indexes');

// Refresh tokens коллекция (планируется)
print('🔐 Creating refresh_tokens collection...');
db.createCollection('refresh_tokens');

// TTL индекс для автоматического удаления истекших токенов
db.refresh_tokens.createIndex(
  { expiresAt: 1 },
  { 
    expireAfterSeconds: 0,
    name: 'ttl_refresh_tokens'
  }
);

// Индекс для поиска токенов пользователя
db.refresh_tokens.createIndex(
  { userId: 1 },
  { name: 'user_tokens_index' }
);

print('✅ Refresh tokens collection created with TTL index');

// Вставляем тестовые данные (только в development)
if (db.adminCommand('ismaster').ismaster) {
  print('🧪 Inserting sample data for development...');
  
  // Тестовый пользователь (пароль: password123)
  const testUserId = new ObjectId();
  db.users.insertOne({
    _id: testUserId,
    email: 'test@example.com',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgTAL/GyPg8b8DW', // password123
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ Test user created: test@example.com / password123');
  
  // Тестовый список задач
  const testListId = new ObjectId();
  db.todolists.insertOne({
    _id: testListId,
    ownerId: testUserId,
    title: 'My First Todo List',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Тестовые задачи
  db.tasks.insertMany([
    {
      _id: new ObjectId(),
      listId: testListId,
      title: 'Learn NestJS',
      description: 'Study NestJS framework with MongoDB',
      status: 'completed',
      order: 1,
      deadline: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      listId: testListId,
      title: 'Implement Authentication',
      description: 'JWT authentication with bcrypt',
      status: 'completed',
      order: 2,
      deadline: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      listId: testListId,
      title: 'Add Drag & Drop',
      description: 'Implement task reordering functionality',
      status: 'active',
      order: 3,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  print('✅ Sample todo list and tasks created');
}

print('============================================');
print('🎉 TodoList API Database initialized successfully!');
print('📊 Collections created:');
print('  - users (with unique email index)');
print('  - todolists (with owner index)');
print('  - tasks (with order indexes)'); 
print('  - refresh_tokens (with TTL index)');
print('============================================');