import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './presentation/users.controller';
import { UserSchema, UserSchemaFactory } from './infrastructure/user.schema';

@Module({
  imports: [
    // Регистрируем Mongoose схему для этого модуля
    MongooseModule.forFeature([
      {
        name: UserSchema.name, // 'UserSchema'
        schema: UserSchemaFactory, // Скомпилированная схема
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    // TODO: Добавим сервисы и репозитории позже
  ],
  exports: [
    // Экспортируем MongooseModule, чтобы другие модули могли использовать UserModel
    MongooseModule,
  ],
})
export class UsersModule {}
