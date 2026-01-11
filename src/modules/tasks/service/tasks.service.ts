import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import {
  CreateTaskArgs,
  type TasksRepository,
  UpdateTaskArgs,
} from '../domain/tasks.repository'
import { type TodolistRepository } from '../../todolists/domain/todolist.repository'
import { CreateTaskDTO } from '../dto/create-task.dto'
import { UpdateTaskDTO } from '../dto/update-task.dto'
import { TaskEntity } from '../domain/task.entity'

@Injectable()
export class TasksService {
  constructor(
    @Inject('TasksRepository')
    private readonly taskRepository: TasksRepository,
    @Inject('TodolistsRepository')
    private readonly todolistsRepository: TodolistRepository,
  ) {}

  private isTodolistOwner(
    todolist: { ownerId: string },
    userId: string,
  ): boolean {
    return String(todolist.ownerId) === String(userId)
  }

  async createTask(
    userId: string,
    { title, tags, description, imageUrl, todolistId, dueDate }: CreateTaskDTO,
  ): Promise<TaskEntity> {
    const todolist = await this.todolistsRepository.getTodolistById(todolistId)
    if (!todolist || !this.isTodolistOwner(todolist, userId)) {
      throw new ForbiddenException('You do not own this todolist')
    }

    return await this.taskRepository.createTask({
      title,
      tags: tags ?? null,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      todolistId,
      dueDate: dueDate ? new Date(dueDate) : null,
    } as CreateTaskArgs)
  }

  async getAllTodolistTasks(
    userId: string,
    todolistId: string,
    filters?: { minPriority?: number; dueInDays?: number },
  ): Promise<TaskEntity[]> {
    const todolist = await this.todolistsRepository.getTodolistById(todolistId)
    if (!todolist || !this.isTodolistOwner(todolist, userId)) {
      throw new ForbiddenException('You do not own this todolist')
    }

    let tasks = await this.taskRepository.getAllTodolistTasks(todolistId)

    if (filters) {
      const { minPriority, dueInDays } = filters

      const hasMinPriority = minPriority !== undefined
      const hasDueInDays = dueInDays !== undefined

      const threshold = hasDueInDays
        ? Date.now() + dueInDays * 24 * 60 * 60 * 1000
        : null

      if (hasMinPriority || hasDueInDays) {
        tasks = tasks.filter((task) => {
          const matchesPriority = hasMinPriority
            ? task.priority >= minPriority
            : false

          const matchesDue = hasDueInDays
            ? Boolean(task.dueDate) &&
              new Date(task.dueDate as Date).getTime() <= (threshold as number)
            : false

          return matchesPriority || matchesDue
        })
      }

      tasks.sort((a, b) => {
        const aDue = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Number.POSITIVE_INFINITY
        const bDue = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Number.POSITIVE_INFINITY
        if (aDue !== bDue) return aDue - bDue
        return b.priority - a.priority
      })
    }

    return tasks
  }

  async getTaskById(userId: string, id: string): Promise<TaskEntity | null> {
    const task = await this.taskRepository.getTaskById(id)
    if (!task) return null

    const todolist = await this.todolistsRepository.getTodolistById(
      task.todolistId,
    )
    if (!todolist || !this.isTodolistOwner(todolist, userId)) {
      throw new ForbiddenException('You do not own this task')
    }

    return task
  }

  async updateTask(
    userId: string,
    id: string,
    updateData: UpdateTaskDTO,
  ): Promise<TaskEntity | null> {
    const task = await this.taskRepository.getTaskById(id)
    if (!task) return null

    const todolist = await this.todolistsRepository.getTodolistById(
      task.todolistId,
    )
    if (!todolist || !this.isTodolistOwner(todolist, userId)) {
      throw new ForbiddenException('You do not own this task')
    }

    const patch: UpdateTaskArgs = {}

    if (updateData.title !== undefined) patch.title = updateData.title
    if (updateData.description !== undefined)
      patch.description = updateData.description
    if (updateData.imageUrl !== undefined) patch.imageUrl = updateData.imageUrl
    if (updateData.tags !== undefined) patch.tags = updateData.tags
    if (updateData.completed !== undefined)
      patch.completed = updateData.completed
    if (updateData.order !== undefined) patch.order = updateData.order
    if (updateData.priority !== undefined) patch.priority = updateData.priority
    if (updateData.dueDate !== undefined)
      patch.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null

    return await this.taskRepository.updateTask(id, patch)
  }

  async deleteTask(userId: string, id: string): Promise<TaskEntity | null> {
    const task = await this.taskRepository.getTaskById(id)
    if (!task) return null

    const todolist = await this.todolistsRepository.getTodolistById(
      task.todolistId,
    )
    if (!todolist || !this.isTodolistOwner(todolist, userId)) {
      throw new ForbiddenException('You do not own this task')
    }

    return await this.taskRepository.deleteTask(id)
  }
}
