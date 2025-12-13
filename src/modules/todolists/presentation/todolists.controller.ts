import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'

import { type CreateTodoDTO, UpdateTodoDTO } from '../dto/CreateTodoDTO'
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator'
import { TodolistsService } from '../service/todolists.service'

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
      ownerId: todo.ownerId,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }
  }

  @Post('update-todolist/:id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
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
      ownerId: todo.ownerId,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }
  }

  @Put('update-todolist/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Body()
    updateTodolistDto: UpdateTodoDTO,
    @Param('id')
    todoId: string,
  ) {
    return this.updatePost(updateTodolistDto, todoId)
  }

  @Post('delete-todolist/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') todoId: string) {
    const todo = await this.todolistService.deleteTodolist(todoId)
    return {
      id: todo?.id,
      ownerId: todo?.ownerId,
      title: todo?.title,
      imageUrl: todo?.imageUrl,
      description: todo?.description,
      createdAt: todo?.createdAt,
      updatedAt: todo?.updatedAt,
    }
  }

  @Delete('delete-todolist/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') todoId: string) {
    return this.deletePost(todoId)
  }

  @Get('get-todolist/:id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') todoId: string) {
    const todo = await this.todolistService.getTodolistById(todoId)
    return {
      id: todo?.id,
      ownerId: todo?.ownerId,
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
      ownerId: todo.ownerId,
      title: todo.title,
      imageUrl: todo.imageUrl,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }))
  }
}
