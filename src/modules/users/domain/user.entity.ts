/**
 * Доменная сущность User
 * Чистая модель без зависимостей от Mongoose или других внешних библиотек
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Фабричный метод для создания нового пользователя
   */
  static create({
    email,
    passwordHash,
  }: {
    email: string;
    passwordHash: string;
  }): Omit<User, 'id'> {
    const now = new Date();
    return {
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    } as Omit<User, 'id'>;
  }

  /**
   * Бизнес-правило: проверка валидности email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Метод для обновления пользователя
   */
  update(updates: Partial<Pick<User, 'email' | 'passwordHash'>>): User {
    return new User(
      this.id,
      updates.email ?? this.email,
      updates.passwordHash ?? this.passwordHash,
      this.createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Преобразование в DTO без чувствительных данных
   */
  toPublicData() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
