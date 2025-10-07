import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutPlanRequestDto {
  @ApiProperty({
    description: 'Primary fitness goal',
    example: 'muscle_gain',
    enum: ['muscle_gain', 'weight_loss', 'endurance', 'strength', 'general_fitness'],
  })
  @IsString()
  @IsNotEmpty()
  goal: string;

  @ApiPropertyOptional({
    description: 'Plan duration in weeks',
    minimum: 4,
    maximum: 12,
    default: 8,
  })
  @IsInt()
  @Min(4)
  @Max(12)
  @IsOptional()
  durationWeeks?: number = 8;

  @ApiPropertyOptional({
    description: 'Training days per week',
    minimum: 3,
    maximum: 6,
    default: 4,
  })
  @IsInt()
  @Min(3)
  @Max(6)
  @IsOptional()
  daysPerWeek?: number = 4;

  @ApiPropertyOptional({
    description: 'Available equipment',
    type: [String],
    example: ['dumbbells', 'barbell', 'resistance bands'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipment?: string[];

  @ApiPropertyOptional({
    description: 'Physical limitations or injuries',
    type: [String],
    example: ['lower back pain'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  limitations?: string[];
}
