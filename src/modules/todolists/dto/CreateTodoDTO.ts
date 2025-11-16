import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTodoDTO {
  @ApiProperty({
    example: 'Groceries',
    minLength: 3,
    maxLength: 50,
    description: 'Todolist title',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    nullable: true,
    description: 'Optional cover image URL',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @ApiPropertyOptional({
    example: 'Buy milk and bread',
    nullable: true,
    minLength: 5,
    maxLength: 500,
    description: 'Optional description',
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  description: string | null
}

export class UpdateTodoDTO {
  @ApiProperty({
    example: 'Groceries (updated)',
    minLength: 3,
    maxLength: 50,
    description: 'Updated title',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    nullable: true,
    description: 'Updated cover image URL',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @ApiPropertyOptional({
    example: 'Buy milk and bread (updated)',
    nullable: true,
    minLength: 5,
    maxLength: 500,
    description: 'Updated description',
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  description: string | null
}
