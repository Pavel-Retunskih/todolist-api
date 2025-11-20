import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { TasksService } from '../service/tasks.service'
import { CreateTaskDTO } from '../dto/create-task.dto'
import { UpdateTaskDTO } from '../dto/update-task.dto'
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDTO: CreateTaskDTO,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.createTask(userId, createTaskDTO)
  }

  @Get(':todolistId')
  async getAll(
    @Param('todolistId') todolistId: string,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.getAllTodolistTasks(userId, todolistId)
  }

  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.getTaskById(userId, id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDTO: UpdateTaskDTO,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.updateTask(userId, id, updateTaskDTO)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.deleteTask(userId, id)
  }
}
