import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SourceDto {
  @ApiProperty({ description: 'Source title' })
  title: string;

  @ApiProperty({ description: 'Source URL' })
  url: string;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI response message',
    example: "Looking at your recent activity, you're doing great!",
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Sources used for the response',
    type: [SourceDto],
  })
  sources?: SourceDto[];

  @ApiPropertyOptional({
    description: 'Tools used by the agent',
    type: [String],
  })
  toolsUsed?: string[];

  @ApiPropertyOptional({
    description: 'Conversation ID',
    example: 'conv_123abc',
  })
  conversationId?: string;
}
