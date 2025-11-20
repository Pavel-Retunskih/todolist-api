import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TodolistSchema,
  TodolistSchemaFactory,
} from './infrastructure/todolist.schema'
import { TodolistsService } from './service/todolists.service'
import { TodolistsController } from './presentation/todolists.controller'
import { TodolistMongoRepository } from './infrastructure/todolist-mongodb.repository'

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
  ],
  controllers: [TodolistsController],
  exports: ['TodolistsRepository'],
})
export class TodolistsModule {}
