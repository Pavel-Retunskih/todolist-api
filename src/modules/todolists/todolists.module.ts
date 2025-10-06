import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TodolistSchema } from './infrastructure/todolist.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TodolistSchema.name, schema: TodolistSchema },
    ]),
  ],
})
export class TodolistsModule {}
