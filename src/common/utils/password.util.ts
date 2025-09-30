import * as bcrypt from 'bcrypt';

/**
 * Утилиты для работы с паролями
 * Изучаем bcrypt для безопасного хеширования паролей
 */
export class PasswordUtil {
  /**
   * Количество rounds для bcrypt
   * Чем больше rounds, тем медленнее хеширование, но безопаснее
   * 12 - хороший баланс между скоростью и безопасностью
   */
  private static readonly SALT_ROUNDS = 12;

  /**
   * Хеширование пароля
   * @param plainTextPassword - пароль в открытом виде
   * @returns Promise с хешированным паролем
   */
  static async hashPassword(plainTextPassword: string): Promise<string> {
    try {
      // bcrypt.hash автоматически генерирует salt и хеширует пароль
      const hashedPassword = await bcrypt.hash(
        plainTextPassword,
        this.SALT_ROUNDS,
      );
      return hashedPassword;
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  /**
   * Проверка пароля
   * @param plainTextPassword - пароль в открытом виде
   * @param hashedPassword - хешированный пароль из БД
   * @returns Promise<boolean> - true если пароль совпадает
   */
  static async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      // bcrypt.compare автоматически извлекает salt из хеша и сравнивает
      const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }

  /**
   * Проверка силы пароля
   * Бизнес-правила для валидации пароля
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Минимум 8 символов
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Максимум 128 символов (защита от DoS атак)
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Должна быть минимум одна цифра
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Должна быть минимум одна строчная буква
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Должна быть минимум одна заглавная буква
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Не должен содержать только пробелы
    if (password.trim().length === 0) {
      errors.push('Password cannot be only whitespace');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Генерация случайного пароля (для тестирования)
   */
  static generateRandomPassword(length: number = 12): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
