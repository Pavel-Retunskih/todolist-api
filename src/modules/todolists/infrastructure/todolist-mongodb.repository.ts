import { Model } from 'mongoose'
import {
  CreateTodolistArgs,
  TodolistRepository,
  UpdateTodolistPatch,
} from '../domain/todolist.repository'
import { InjectModel } from '@nestjs/mongoose'
import { TodolistDocument, TodolistSchema } from './todolist.schema'
import { Injectable } from '@nestjs/common'
import { TodolistEntity } from '../domain/todolist.entity'

@Injectable()
export class TodolistMongoRepository implements TodolistRepository {
  constructor(
    @InjectModel(TodolistSchema.name)
    private readonly todolistModel: Model<TodolistDocument>,
  ) {}

  async createTodolist(
    createData: CreateTodolistArgs,
  ): Promise<TodolistEntity> {
    const todolist = new this.todolistModel({
      ownerId: createData.ownerId,
      title: createData.title,
      imageUrl: createData.imageUrl,
      description: createData.description,
    })
    const createdTodolist = await todolist.save()
    return createdTodolist.toObject()
  }

  async updateTodolist(
    id: string,
    patch: UpdateTodolistPatch,
  ): Promise<TodolistEntity | null> {
    const updatedTodolist = await this.todolistModel
      .findByIdAndUpdate(
        id,
        { $set: patch },
        { new: true, runValidators: true },
      )
      .exec()

    return updatedTodolist ? updatedTodolist.toObject() : null
  }

  async deleteTodolist(id: string): Promise<TodolistEntity | null> {
    const deletedTodolist = await this.todolistModel.findByIdAndDelete(id)
    return deletedTodolist ? deletedTodolist : null
  }

  async getTodolistById(id: string): Promise<TodolistEntity | null> {
    const todolist = await this.todolistModel.findById(id).exec()
    return todolist ? todolist.toObject() : null
  }

  async getAllByOwnerId(ownerId: string): Promise<TodolistEntity[]> {
    const todolists = await this.todolistModel
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .exec()
    return todolists.map((todolist) => todolist.toObject())
  }

  async getTodolistsCountByOwnerId(ownerId: string): Promise<number> {
    return this.todolistModel.countDocuments({ ownerId }).exec()
  }
}
