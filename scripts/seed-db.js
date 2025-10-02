// Database Seeding Script for Development
// Запускается после поднятия MongoDB для добавления тестовых данных

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://root:password@localhost:27017/todolist-api?authSource=admin';
const DB_NAME = 'todolist-api';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Подключаемся к MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Проверяем, есть ли уже данные
    const usersCount = await db.collection('users').countDocuments();
    
    if (usersCount > 0) {
      console.log('🔍 Database already contains data, skipping seeding');
      return;
    }
    
    console.log('📝 Inserting seed data...');
    
    // Тестовый пользователь (пароль: password123)
    const testUserId = new ObjectId();
    await db.collection('users').insertOne({
      _id: testUserId,
      email: 'test@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgTAL/GyPg8b8DW', // password123
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('👤 Test user created: test@example.com / password123');
    
    // Тестовый список задач
    const testListId = new ObjectId();
    await db.collection('todolists').insertOne({
      _id: testListId,
      ownerId: testUserId,
      title: 'My First Todo List',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Тестовые задачи
    await db.collection('tasks').insertMany([
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
      },
      {
        _id: new ObjectId(),
        listId: testListId,
        title: 'Setup Docker',
        description: 'Configure Docker Compose for development',
        status: 'active',
        order: 4,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('📋 Sample todo list and tasks created');
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Небольшая задержка для убеждения, что MongoDB готова
setTimeout(seedDatabase, 2000);