import { Injectable, NotFoundException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGoals, FitnessGoal } from '../../entities/user-goals.entity';
import { CreateGoalsDto } from './dto/create-goals.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import {
  calculateBMI,
  getIdealWeightRange,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
} from './goals.utils';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(UserGoals)
    private readonly userGoalsRepository: Repository<UserGoals>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  /**
   * Create or update user goals
   */
  async upsertGoals(userId: string, createGoalsDto: CreateGoalsDto): Promise<UserGoals> {
    try {
      // Check if goals already exist
      let userGoals = await this.userGoalsRepository.findOne({
        where: { userId },
      });

      if (userGoals) {
        // Update existing goals
        Object.assign(userGoals, createGoalsDto);
      } else {
        // Create new goals
        userGoals = this.userGoalsRepository.create({
          userId,
          ...createGoalsDto,
        });
      }

      // Calculate BMI if weight and height are provided
      if (createGoalsDto.currentWeight && createGoalsDto.height) {
        userGoals.currentBMI = calculateBMI(
          createGoalsDto.currentWeight,
          createGoalsDto.height,
        );

        // Calculate ideal BMI based on ideal weight range
        const idealRange = getIdealWeightRange(createGoalsDto.height);
        const idealWeight = (idealRange.min + idealRange.max) / 2;
        userGoals.idealBMI = calculateBMI(idealWeight, createGoalsDto.height);
      }

      // Save goals
      await this.userGoalsRepository.save(userGoals);

      // Generate AI recommendations if enabled
      if (createGoalsDto.aiRecommendationsEnabled && this.canGenerateRecommendations(userGoals)) {
        try {
          const recommendations = await this.generateAIRecommendations(userGoals);
          userGoals.aiRecommendations = recommendations;
          await this.userGoalsRepository.save(userGoals);
        } catch (error) {
          this.logger.error('Failed to generate AI recommendations:', error);
          // Continue even if AI recommendations fail
        }
      }

      return userGoals;
    } catch (error) {
      this.logger.error('Failed to create/update goals:', error);
      throw new HttpException(
        'Failed to save goals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user goals
   */
  async getGoals(userId: string): Promise<UserGoals> {
    const goals = await this.userGoalsRepository.findOne({
      where: { userId },
    });

    if (!goals) {
      throw new NotFoundException('Goals not found for this user');
    }

    return goals;
  }

  /**
   * Update user goals
   */
  async updateGoals(userId: string, updateGoalsDto: UpdateGoalsDto): Promise<UserGoals> {
    return this.upsertGoals(userId, updateGoalsDto);
  }

  /**
   * Delete user goals
   */
  async deleteGoals(userId: string): Promise<void> {
    const result = await this.userGoalsRepository.delete({ userId });

    if (result.affected === 0) {
      throw new NotFoundException('Goals not found for this user');
    }
  }

  /**
   * Calculate BMI info
   */
  async calculateBMIInfo(
    weight: number,
    height: number,
  ): Promise<{
    bmi: number;
    category: string;
    idealWeightRange: { min: number; max: number };
  }> {
    const bmi = calculateBMI(weight, height);
    const category = getBMICategory(bmi);
    const idealWeightRange = getIdealWeightRange(height);

    return {
      bmi,
      category,
      idealWeightRange,
    };
  }

  /**
   * Generate AI-powered goal recommendations
   */
  async generateAIRecommendations(userGoals: UserGoals): Promise<any> {
    try {
      this.logger.log(`Generating AI recommendations for user ${userGoals.userId}`);

      // Calculate BMR and TDEE
      let bmr: number | null = null;
      let tdee: number | null = null;

      if (userGoals.currentWeight && userGoals.height && userGoals.age && userGoals.gender) {
        bmr = calculateBMR(
          userGoals.currentWeight,
          userGoals.height,
          userGoals.age,
          userGoals.gender,
        );
        tdee = calculateTDEE(bmr, userGoals.activityLevel);
      }

      // Prepare context for AI
      const context = {
        fitnessGoal: userGoals.fitnessGoal,
        currentWeight: userGoals.currentWeight,
        targetWeight: userGoals.targetWeight,
        height: userGoals.height,
        age: userGoals.age,
        gender: userGoals.gender,
        activityLevel: userGoals.activityLevel,
        currentBMI: userGoals.currentBMI,
        idealBMI: userGoals.idealBMI,
        bmr,
        tdee,
      };

      // Build prompt for AI
      const prompt = this.buildRecommendationPrompt(context);

      // Call AI service
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/chat/`, {
          user_id: userGoals.userId,
          message: prompt,
          conversation_id: `goals_${userGoals.userId}_${Date.now()}`,
        }),
      );

      // Parse AI response and extract recommendations
      const aiMessage = response.data.message;
      const recommendations = this.parseAIRecommendations(aiMessage, context);

      return {
        ...recommendations,
        generatedAt: new Date(),
        reasoning: aiMessage,
      };
    } catch (error) {
      this.logger.error('Failed to generate AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Build prompt for AI recommendations
   */
  private buildRecommendationPrompt(context: any): string {
    const goalDescriptions = {
      [FitnessGoal.LOSE_WEIGHT]: 'lose weight',
      [FitnessGoal.GAIN_MUSCLE]: 'gain muscle',
      [FitnessGoal.MAINTAIN_WEIGHT]: 'maintain current weight',
      [FitnessGoal.IMPROVE_ENDURANCE]: 'improve endurance',
      [FitnessGoal.GENERAL_FITNESS]: 'improve general fitness',
    };

    const goalText = goalDescriptions[context.fitnessGoal] || 'improve fitness';

    return `As a fitness expert, provide personalized fitness goal recommendations for a user with the following profile:

- Primary Goal: ${goalText}
- Current Weight: ${context.currentWeight || 'unknown'} kg
- Target Weight: ${context.targetWeight || 'not specified'} kg
- Height: ${context.height || 'unknown'} cm
- Age: ${context.age || 'unknown'}
- Gender: ${context.gender || 'unknown'}
- Activity Level: ${context.activityLevel || 'unknown'}
- Current BMI: ${context.currentBMI?.toFixed(1) || 'unknown'}
- Ideal BMI: ${context.idealBMI?.toFixed(1) || 'unknown'}
- BMR: ${context.bmr || 'unknown'} calories/day
- TDEE: ${context.tdee || 'unknown'} calories/day

Please provide specific, achievable daily and weekly targets for:
1. Daily steps (realistic based on activity level)
2. Daily calories to burn (based on goal and TDEE)
3. Daily active minutes (exercise time)
4. Daily sleep hours (for recovery)
5. Weekly workouts (frequency based on goal)

Format your response with clear numbers for each metric. Explain the reasoning behind each recommendation in 2-3 sentences.`;
  }

  /**
   * Parse AI recommendations from response
   */
  private parseAIRecommendations(aiMessage: string, context: any): any {
    // Default recommendations based on goal
    const defaults = this.getDefaultRecommendations(context);

    // Try to extract numbers from AI response
    const stepsMatch = aiMessage.match(/(?:steps?|walking)[:\s]+(\d+(?:,\d+)?)/i);
    const caloriesMatch = aiMessage.match(/(?:calories?|burn)[:\s]+(\d+)/i);
    const minutesMatch = aiMessage.match(/(?:active\s+minutes?|exercise)[:\s]+(\d+)/i);
    const sleepMatch = aiMessage.match(/(?:sleep)[:\s]+(\d+(?:\.\d+)?)/i);
    const workoutsMatch = aiMessage.match(/(?:workouts?|sessions?)[:\s]+(\d+)/i);

    return {
      dailySteps: stepsMatch ? parseInt(stepsMatch[1].replace(',', '')) : defaults.dailySteps,
      dailyCaloriesBurn: caloriesMatch ? parseInt(caloriesMatch[1]) : defaults.dailyCaloriesBurn,
      dailyActiveMinutes: minutesMatch ? parseInt(minutesMatch[1]) : defaults.dailyActiveMinutes,
      dailySleepHours: sleepMatch ? parseFloat(sleepMatch[1]) : defaults.dailySleepHours,
      weeklyWorkouts: workoutsMatch ? parseInt(workoutsMatch[1]) : defaults.weeklyWorkouts,
    };
  }

  /**
   * Get default recommendations based on fitness goal
   */
  private getDefaultRecommendations(context: any): any {
    const goal = context.fitnessGoal;
    const activityLevel = context.activityLevel;

    // Base recommendations
    let recommendations = {
      dailySteps: 10000,
      dailyCaloriesBurn: 500,
      dailyActiveMinutes: 30,
      dailySleepHours: 8,
      weeklyWorkouts: 4,
    };

    // Adjust based on goal
    switch (goal) {
      case FitnessGoal.LOSE_WEIGHT:
        recommendations.dailySteps = 12000;
        recommendations.dailyCaloriesBurn = 600;
        recommendations.dailyActiveMinutes = 45;
        recommendations.weeklyWorkouts = 5;
        break;

      case FitnessGoal.GAIN_MUSCLE:
        recommendations.dailySteps = 8000;
        recommendations.dailyCaloriesBurn = 400;
        recommendations.dailyActiveMinutes = 60;
        recommendations.dailySleepHours = 8.5;
        recommendations.weeklyWorkouts = 5;
        break;

      case FitnessGoal.IMPROVE_ENDURANCE:
        recommendations.dailySteps = 12000;
        recommendations.dailyCaloriesBurn = 550;
        recommendations.dailyActiveMinutes = 60;
        recommendations.weeklyWorkouts = 6;
        break;

      case FitnessGoal.MAINTAIN_WEIGHT:
        recommendations.dailySteps = 10000;
        recommendations.dailyCaloriesBurn = 400;
        recommendations.dailyActiveMinutes = 30;
        recommendations.weeklyWorkouts = 3;
        break;

      default:
        // General fitness - keep defaults
        break;
    }

    // Adjust based on activity level
    if (activityLevel === 'sedentary') {
      recommendations.dailySteps = Math.floor(recommendations.dailySteps * 0.8);
      recommendations.dailyActiveMinutes = Math.floor(recommendations.dailyActiveMinutes * 0.7);
    } else if (activityLevel === 'very_active' || activityLevel === 'extra_active') {
      recommendations.dailySteps = Math.floor(recommendations.dailySteps * 1.2);
      recommendations.dailyActiveMinutes = Math.floor(recommendations.dailyActiveMinutes * 1.3);
    }

    return recommendations;
  }

  /**
   * Check if we have enough data to generate recommendations
   */
  private canGenerateRecommendations(userGoals: UserGoals): boolean {
    return !!(
      userGoals.fitnessGoal &&
      userGoals.currentWeight &&
      userGoals.height &&
      userGoals.age &&
      userGoals.gender &&
      userGoals.activityLevel
    );
  }
}
