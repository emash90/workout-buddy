import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  ChatRequestDto,
  ChatResponseDto,
  InsightsRequestDto,
  InsightsResponseDto,
  WorkoutPlanRequestDto,
} from './dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000';
    this.logger.log(`AI Service URL: ${this.aiServiceUrl}`);
  }

  /**
   * Chat with AI fitness coach
   */
  async chat(
    userId: string | number,
    chatRequest: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    try {
      this.logger.log(`Chat request from user ${userId}: ${chatRequest.message.substring(0, 50)}...`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/chat/`, {
          user_id: userId,
          message: chatRequest.message,
          conversation_id: chatRequest.conversationId,
        }),
      );

      return {
        message: response.data.message,
        sources: response.data.sources || [],
        toolsUsed: response.data.tools_used || [],
        conversationId: response.data.conversation_id,
      };
    } catch (error) {
      this.handleError('chat', error);
    }
  }

  /**
   * Get personalized insights
   */
  async getInsights(
    userId: string | number,
    request: InsightsRequestDto,
  ): Promise<InsightsResponseDto> {
    try {
      this.logger.log(`Insights request from user ${userId}, period: ${request.period}`);

      const response: AxiosResponse<InsightsResponseDto> = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/insights/`, {
          user_id: userId,
          period: request.period || 'week',
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError('insights', error);
    }
  }

  /**
   * Get daily insight
   */
  async getDailyInsight(userId: string | number): Promise<any> {
    try {
      if (!userId) {
        this.logger.error(`Invalid user ID: ${userId}`);
        throw new HttpException(
          'User ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Daily insight request from user ${userId}`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/insights/daily`, {
          params: { user_id: userId },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError('daily insight', error);
    }
  }

  /**
   * Generate workout plan
   */
  async generateWorkoutPlan(
    userId: string | number,
    request: WorkoutPlanRequestDto,
  ): Promise<any> {
    try {
      this.logger.log(`Workout plan request from user ${userId}, goal: ${request.goal}`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.aiServiceUrl}/recommendations/workout-plan`,
          {
            user_id: userId,
            goal: request.goal,
            duration_weeks: request.durationWeeks || 8,
            days_per_week: request.daysPerWeek || 4,
            equipment: request.equipment || [],
            limitations: request.limitations || [],
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError('workout plan', error);
    }
  }

  /**
   * Get quick workout suggestion
   */
  async getQuickWorkout(
    goal: string,
    durationMinutes: number = 20,
    equipment?: string[],
  ): Promise<any> {
    try {
      this.logger.log(`Quick workout request, goal: ${goal}`);

      // Convert equipment array to comma-separated string
      const equipmentParam = equipment && equipment.length > 0
        ? equipment.join(',')
        : undefined;

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.aiServiceUrl}/recommendations/quick-workout`,
          {
            params: {
              goal,
              duration_minutes: durationMinutes,
              equipment: equipmentParam,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError('quick workout', error);
    }
  }

  /**
   * Clear chat history
   */
  async clearHistory(userId: string | number, conversationId: string): Promise<any> {
    try {
      this.logger.log(`Clear history request from user ${userId}, conversation: ${conversationId}`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.delete(`${this.aiServiceUrl}/chat/history`, {
          params: {
            user_id: userId,
            conversation_id: conversationId,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError('clear history', error);
    }
  }

  /**
   * Generate fresh weekly insights based on last 7 days
   */
  async generateWeeklyInsights(userId: string | number): Promise<any> {
    try {
      if (!userId) {
        this.logger.error(`Invalid user ID: ${userId}`);
        throw new HttpException(
          'User ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Weekly insights request from user ${userId}`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/insights/weekly`, {
          user_id: userId,
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError('weekly insights', error);
    }
  }

  /**
   * Handle errors from AI service
   */
  private handleError(operation: string, error: any): never {
    if (error instanceof AxiosError) {
      this.logger.error(
        `AI service ${operation} failed: ${error.message}`,
        error.response?.data,
      );

      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'AI service is unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        error.response?.data?.message || `Failed to ${operation}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.error(`Unexpected error in ${operation}:`, error);
    throw new HttpException(
      `Failed to ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
