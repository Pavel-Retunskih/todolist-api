import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { UsersModule } from '../modules/users/users.module'
import { TokenService } from './services/token.service'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtService } from '@nestjs/jwt'
import { SessionsModule } from '../modules/sessions/sessions.module'

@Module({
  controllers: [AuthController],
  imports: [UsersModule, SessionsModule],
  providers: [TokenService, AuthService, JwtStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
