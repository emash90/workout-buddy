import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FitbitCallbackDto {
  @ApiProperty({
    description: 'Authorization code from Fitbit OAuth',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'State parameter for security',
    example: 'random-state-string',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;
}

export class FitbitAuthResponseDto {
  @ApiProperty({
    description: 'Authorization URL for Fitbit OAuth',
    example: 'https://www.fitbit.com/oauth2/authorize?...',
  })
  authUrl: string;

  @ApiProperty({
    description: 'State parameter for security verification',
    example: 'random-state-string',
  })
  state: string;
}

export class FitbitConnectionStatusDto {
  @ApiProperty({
    description: 'Whether Fitbit is connected for this user',
    example: true,
  })
  connected: boolean;

  @ApiProperty({
    description: 'Fitbit user ID if connected',
    example: '123ABC',
    required: false,
  })
  fitbitUserId?: string;

  @ApiProperty({
    description: 'When the connection was established',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  connectedAt?: Date;
}