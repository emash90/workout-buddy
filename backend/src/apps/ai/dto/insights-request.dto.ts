import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InsightsRequestDto {
  @ApiPropertyOptional({
    description: 'Time period for insights',
    enum: ['week', 'month', 'year'],
    default: 'week',
  })
  @IsString()
  @IsIn(['week', 'month', 'year'])
  @IsOptional()
  period?: string = 'week';
}
