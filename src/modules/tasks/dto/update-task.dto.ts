import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateTaskDTO {
  @ApiPropertyOptional({
    description: 'Task title',
    minLength: 3,
    maxLength: 50,
    example: 'Updated project report',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title?: string

  @ApiPropertyOptional({
    description: 'Task description',
    minLength: 3,
    maxLength: 200,
    example: 'Updated description for the report',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  description?: string | null

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://example.com/updated-image.jpg',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl?: string | null

  @ApiPropertyOptional({
    description: 'Task tags',
    type: [String],
    example: ['work', 'updated', 'report'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null

  @ApiPropertyOptional({ description: 'Task completed status', example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @ApiPropertyOptional({ description: 'Task order', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number

  @ApiPropertyOptional({ description: 'Task priority', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number

  @ApiPropertyOptional({
    description: 'Due date in ISO format',
    example: '2025-01-31T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null
}
