import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'
import { Optional } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDTO {
  @ApiProperty({ description: 'Task title', minLength: 3, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @ApiProperty({ description: 'Todolist ID' })
  @IsString()
  @IsNotEmpty()
  todolistId: string

  @ApiPropertyOptional({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  @Optional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @ApiPropertyOptional({ description: 'Task description', minLength: 3, maxLength: 200 })
  @Optional()
  @MinLength(3)
  @MaxLength(200)
  description: string

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @Optional()
  @IsArray()
  tags: string[] | null
}
