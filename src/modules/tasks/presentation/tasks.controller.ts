import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { FilterTasksDTO } from '../dto/filter-tasks.dto'

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDTO })
  @ApiResponse({
    status: 201,
    description: 'Task created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439012',
        todolistId: '507f1f77bcf86cd799439011',
        title: 'Complete project report',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        completed: false,
        order: 0,
        priority: 3,
        description: 'Finish the quarterly report by end of day',
        imageUrl: 'https://example.com/image.jpg',
        tags: ['work', 'urgent', 'report'],
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439012',
          todolistId: '507f1f77bcf86cd799439011',
          title: 'Complete project report',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          completed: false,
          order: 0,
          priority: 3,
          description: 'Finish the quarterly report by end of day',
          imageUrl: 'https://example.com/image.jpg',
          tags: ['work', 'urgent', 'report'],
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAll(
    @Param('todolistId') todolistId: string,
    @CurrentUserId() userId: string,
    @Query() filters: FilterTasksDTO,
  ) {
    return await this.tasksService.getAllTodolistTasks(
      userId,
      todolistId,
      filters,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439012',
        todolistId: '507f1f77bcf86cd799439011',
        title: 'Complete project report',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        completed: false,
        order: 0,
        priority: 3,
        description: 'Finish the quarterly report by end of day',
        imageUrl: 'https://example.com/image.jpg',
        tags: ['work', 'urgent', 'report'],
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getById(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.getTaskById(userId, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDTO })
  @ApiResponse({
    status: 200,
    description: 'Task updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439012',
        todolistId: '507f1f77bcf86cd799439011',
        title: 'Updated project report',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        completed: true,
        order: 0,
        priority: 5,
        description: 'Updated description for the report',
        imageUrl: 'https://example.com/updated-image.jpg',
        tags: ['work', 'updated', 'report'],
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'Task deleted',
    schema: { example: { message: 'Task deleted successfully' } },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.tasksService.deleteTask(userId, id)
  }
}
