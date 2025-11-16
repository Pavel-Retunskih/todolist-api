import { Inject, Injectable } from '@nestjs/common'
import { type TasksRepository } from '../domain/tasks.repository'
import { CreateTaskDTO } from '../dto/create-task.dto'
import { TaskEntity } from '../domain/task.entity'

@Injectable()
export class TasksService {
  constructor(
    @Inject('TasksRepository')
    private readonly taskRepository: TasksRepository,
  ) {}

  async createTask({
    title,
    tags,
    description,
    imageUrl,
    todolistId,
  }: CreateTaskDTO): Promise<TaskEntity> {
    return await this.taskRepository.createTask({
      title,
      tags: tags ? tags : null,
      description: description ? description : null,
      imageUrl: imageUrl ? imageUrl : null,
      todolistId,
    })
  }
}
