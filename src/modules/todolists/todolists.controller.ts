import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { TodolistsService } from './servise/todolists.service'
import { CreateTodoDTO, UpdateTodoDTO } from './dto/CreateTodoDTO'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

@ApiTags('Todolists')
@ApiBearerAuth('bearer')
@ApiSecurity('apiKey')
@Controller('todolists')
export class TodolistsController {
  constructor(private readonly todolistService: TodolistsService) {}

  @Post('create-todolist')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new todolist' })
  @ApiBody({ type: CreateTodoDTO })
  @ApiCreatedResponse({
    description: 'Todolist created',
    schema: {
      example: {
        id: '665f1d2c9f1b2c0012345678',
        title: 'Groceries',
        imageUrl: 'https://example.com/image.png',
        description: 'Buy milk and bread',
        createdAt: '2024-05-01T12:00:00.000Z',
        updatedAt: '2024-05-01T12:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no active session' })
  async create(
    @CurrentUserId()
    ownerId: string,
    @Body()
    createTodolistDto: CreateTodoDTO,
  ) {
    const todo = await this.todolistService.createTododlist(
      createTodolistDto,
      ownerId,
    )
    return {
      id: todo.id,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }
  }

  @Patch('update-todolist/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update existing todolist' })
  @ApiParam({ name: 'id', description: 'Todolist ID' })
  @ApiBody({ type: UpdateTodoDTO })
  @ApiOkResponse({
    description: 'Todolist updated',
    schema: {
      example: {
        id: '665f1d2c9f1b2c0012345678',
        title: 'Groceries (updated)',
        imageUrl: 'https://example.com/image.png',
        description: 'Buy milk and bread',
        createdAt: '2024-05-01T12:00:00.000Z',
        updatedAt: '2024-05-02T12:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no active session' })
  async update(
    @Body()
    updateTodolistDto: UpdateTodoDTO,
    @Param('id')
    todoId: string,
  ) {
    const todo = await this.todolistService.updateTodolist(
      updateTodolistDto,
      todoId,
    )
    return {
      id: todo.id,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }
  }

  @Delete('delete-todolist/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete todolist' })
  @ApiParam({ name: 'id', description: 'Todolist ID' })
  @ApiOkResponse({
    description: 'Todolist deleted',
    schema: {
      example: {
        id: '665f1d2c9f1b2c0012345678',
        title: 'Groceries',
        imageUrl: 'https://example.com/image.png',
        description: 'Buy milk and bread',
        createdAt: '2024-05-01T12:00:00.000Z',
        updatedAt: '2024-05-01T12:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no active session' })
  async delete(@Param('id') todoId: string) {
    const todo = await this.todolistService.deleteTodolist(todoId)
    return {
      id: todo?.id,
      title: todo?.title,
      imageUrl: todo?.imageUrl,
      description: todo?.description,
      createdAt: todo?.createdAt,
      updatedAt: todo?.updatedAt,
    }
  }

  @Get('get-todolist/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get todolist by ID' })
  @ApiParam({ name: 'id', description: 'Todolist ID' })
  @ApiOkResponse({
    description: 'Single todolist',
    schema: {
      example: {
        id: '665f1d2c9f1b2c0012345678',
        title: 'Groceries',
        imageUrl: 'https://example.com/image.png',
        description: 'Buy milk and bread',
        createdAt: '2024-05-01T12:00:00.000Z',
        updatedAt: '2024-05-01T12:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no active session' })
  async getById(@Param('id') todoId: string) {
    const todo = await this.todolistService.getTodolistById(todoId)
    return {
      id: todo?.id,
      title: todo?.title,
      imageUrl: todo?.imageUrl,
      description: todo?.description,
      createdAt: todo?.createdAt,
      updatedAt: todo?.updatedAt,
    }
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all todolists for current user' })
  @ApiOkResponse({
    description: 'List of todolists',
    schema: {
      type: 'array',
      items: {
        example: {
          id: '665f1d2c9f1b2c0012345678',
          title: 'Groceries',
          imageUrl: 'https://example.com/image.png',
          description: 'Buy milk and bread',
          createdAt: '2024-05-01T12:00:00.000Z',
          updatedAt: '2024-05-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no active session' })
  async getAllByOwnerId(@CurrentUserId() ownerId: string) {
    const todos = await this.todolistService.getAllByOwnerId(ownerId)
    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }))
  }
}
