import { ApiProperty } from '@nestjs/swagger';

export class WeeklySummaryDto {
  @ApiProperty({ example: 'week' })
  period: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-01-22T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 42500, description: 'Total steps in the period' })
  totalSteps: number;

  @ApiProperty({ example: 6071, description: 'Average steps per day' })
  averageSteps: number;

  @ApiProperty({ example: 14350, description: 'Total calories burned' })
  totalCalories: number;

  @ApiProperty({ example: 210, description: 'Total active minutes' })
  totalActiveMinutes: number;

  @ApiProperty({ example: 7, description: 'Number of days with activity' })
  daysActive: number;
}

export class MonthlySummaryDto {
  @ApiProperty({ example: 'month' })
  period: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-01-31T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 180000, description: 'Total steps in the period' })
  totalSteps: number;

  @ApiProperty({ example: 6000, description: 'Average steps per day' })
  averageSteps: number;

  @ApiProperty({ example: 60000, description: 'Total calories burned' })
  totalCalories: number;

  @ApiProperty({ example: 900, description: 'Total active minutes' })
  totalActiveMinutes: number;

  @ApiProperty({ example: 28, description: 'Number of days with activity' })
  daysActive: number;
}

export class SleepSummaryDto {
  @ApiProperty({ example: '7 days' })
  period: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-01-22T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 420000, description: 'Average sleep duration in milliseconds (7 hours)' })
  averageDuration: number;

  @ApiProperty({ example: 92, description: 'Average sleep efficiency percentage' })
  averageEfficiency: number;

  @ApiProperty({ example: 90, description: 'Average deep sleep in minutes' })
  averageDeepSleep: number;

  @ApiProperty({ example: 7, description: 'Total nights recorded' })
  totalNights: number;
}

export class WeightTrendDto {
  @ApiProperty({ example: '30 days' })
  period: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-01-31T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 75.5, description: 'Weight at start of period in kg', nullable: true })
  startWeight: number | null;

  @ApiProperty({ example: 74.2, description: 'Weight at end of period in kg', nullable: true })
  endWeight: number | null;

  @ApiProperty({ example: -1.3, description: 'Weight change in kg' })
  change: number;

  @ApiProperty({
    example: 'losing',
    description: 'Trend direction: gaining, losing, stable, or insufficient_data',
    enum: ['gaining', 'losing', 'stable', 'insufficient_data']
  })
  trend: string;
}

export class DashboardDto {
  @ApiProperty({ type: WeeklySummaryDto })
  weeklyActivity: WeeklySummaryDto;

  @ApiProperty({ type: MonthlySummaryDto })
  monthlyActivity: MonthlySummaryDto;

  @ApiProperty({ type: SleepSummaryDto })
  sleepSummary: SleepSummaryDto;

  @ApiProperty({ type: WeightTrendDto })
  weightTrend: WeightTrendDto;

  @ApiProperty({ example: '2024-01-22T10:30:00.000Z', description: 'Timestamp when dashboard was generated' })
  generatedAt: Date;
}
