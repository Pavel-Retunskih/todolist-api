import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  UserDocument,
  UserSchema,
} from '../../modules/users/infrastructure/user.schema';

/**
 * Payload JWT токена
 * Содержит только необходимые данные для идентификации пользователя
 */
export interface JwtPayload {
  sub: string; // subject - обычно ID пользователя (стандарт JWT)
  email: string;
  iat?: number; // issued at - время создания токена
  exp?: number; // expiration time - время истечения токена
}

/**
 * JWT Strategy для Passport
 * Автоматически валидирует JWT токены из заголовков Authorization: Bearer <token>
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    const jwtSecret: string | undefined = configService.get('jwt');
    if (!jwtSecret) {
      throw new Error('JWT secret not found in environment variables');
    }
    super({
      // Извлекаем JWT токен из Authorization заголовка как Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Не игнорируем истекшие токены (по умолчанию false)
      ignoreExpiration: false,

      // Секрет для верификации токена
      secretOrKey: jwtSecret,

      // Дополнительные опции
      jsonWebTokenOptions: {
        // Проверять аудиторию (можно настроить для разных клиентов)
        // audience: 'todolist-app',
        // issuer: 'todolist-api',
      },
    });
  }

  /**
   * Валидация JWT payload
   * Вызывается автоматически после успешной верификации токена
   * Результат этой функции будет доступен в req.user
   */
  async validate(payload: JwtPayload): Promise<Partial<UserDocument> | void> {
    const { sub: userId } = payload;

    // Проверяем, существует ли пользователь в БД
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      // Токен валидный, но пользователь не найден (например, был удален)
      throw new UnauthorizedException('User not found');
    }

    // Возвращаем пользователя без пароля
    // Это значение будет доступно как req.user в контроллерах
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Дополнительная проверка токена (опционально)
   * Можно переопределить для кастомной логики валидации
   */
  // authenticate(req: any, options?: any) {
  //   // Кастомная логика аутентификации
  //   return super.authenticate(req, options);
  // }
}
