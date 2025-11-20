import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TasksService } from '../service/tasks.service'
import { CreateTaskDTO } from '../dto/create-task.dto'
import { UpdateTaskDTO } from '../dto/update-task.dto'
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator'

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDTO })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createTaskDTO: CreateTaskDTO,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.createTask(userId, createTaskDTO)
  }

  @Get(':todolistId')
  @ApiOperation({ summary: 'Get all tasks for a todolist' })
  @ApiParam({ name: 'todolistId', description: 'Todolist ID' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAll(
    @Param('todolistId') todolistId: string,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.getAllTodolistTasks(userId, todolistId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getById(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.getTaskById(userId, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDTO })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDTO: UpdateTaskDTO,
    @CurrentUserId() userId: string,
  ) {
    return await this.tasksService.updateTask(userId, id, updateTaskDTO)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.deleteTask(userId, id)
  }
}
