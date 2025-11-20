import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateTaskDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title?: string

  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  description?: string

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number
}
