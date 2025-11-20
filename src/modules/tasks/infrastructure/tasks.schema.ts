import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TaskEntity } from '../domain/task.entity'
import mongoose, { HydratedDocument } from 'mongoose'
import { TodolistSchema } from '../../todolists/infrastructure/todolist.schema'

export type TaskDocument = HydratedDocument<TaskSchema>

@Schema({
  collection: 'tasks',
  timestamps: true,
  versionKey: false,
})
export class TaskSchema implements TaskEntity {
  id: string
  @Prop({
    required: [true, 'todolist id is required'],
    type: mongoose.Schema.Types.ObjectId,
    ref: TodolistSchema.name,
    index: true,
  })
  todolistId: string

  @Prop({
    required: [true, 'title is required'],
    type: String,
    trim: true,
    maxLength: 50,
    minlength: 3,
  })
  title: string

  @Prop({
    required: false,
    type: String,
    trim: true,
    maxLength: 200,
    minlength: 3,
  })
  description?: string

  @Prop({ default: false })
  completed: boolean

  @Prop({ default: 0 })
  order: number

  @Prop({ default: 0 })
  priority: number

  @Prop({ type: [String] })
  tags?: string[]

  @Prop({ required: false })
  imageUrl?: string

  createdAt: Date
  updatedAt: Date
}

export const TaskSchemaFactory = SchemaFactory.createForClass(TaskSchema)

TaskSchemaFactory.virtual('id').get(function () {
  return this._id.toHexString()
})
TaskSchemaFactory.index({ todolistId: 1 })
