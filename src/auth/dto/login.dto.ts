import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail(undefined, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 characters)' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
