import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Устанавливаем глобальный префикс для всех API маршрутов
  app.setGlobalPrefix('api/v1');

  // Получаем Reflector из контекста приложения
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap().then(() =>
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 5000}/api/v1`,
  ),
);
