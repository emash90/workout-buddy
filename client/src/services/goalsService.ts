import api from './api';

export const FitnessGoal = {
  LOSE_WEIGHT: 'lose_weight',
  GAIN_MUSCLE: 'gain_muscle',
  MAINTAIN_WEIGHT: 'maintain_weight',
  IMPROVE_ENDURANCE: 'improve_endurance',
  GENERAL_FITNESS: 'general_fitness',
} as const;

export type FitnessGoal = typeof FitnessGoal[keyof typeof FitnessGoal];

export const ActivityLevel = {
  SEDENTARY: 'sedentary',
  LIGHTLY_ACTIVE: 'lightly_active',
  MODERATELY_ACTIVE: 'moderately_active',
  VERY_ACTIVE: 'very_active',
  EXTRA_ACTIVE: 'extra_active',
} as const;

export type ActivityLevel = typeof ActivityLevel[keyof typeof ActivityLevel];

export interface UserGoals {
  id: string;
  userId: string;
  fitnessGoal: FitnessGoal;
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  currentBMI?: number;
  idealBMI?: number;
  age?: number;
  gender?: string;
  activityLevel: ActivityLevel;
  dailyStepsGoal: number;
  dailyCaloriesBurnGoal: number;
  dailyActiveMinutesGoal: number;
  dailySleepHoursGoal: number;
  weeklyWorkoutsGoal: number;
  aiRecommendationsEnabled: boolean;
  aiRecommendations?: {
    dailySteps?: number;
    dailyCaloriesBurn?: number;
    dailyActiveMinutes?: number;
    dailySleepHours?: number;
    weeklyWorkouts?: number;
    generatedAt?: string;
    reasoning?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalsDto {
  fitnessGoal?: FitnessGoal;
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activityLevel?: ActivityLevel;
  dailyStepsGoal?: number;
  dailyCaloriesBurnGoal?: number;
  dailyActiveMinutesGoal?: number;
  dailySleepHoursGoal?: number;
  weeklyWorkoutsGoal?: number;
  aiRecommendationsEnabled?: boolean;
}

export interface BMIInfo {
  bmi: number;
  category: string;
  idealWeightRange: {
    min: number;
    max: number;
  };
}

class GoalsService {
  async getGoals(): Promise<UserGoals> {
    const response = await api.get('/goals');
    return response.data;
  }

  async createGoals(data: CreateGoalsDto): Promise<UserGoals> {
    const response = await api.post('/goals', data);
    return response.data;
  }

  async updateGoals(data: CreateGoalsDto): Promise<UserGoals> {
    const response = await api.put('/goals', data);
    return response.data;
  }

  async deleteGoals(): Promise<void> {
    await api.delete('/goals');
  }

  async calculateBMI(weight: number, height: number): Promise<BMIInfo> {
    const response = await api.get('/goals/bmi/calculate', {
      params: { weight, height },
    });
    return response.data;
  }

  async generateAIRecommendations(): Promise<any> {
    const response = await api.post('/goals/recommendations/generate', {});
    return response.data;
  }
}

export const goalsService = new GoalsService();
