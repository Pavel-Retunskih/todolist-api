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
    if (!updatedTodolist) throw new Error('Todolist not found')
    return updatedTodolist.toObject()
  }

  async deleteTodolist(id: string): Promise<void> {
    const deletedTodolist = await this.todolistModel.findByIdAndDelete(id)
    if (!deletedTodolist) throw new Error('Todolist not found')
  }

  async getByTodolistId(id: string): Promise<TodolistEntity | null> {
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
}
