import { ApiProperty } from '@nestjs/swagger';

export class SyncedRecordsDto {
  @ApiProperty({ description: 'Number of activity records synced' })
  activities: number;

  @ApiProperty({ description: 'Number of heart rate records synced' })
  heartRate: number;

  @ApiProperty({ description: 'Number of sleep records synced' })
  sleep: number;

  @ApiProperty({ description: 'Number of weight records synced' })
  weight: number;
}

export class DateRangeDto {
  @ApiProperty({ description: 'Start date of sync' })
  start: string;

  @ApiProperty({ description: 'End date of sync' })
  end: string;
}

export class SyncResponseDto {
  @ApiProperty({ description: 'Whether sync was successful' })
  success: boolean;

  @ApiProperty({ description: 'User ID that was synced' })
  userId: string;

  @ApiProperty({ description: 'Number of records synced per data type' })
  syncedRecords: SyncedRecordsDto;

  @ApiProperty({ description: 'Date range that was synced' })
  dateRange: DateRangeDto;

  @ApiProperty({ description: 'Duration of sync in milliseconds' })
  duration: number;

  @ApiProperty({ description: 'Any errors that occurred', required: false })
  errors?: string[];
}
