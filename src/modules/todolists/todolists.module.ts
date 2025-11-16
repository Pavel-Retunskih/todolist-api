import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TodolistSchema,
  TodolistSchemaFactory,
} from './infrastructure/todolist.schema'
import { TodolistsService } from './servise/todolists.service'
import { TodolistsController } from './presentation/todolists.controller'
import { TodolistMongoRepository } from './infrastructure/todolist-mongodb.repository'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TodolistSchema.name, schema: TodolistSchemaFactory },
    ]),
  ],
  providers: [
    TodolistsService,
    {
      provide: 'TodolistsRepository',
      useClass: TodolistMongoRepository,
    },
    JwtAuthGuard,
  ],
  controllers: [TodolistsController],
})
export class TodolistsModule {}
