import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'
import { Optional } from '@nestjs/common'

export class CreateTaskDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @IsString()
  @IsNotEmpty()
  todolistId: string

  @Optional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @Optional()
  @MinLength(3)
  @MaxLength(100)
  description: string

  @Optional()
  @IsArray()
  tags: string[] | null
}
