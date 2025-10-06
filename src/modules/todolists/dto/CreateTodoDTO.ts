import {
  IsString,
  MinLength,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator'

export class CreateTodoDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  description: string | null
}

export class UpdateTodoDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Invalid image URL' })
  imageUrl: string | null

  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  description: string | null
}
