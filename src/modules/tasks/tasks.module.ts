import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema, TaskSchemaFactory } from './infrastructure/tasks.schema'
import { TasksController } from './pressentation/tasks.controller'
import { TasksService } from './servise/tasks.service'
import { TasksMongodbRepository } from './infrastructure/tasks-mongodb.repository'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskSchema.name, schema: TaskSchemaFactory },
    ]),
  ],
  providers: [
    TasksService,
    {
      provide: 'TasksRepository',
      useClass: TasksMongodbRepository,
    },
    JwtAuthGuard,
  ],
  controllers: [TasksController],
})
export class TasksModule {}
