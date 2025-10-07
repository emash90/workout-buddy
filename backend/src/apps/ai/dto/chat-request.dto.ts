import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message to the AI coach',
    example: 'How am I doing this week?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Optional conversation ID to maintain context',
    example: 'conv_123abc',
  })
  @IsString()
  @IsOptional()
  conversationId?: string;
}
