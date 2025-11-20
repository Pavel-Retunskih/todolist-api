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

  async createTask(
    userId: string,
    { title, tags, description, imageUrl, todolistId }: CreateTaskDTO,
  ): Promise<TaskEntity> {
    const todolist = await this.todolistsRepository.getTodolistById(todolistId)
    if (!todolist || todolist.ownerId !== userId) {
      throw new ForbiddenException('You do not own this todolist')
    }

    return await this.taskRepository.createTask({
      title,
      tags: tags ?? null,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      todolistId,
    } as CreateTaskArgs)
  }

  async getAllTodolistTasks(
    userId: string,
    todolistId: string,
  ): Promise<TaskEntity[]> {
    const todolist = await this.todolistsRepository.getTodolistById(todolistId)
    if (!todolist || todolist.ownerId !== userId) {
      throw new ForbiddenException('You do not own this todolist')
    }

    return await this.taskRepository.getAllTodolistTasks(todolistId)
  }

  async getTaskById(userId: string, id: string): Promise<TaskEntity | null> {
    const task = await this.taskRepository.getTaskById(id)
    if (!task) return null

    const todolist = await this.todolistsRepository.getTodolistById(
      task.todolistId,
    )
    if (!todolist || todolist.ownerId !== userId) {
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
    if (!todolist || todolist.ownerId !== userId) {
      throw new ForbiddenException('You do not own this task')
    }

    const patch: UpdateTaskArgs = {
      title: updateData.title,
      description: updateData.description,
      imageUrl: updateData.imageUrl,
      tags: updateData.tags,
      completed: updateData.completed,
      order: updateData.order,
      priority: updateData.priority,
    }

    return await this.taskRepository.updateTask(id, patch)
  }

  async deleteTask(userId: string, id: string): Promise<TaskEntity | null> {
    const task = await this.taskRepository.getTaskById(id)
    if (!task) return null

    const todolist = await this.todolistsRepository.getTodolistById(
      task.todolistId,
    )
    if (!todolist || todolist.ownerId !== userId) {
      throw new ForbiddenException('You do not own this task')
    }

    return await this.taskRepository.deleteTask(id)
  }
}
