import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { UserDTO } from '../modules/users/DTO/user.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { TokenService } from './services/token.service';
import { type UserRepository } from '../modules/users/domain/user.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async register(user: UserDTO) {
    try {
      const existingUser = await this.userRepository.getUserByEmail(user.email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
      const hashedPassword = await PasswordUtil.hashPassword(user.password);

      const createdUser = await this.userRepository.createUser({
        email: user.email,
        passwordHash: hashedPassword,
      });
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          email: createdUser.email,
          sub: createdUser.id,
        });
      return { ...createdUser.toPublicData(), accessToken, refreshToken };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to register user');
    }
  }
}
