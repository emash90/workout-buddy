import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ChatRequestDto,
  ChatResponseDto,
  InsightsRequestDto,
  InsightsResponseDto,
  WorkoutPlanRequestDto,
} from './dto';

@ApiTags('AI Coach')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Chat with AI fitness coach',
    description:
      'Send a message to the AI coach and receive personalized fitness advice',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response received',
    type: ChatResponseDto,
  })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async chat(
    @Request() req: any,
    @Body() chatRequest: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    return this.aiService.chat(req.user.userId, chatRequest);
  }

  @Post('insights')
  @ApiOperation({
    summary: 'Get personalized fitness insights',
    description: 'Generate insights based on your fitness data for a time period',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights generated',
    type: InsightsResponseDto,
  })
  async getInsights(
    @Request() req: any,
    @Body() request: InsightsRequestDto,
  ): Promise<InsightsResponseDto> {
    return this.aiService.getInsights(req.user.userId, request);
  }

  @Get('daily-insight')
  @ApiOperation({
    summary: 'Get today\'s daily insight',
    description: 'Get a personalized insight for today based on your recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily insight retrieved',
  })
  async getDailyInsight(@Request() req: any) {
    return this.aiService.getDailyInsight(req.user.userId);
  }

  @Post('workout-plan')
  @ApiOperation({
    summary: 'Generate personalized workout plan',
    description:
      'Create a complete workout plan based on your goals and available equipment',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout plan generated',
  })
  async generateWorkoutPlan(
    @Request() req: any,
    @Body() request: WorkoutPlanRequestDto,
  ) {
    return this.aiService.generateWorkoutPlan(req.user.userId, request);
  }

  @Get('quick-workout')
  @ApiOperation({
    summary: 'Get quick workout suggestion',
    description: 'Get a quick workout you can do today',
  })
  @ApiResponse({
    status: 200,
    description: 'Quick workout retrieved',
  })
  async getQuickWorkout(
    @Query('goal') goal: string,
    @Query('duration') duration?: number,
    @Query('equipment') equipment?: string,
  ) {
    const equipmentArray = equipment ? equipment.split(',') : [];
    return this.aiService.getQuickWorkout(
      goal,
      duration || 20,
      equipmentArray,
    );
  }

  @Post('clear-history')
  @ApiOperation({
    summary: 'Clear chat history',
    description: 'Clear conversation history for a specific conversation',
  })
  @ApiResponse({
    status: 200,
    description: 'History cleared',
  })
  async clearHistory(
    @Request() req: any,
    @Body() body: { conversationId: string },
  ) {
    return this.aiService.clearHistory(req.user.userId, body.conversationId);
  }
}
