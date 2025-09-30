import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Устанавливаем глобальный префикс для всех API маршрутов
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 5000);

  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 5000}/api/v1`,
  );
}
bootstrap();
