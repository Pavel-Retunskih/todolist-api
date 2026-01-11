import {
  CreateTaskArgs,
  TasksRepository,
  UpdateTaskArgs,
} from '../domain/tasks.repository'
import { TaskEntity } from '../domain/task.entity'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { TaskDocument, TaskSchema } from './tasks.schema'
import { Model } from 'mongoose'

@Injectable()
export class TasksMongodbRepository implements TasksRepository {
  constructor(
    @InjectModel(TaskSchema.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async createTask(createData: CreateTaskArgs): Promise<TaskEntity> {
    const maxOrderTask = await this.taskModel
      .findOne({ todolistId: createData.todolistId })
      .sort({ order: -1 })
      .exec()
    const nextOrder = maxOrderTask ? maxOrderTask.order + 1 : 0
    const newTask = new this.taskModel({
      title: createData.title,
      todolistId: createData.todolistId,
      imageUrl: createData.imageUrl,
      description: createData.description,
      tags: createData.tags,
      dueDate: createData.dueDate,
      completed: false,
      order: nextOrder,
    })
    const createdTask = await newTask.save()
    return createdTask.toObject()
  }

  async updateTask(
    id: string,
    patch: UpdateTaskArgs,
  ): Promise<TaskEntity | null> {
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    )
    return updatedTask ? updatedTask.toObject() : null
  }

  async getTaskById(id: string): Promise<TaskEntity | null> {
    const task = await this.taskModel.findById(id).exec()
    return task ? task.toObject() : null
  }

  async deleteTask(id: string): Promise<TaskEntity | null> {
    const deletedTask = await this.taskModel.findByIdAndDelete(id).exec()
    return deletedTask ? deletedTask.toObject() : null
  }

  async getAllTodolistTasks(todolistId: string): Promise<TaskEntity[]> {
    const tasks = await this.taskModel
      .find({ todolistId })
      .sort({ order: 1 })
      .exec()
    return tasks.map((task) => task.toObject())
  }
}
