import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema, TaskSchemaFactory } from './infrastructure/tasks.schema'
import { TasksController } from './presentation/tasks.controller'
import { TasksService } from './service/tasks.service'
import { TasksMongodbRepository } from './infrastructure/tasks-mongodb.repository'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { APP_GUARD } from '@nestjs/core'
import { TodolistsModule } from '../todolists/todolists.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskSchema.name, schema: TaskSchemaFactory },
    ]),
    TodolistsModule,
  ],
  providers: [
    TasksService,
    {
      provide: 'TasksRepository',
      useClass: TasksMongodbRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [TasksController],
})
export class TasksModule {}
