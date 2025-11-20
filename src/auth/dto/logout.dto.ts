import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDTO {
  @ApiProperty({ example: 'refresh-token-string', description: 'Refresh token to invalidate' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
