import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalsDto } from './dto/create-goals.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  /**
   * Get user goals
   */
  @Get()
  async getGoals(@Request() req: any) {
    return this.goalsService.getGoals(req.user.userId);
  }

  /**
   * Create or update user goals
   */
  @Post()
  async createGoals(@Request() req: any, @Body() createGoalsDto: CreateGoalsDto) {
    return this.goalsService.upsertGoals(req.user.userId, createGoalsDto);
  }

  /**
   * Update user goals
   */
  @Put()
  async updateGoals(@Request() req: any, @Body() updateGoalsDto: UpdateGoalsDto) {
    return this.goalsService.updateGoals(req.user.userId, updateGoalsDto);
  }

  /**
   * Delete user goals
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGoals(@Request() req: any) {
    return this.goalsService.deleteGoals(req.user.userId);
  }

  /**
   * Calculate BMI and get recommendations
   */
  @Get('bmi/calculate')
  async calculateBMI(
    @Query('weight') weight: number,
    @Query('height') height: number,
  ) {
    return this.goalsService.calculateBMIInfo(weight, height);
  }

  /**
   * Generate AI recommendations
   */
  @Post('recommendations/generate')
  async generateRecommendations(@Request() req: any) {
    const goals = await this.goalsService.getGoals(req.user.userId);
    const recommendations = await this.goalsService.generateAIRecommendations(goals);

    // Update goals with new recommendations
    goals.aiRecommendations = recommendations;
    await this.goalsService.upsertGoals(req.user.userId, goals);

    return recommendations;
  }
}
