import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Mongoose Document тип для User
 */
export type UserDocument = HydratedDocument<UserSchema>;

/**
 * Mongoose схема для пользователя.
 * Определяет структуру данных в MongoDB
 */
@Schema({
  collection: 'users', // Название коллекции в MongoDB
  timestamps: true, // Автоматически добавляет createdAt и updatedAt
  versionKey: false, // Отключает __v поле
})
export class UserSchema {
  /**
   * Email пользователя
   * Уникальный, обязательный, с валидацией
   */
  @Prop({
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Автоматически приводит к нижнему регистру
    trim: true, // Убирает пробелы
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    index: true, // Создает индекс для быстрого поиска
  })
  email: string;

  /**
   * Хеш пароля
   * Никогда не возвращается в API
   */
  @Prop({
    type: String,
    required: [true, 'Password hash is required'],
    select: false, // По умолчанию не включается в результаты запросов
  })
  passwordHash: string;

  /**
   * Timestamps автоматически добавляются Mongoose при timestamps: true
   * Но мы можем их явно объявить для типизации
   */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Фабрика схемы Mongoose
 */
export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);

/**
 * Индексы и middleware для схемы
 */
UserSchemaFactory.index({ email: 1 }, { unique: true });

// Pre-save middleware пример (можно использовать для дополнительной валидации)
UserSchemaFactory.pre('save', function (next) {
  // Дополнительная бизнес-логика перед сохранением
  console.log(`Saving user: ${this.email}`);
  next();
});

// Пример виртуального поля
UserSchemaFactory.virtual('id').get(function () {
  return this._id.toHexString();
});

// Настройка JSON сериализация
UserSchemaFactory.set('toJSON', {
  virtuals: true,
  transform: (_, ret: Partial<UserDocument>) => {
    delete ret._id;
    delete ret.passwordHash; // Никогда не возвращаем пароль в JSON
    return ret;
  },
});
