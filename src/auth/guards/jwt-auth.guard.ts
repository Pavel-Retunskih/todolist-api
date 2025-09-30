import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Метаданные для публичных маршрутов
 * Используется в декораторе @Public()
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * JWT Authentication Guard
 * Защищает маршруты, требуя валидный JWT токен
 * Наследуется от AuthGuard('jwt'), который использует JwtStrategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Определяет, может ли пользователь получить доступ к маршруту
   * @param context - контекст выполнения (содержит HTTP request/response)
   * @returns Promise<boolean> или boolean
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Проверяем, является ли маршрут публичным
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // метод контроллера
      context.getClass(),   // класс контроллера
    ]);

    // Если маршрут публичный, разрешаем доступ без аутентификации
    if (isPublic) {
      return true;
    }

    // Иначе используем стандартную JWT аутентификацию
    return super.canActivate(context);
  }

  /**
   * Обработка ошибок аутентификации
   * Вызывается при неудачной аутентификации
   */
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // Если есть ошибка или пользователь не найден
    if (err || !user) {
      // Более детальная обработка различных типов ошибок JWT
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active yet');
      }
      
      // Общая ошибка
      throw err || new UnauthorizedException('Authentication failed');
    }

    // Возвращаем аутентифицированного пользователя
    return user;
  }
}