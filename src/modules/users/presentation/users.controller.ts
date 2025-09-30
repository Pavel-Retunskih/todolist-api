import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserSchema } from '../infrastructure/user.schema';

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Тестовый endpoint для проверки подключения к MongoDB
   */
  @Get('health')
  async getHealth() {
    try {
      // Проверяем подключение к MongoDB
      const count = await this.userModel.countDocuments();
      return {
        status: 'ok',
        message: 'MongoDB connection is working',
        usersCount: count,
        database: 'todolist-api',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Тестовое создание пользователя
   */
  @Post('test')
  async createTestUser(@Body() body: { email: string }) {
    try {
      const testUser = new this.userModel({
        email: body.email || 'test@example.com',
        passwordHash: 'test-hash-12345',
      });

      const savedUser = await testUser.save();

      return {
        message: 'Test user created successfully',
        user: savedUser.toJSON(), // passwordHash будет исключен благодаря toJSON transform
      };
    } catch (error) {
      return {
        message: 'Failed to create test user',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Получение всех пользователей (для тестирования)
   */
  @Get()
  async getAllUsers() {
    try {
      const users = await this.userModel.find().lean(); // .lean() возвращает plain objects
      return {
        message: 'Users retrieved successfully',
        count: users.length,
        users: users.map((user) => ({
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      };
    } catch (error) {
      return {
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
