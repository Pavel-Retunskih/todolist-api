import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TodolistsService } from '../servise/todolists.service'
import { type CreateTodoDTO, UpdateTodoDTO } from '../dto/CreateTodoDTO'
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator'

@Controller('todolists')
export class TodolistsController {
  constructor(private readonly todolistService: TodolistsService) {}

  @Post('create-todolist')
  @UseGuards(JwtAuthGuard)
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

  @Post('update-todolist/:id')
  @UseGuards(JwtAuthGuard)
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

  @Post('delete-todolist/:id')
  @UseGuards(JwtAuthGuard)
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
