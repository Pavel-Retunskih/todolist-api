import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './presentation/users.controller';
import { UserSchema, UserSchemaFactory } from './infrastructure/user.schema';
import { UserMongodbRepository } from './infrastructure/user-mongodb.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserSchema.name,
        schema: UserSchemaFactory,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserMongodbRepository,
    },
  ],
  exports: ['UserRepository', MongooseModule],
})
export class UsersModule {}
