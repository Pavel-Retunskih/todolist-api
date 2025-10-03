import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  password: string;
}
