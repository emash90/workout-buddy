import { ApiProperty } from '@nestjs/swagger';

export class InsightsStatsDto {
  @ApiProperty()
  average: number;

  @ApiProperty()
  median: number;

  @ApiProperty()
  min: number;

  @ApiProperty()
  max: number;

  @ApiProperty()
  std_dev: number;

  @ApiProperty()
  consistency: number;

  @ApiProperty()
  days_analyzed: number;

  @ApiProperty()
  days_hit_goal: number;
}

export class InsightsPatternsDto {
  @ApiProperty({ type: [String] })
  trends: string[];

  @ApiProperty({ type: [String] })
  patterns: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];

  @ApiProperty({ type: InsightsStatsDto })
  stats: InsightsStatsDto;
}

export class InsightsResponseDto {
  @ApiProperty({
    description: 'Generated insights',
    type: [String],
  })
  insights: string[];

  @ApiProperty({
    description: 'Identified patterns and trends',
    type: InsightsPatternsDto,
  })
  patterns: InsightsPatternsDto;

  @ApiProperty({
    description: 'Statistical summary',
    type: InsightsStatsDto,
  })
  stats: InsightsStatsDto;

  @ApiProperty({
    description: 'Time period analyzed',
    example: 'week',
  })
  period: string;
}
