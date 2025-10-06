import { type TodolistEntity } from './todolist.entity'

export interface CreateTodolistArgs {
  ownerId: string
  title: string
  imageUrl: string | null
  description: string | null
}

export interface UpdateTodolistPatch {
  title?: string
  imageUrl: string | null
  description: string | null
}

export interface TodolistRepository {
  createTodolist(createData: CreateTodolistArgs): Promise<TodolistEntity>

  updateTodolist(
    id: string,
    patch: UpdateTodolistPatch,
  ): Promise<TodolistEntity | null>

  deleteTodolist(id: string): Promise<TodolistEntity | null>

  getTodolistById(id: string): Promise<TodolistEntity | null>

  getAllByOwnerId(ownerId: string): Promise<TodolistEntity[]>

  getTodolistsCountByOwnerId(ownerId: string): Promise<number>
}
