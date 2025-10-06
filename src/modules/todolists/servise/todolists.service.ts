import { Inject, Injectable } from '@nestjs/common'
import { type TodolistRepository } from '../domain/todolist.repository'
import { TodolistEntity } from '../domain/todolist.entity'
import { CreateTodoDTO, UpdateTodoDTO } from '../dto/CreateTodoDTO'
import { ConfigService } from '@nestjs/config'
import { TooManyTodolistsException } from '../domain/too-many-todolists-error.domain'

@Injectable()
export class TodolistsService {
  constructor(
    @Inject('TodolistsRepository')
    private readonly todoistsRepository: TodolistRepository,
    private readonly configService: ConfigService,
  ) {}

  async createTododlist(
    { title, description, imageUrl }: CreateTodoDTO,
    ownerId: string,
  ): Promise<TodolistEntity> {
    const todolistsCount =
      await this.todoistsRepository.getTodolistsCountByOwnerId(ownerId)
    const maxPerUser = this.configService.getOrThrow<number>(
      'todolists.maxPerUser',
    )
    if (todolistsCount >= maxPerUser) {
      throw new TooManyTodolistsException(
        `You has reached the maximum number of todolists (${maxPerUser}).`,
      )
    }
    return await this.todoistsRepository.createTodolist({
      ownerId,
      title,
      description: description ? description : null,
      imageUrl: imageUrl ? imageUrl : null,
    })
  }

  async updateTodolist(
    patchData: UpdateTodoDTO,
    todoId: string,
  ): Promise<TodolistEntity> {
    const updatedTodolist = await this.todoistsRepository.updateTodolist(
      todoId,
      patchData,
    )
    if (!updatedTodolist) {
      throw new Error('Todolist not found')
    }
    return updatedTodolist
  }

  async deleteTodolist(todoId: string): Promise<TodolistEntity | null> {
    return await this.todoistsRepository.deleteTodolist(todoId)
  }

  async getTodolistById(todoId: string): Promise<TodolistEntity | null> {
    return await this.todoistsRepository.getTodolistById(todoId)
  }

  async getAllByOwnerId(ownerId: string): Promise<TodolistEntity[]> {
    return await this.todoistsRepository.getAllByOwnerId(ownerId)
  }
}
