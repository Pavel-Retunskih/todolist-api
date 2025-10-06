import { type TodolistEntity } from './todolist.entity'

export interface CreateTodolistArgs {
  ownerId: string
  title: string
  imageUrl?: string
  description?: string
}

export interface UpdateTodolistPatch {
  title?: string
  imageUrl?: string
  description?: string
}

export interface TodolistRepository {
  createTodolist(createData: CreateTodolistArgs): Promise<TodolistEntity>

  updateTodolist(
    id: string,
    patch: UpdateTodolistPatch,
  ): Promise<TodolistEntity | null>

  deleteTodolist(id: string): Promise<void>

  getByTodolistId(id: string): Promise<TodolistEntity | null>

  getAllByOwnerId(ownerId: string): Promise<TodolistEntity[]>
}
