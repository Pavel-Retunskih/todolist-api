import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDTO {
  @ApiProperty({
    description: 'Task title',
    minLength: 3,
    maxLength: 50,
    example: 'Complete project report',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @ApiProperty({
    description: 'Todolist ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  todolistId: string

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @ApiPropertyOptional({
    description: 'Task description',
    minLength: 3,
    maxLength: 200,
    example: 'Finish the quarterly report by end of day',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  description: string | null

  @ApiPropertyOptional({
    description: 'Task tags',
    type: [String],
    example: ['work', 'urgent', 'report'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[] | null

  @ApiPropertyOptional({
    description: 'Due date in ISO format',
    example: '2025-01-31T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null
}
