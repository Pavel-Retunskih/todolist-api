import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { TasksService } from '../servise/tasks.service'
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { CreateTaskDTO } from '../dto/create-task.dto'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('add-task')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    createTaskDTO: CreateTaskDTO,
  ) {
    return await this.tasksService.createTask(createTaskDTO)
  }
}
