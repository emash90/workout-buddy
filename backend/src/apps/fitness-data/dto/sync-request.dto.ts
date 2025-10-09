import { IsOptional, IsDateString, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum DataType {
  ACTIVITY = 'activity',
  HEART_RATE = 'heartRate',
  SLEEP = 'sleep',
  WEIGHT = 'weight',
}

export class SyncRequestDto {
  @ApiProperty({
    description: 'Start date for sync in YYYY-MM-DD format',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for sync in YYYY-MM-DD format',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Specific data types to sync',
    example: ['activity', 'heartRate'],
    required: false,
    enum: DataType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DataType, { each: true })
  dataTypes?: DataType[];
}

export class HistoricalSyncDto {
  @ApiProperty({
    description: 'Number of days to backfill',
    example: 30,
    default: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  days: number = 30;
}
