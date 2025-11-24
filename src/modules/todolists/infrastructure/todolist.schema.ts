import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'
import { TodolistEntity } from '../domain/todolist.entity'
import { UserSchema } from '../../users/infrastructure/user.schema' // Твоя доменная сущность

export type TodolistDocument = HydratedDocument<TodolistSchema>

@Schema({
  collection: 'todolists',
  timestamps: true, // Автоматически добавит createdAt и updatedAt
  versionKey: false,
})
export class TodolistSchema implements TodolistEntity {
  @Prop({
    required: [true, 'Title is required'],
    type: String,
    minlength: [3, 'Title should be at least 3 characters long'],
    maxlength: [50, 'Title should not exceed 50 characters long'],
    trim: true, // Убирает пробелы по краям
  })
  title: string

  @Prop({
    nullable: true,
    required: false,
    type: String,
    trim: true,
  })
  imageUrl: string | null

  @Prop({
    required: false,
    nullable: true,
    type: String,
    minlength: [5, 'Description should be at least 5 characters long'],
    maxlength: [500, 'Description should not exceed 500 characters long'],
    trim: true,
  })
  description: string | null

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserSchema.name,
    required: [true, 'Owner is required'],
    index: true,
  })
  ownerId: string

  createdAt: Date
  updatedAt: Date
  id: string
}

// Фабрика схемы
export const TodolistSchemaFactory =
  SchemaFactory.createForClass(TodolistSchema)

// Дополнительные настройки (индексы, middleware)
TodolistSchemaFactory.index({ ownerId: 1 })
TodolistSchemaFactory.index({ title: 'text' })

// Pre-save middleware (опционально, для доп. логики)
TodolistSchemaFactory.pre('save', function (next) {
  console.log(`Saving todolist for owner: ${this.ownerId}`)
  next()
})

// Виртуальное поле для id (как в User)
TodolistSchemaFactory.virtual('id').get(function () {
  return this._id.toHexString()
})

// Настройка JSON (убираем _id и другие служебные поля)
TodolistSchemaFactory.set('toJSON', {
  virtuals: true,
  transform: (_, ret: Partial<TodolistDocument>) => {
    delete ret._id
    return ret
  },
})
