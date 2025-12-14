import { TaskEntity } from './task.entity'

export interface CreateTaskArgs {
  title: string
  todolistId: string
  imageUrl: string | null
  description: string | null
  tags: string[] | null
  dueDate?: Date | null
}

export interface UpdateTaskArgs {
  title?: string
  imageUrl?: string | null
  description?: string | null
  tags?: string[] | null
  completed?: boolean
  order?: number
  priority?: number
  dueDate?: Date | null
}

export interface TasksRepository {
  createTask(createData: CreateTaskArgs): Promise<TaskEntity>

  updateTask(id: string, patch: UpdateTaskArgs): Promise<TaskEntity | null>

  deleteTask(id: string): Promise<TaskEntity | null>

  getAllTodolistTasks(todolistId: string): Promise<TaskEntity[]>

  getTaskById(id: string): Promise<TaskEntity | null>
}
