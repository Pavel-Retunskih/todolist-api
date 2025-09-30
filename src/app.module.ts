import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  mailConfig,
  storageConfig,
  throttleConfig,
} from './config/configuration';

@Module({
  imports: [
    // Конфигурация должна быть первой!
    ConfigModule.forRoot({
      isGlobal: true, // Делает ConfigModule доступным глобально
      envFilePath: '.env', // Путь к .env файлу
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        storageConfig,
        throttleConfig,
      ],
    }),

    // Async конфигурация MongoDB с использованием ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
        dbName: configService.get<string>('database.name'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
