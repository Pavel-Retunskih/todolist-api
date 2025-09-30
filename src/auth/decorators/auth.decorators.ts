import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard';

/**
 * Декоратор для пометки маршрутов как публичных
 * Маршруты с этим декоратором не требуют JWT токена
 *
 * Использование:
 * @Public()
 * @Post('login')
 * async login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Декоратор для получения текущего аутентифицированного пользователя
 * Извлекает пользователя из req.user (который был установлен JWT Strategy)
 *
 * Использование:
 * @Get('profile')
 * async getProfile(@CurrentUser() user: any) {
 *   return user;
 * }
 *
 * Или получить конкретное поле:
 * @Get('profile')
 * async getProfile(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Если указано конкретное поле, возвращаем его
    return data ? user?.[data] : user;
  },
);

/**
 * Интерфейс для типизации текущего пользователя
 * Используется с декоратором @CurrentUser()
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Типизированный декоратор для получения текущего пользователя
 * Альтернатива CurrentUser с строгой типизацией
 *
 * Использование:
 * @Get('profile')
 * async getProfile(@User() user: AuthenticatedUser) {
 *   return user;
 * }
 */
export const User = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
