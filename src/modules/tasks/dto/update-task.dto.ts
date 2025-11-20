import {
  IsArray,
  IsBoolean,
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
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  description?: string

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl?: string

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: 'Task completed status' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @ApiPropertyOptional({ description: 'Task order' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number

  @ApiPropertyOptional({ description: 'Task priority' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number
}
