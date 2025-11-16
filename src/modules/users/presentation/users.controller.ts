import { Body, Controller, Get, Post } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserDocument, UserSchema } from '../infrastructure/user.schema'
import { PasswordUtil } from '../../../common/utils/password.util'
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('Users')
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
  @ApiOperation({ summary: 'Users module health (Mongo connection check)' })
  @ApiOkResponse({ schema: { example: { status: 'ok', message: 'MongoDB connection is working', usersCount: 1, database: 'todolist-api' } } })
  async getHealth() {
    try {
      // Проверяем подключение к MongoDB
      const count = await this.userModel.countDocuments()
      return {
        status: 'ok',
        message: 'MongoDB connection is working',
        usersCount: count,
        database: 'todolist-api',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Тестовое создание пользователя
   */
  @Post('test')
  @ApiOperation({ summary: 'Create test user (for local testing only)' })
  @ApiOkResponse({ schema: { example: { message: 'Test user created successfully', user: { id: '665f1d2c9f1b2c0012345678', email: 'test@example.com', createdAt: '2024-05-01T12:00:00.000Z', updatedAt: '2024-05-01T12:00:00.000Z' } } } })
  async createTestUser(@Body() body: { email: string }) {
    try {
      const testUser = new this.userModel({
        email: body.email || 'test@example.com',
        passwordHash: await PasswordUtil.hashPassword('test-hash-12345'),
      })

      const savedUser = await testUser.save()

      return {
        message: 'Test user created successfully',
        user: savedUser.toJSON(), // passwordHash будет исключен благодаря toJSON transform
      }
    } catch (error) {
      return {
        message: 'Failed to create test user',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Получение всех пользователей (для тестирования)
   */
  @Get()
  @ApiOperation({ summary: 'Get all users (testing only)' })
  @ApiOkResponse({ schema: { example: { message: 'Users retrieved successfully', count: 1, users: [{ id: '665f1d2c9f1b2c0012345678', email: 'test@example.com', createdAt: '2024-05-01T12:00:00.000Z', updatedAt: '2024-05-01T12:00:00.000Z' }] } } })
  async getAllUsers() {
    try {
      const users = await this.userModel.find().lean() // .lean() возвращает plain objects
      return {
        message: 'Users retrieved successfully',
        count: users.length,
        users: users.map((user) => ({
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      }
    } catch (error) {
      return {
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
