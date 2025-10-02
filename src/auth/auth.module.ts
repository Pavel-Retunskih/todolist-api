import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../modules/users/users.module';
import { TokenService } from './services/token.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [UsersModule],
  providers: [TokenService, AuthService, JwtStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
