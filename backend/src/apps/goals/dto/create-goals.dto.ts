import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { FitnessGoal, ActivityLevel } from '../../../entities/user-goals.entity';

export class CreateGoalsDto {
  @IsEnum(FitnessGoal)
  @IsOptional()
  fitnessGoal?: FitnessGoal;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(500)
  currentWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(500)
  targetWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(300)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(120)
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsEnum(ActivityLevel)
  @IsOptional()
  activityLevel?: ActivityLevel;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100000)
  dailyStepsGoal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  dailyCaloriesBurnGoal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1440)
  dailyActiveMinutesGoal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(24)
  dailySleepHoursGoal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(21)
  weeklyWorkoutsGoal?: number;

  @IsBoolean()
  @IsOptional()
  aiRecommendationsEnabled?: boolean;
}
