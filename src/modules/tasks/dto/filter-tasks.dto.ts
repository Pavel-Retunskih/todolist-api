import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class FilterTasksDTO {
  @ApiPropertyOptional({
    description: 'Minimum priority to include (>= value)',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPriority?: number

  @ApiPropertyOptional({
    description: 'Include tasks with dueDate in the next N days',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dueInDays?: number
}
