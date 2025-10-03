import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ActivityData, HeartRateData, SleepData, WeightData } from '../../entities';
import { FitbitService } from '../fitbit/fitbit.service';
import { SyncResponseDto, DataType } from './dto';

@Injectable()
export class FitnessDataService {
  private readonly logger = new Logger(FitnessDataService.name);

  constructor(
    @InjectRepository(ActivityData)
    private activityRepo: Repository<ActivityData>,
    @InjectRepository(HeartRateData)
    private heartRateRepo: Repository<HeartRateData>,
    @InjectRepository(SleepData)
    private sleepRepo: Repository<SleepData>,
    @InjectRepository(WeightData)
    private weightRepo: Repository<WeightData>,
    private fitbitService: FitbitService,
  ) {}

  // ===== SYNC METHODS =====

  async syncUserData(
    userId: string,
    startDate?: string,
    endDate?: string,
    dataTypes?: DataType[]
  ): Promise<SyncResponseDto> {
    const startTime = Date.now();
    const errors: string[] = [];

    // Default date range: last 30 days
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Default to sync all data types
    const typesToSync = dataTypes || [DataType.ACTIVITY, DataType.HEART_RATE, DataType.SLEEP, DataType.WEIGHT];

    this.logger.log(`Starting sync for user ${userId} from ${start} to ${end}`);

    const syncedRecords = {
      activities: 0,
      heartRate: 0,
      sleep: 0,
      weight: 0,
    };

    // Sync activities
    if (typesToSync.includes(DataType.ACTIVITY)) {
      try {
        syncedRecords.activities = await this.syncActivities(userId, start, end);
      } catch (error) {
        this.logger.error(`Activity sync failed: ${error.message}`);
        errors.push(`Activity sync failed: ${error.message}`);
      }
    }

    // Sync heart rate
    if (typesToSync.includes(DataType.HEART_RATE)) {
      try {
        syncedRecords.heartRate = await this.syncHeartRate(userId, start, end);
      } catch (error) {
        this.logger.error(`Heart rate sync failed: ${error.message}`);
        errors.push(`Heart rate sync failed: ${error.message}`);
      }
    }

    // Sync sleep
    if (typesToSync.includes(DataType.SLEEP)) {
      try {
        syncedRecords.sleep = await this.syncSleep(userId, start, end);
      } catch (error) {
        this.logger.error(`Sleep sync failed: ${error.message}`);
        errors.push(`Sleep sync failed: ${error.message}`);
      }
    }

    // Sync weight
    if (typesToSync.includes(DataType.WEIGHT)) {
      try {
        syncedRecords.weight = await this.syncWeight(userId, start, end);
      } catch (error) {
        this.logger.error(`Weight sync failed: ${error.message}`);
        errors.push(`Weight sync failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const totalRecords = Object.values(syncedRecords).reduce((sum, count) => sum + count, 0);

    this.logger.log(`Sync completed for user ${userId}: ${totalRecords} records in ${duration}ms`);

    return {
      success: errors.length === 0,
      userId,
      syncedRecords,
      dateRange: { start, end },
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async syncToday(userId: string): Promise<SyncResponseDto> {
    const today = new Date().toISOString().split('T')[0];
    return this.syncUserData(userId, today, today);
  }

  async syncHistorical(userId: string, days: number): Promise<SyncResponseDto> {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.syncUserData(userId, start, end);
  }

  // ===== ACTIVITY DATA =====

  async syncActivities(userId: string, startDate: string, endDate: string): Promise<number> {
    const dates = this.getDateRange(startDate, endDate);
    let syncedCount = 0;

    for (const date of dates) {
      try {
        const fitbitData = await this.fitbitService.getDailySummary(userId, date);
        const activityData = this.transformActivityData(fitbitData, userId, date);

        await this.activityRepo.upsert(activityData, {
          conflictPaths: ['userId', 'date'],
          skipUpdateIfNoValuesChanged: true,
        });

        syncedCount++;
      } catch (error) {
        this.logger.warn(`Failed to sync activity for ${date}: ${error.message}`);
      }
    }

    return syncedCount;
  }

  async getActivities(userId: string, startDate: string, endDate: string): Promise<ActivityData[]> {
    return this.activityRepo.find({
      where: {
        userId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: { date: 'DESC' },
    });
  }

  // ===== HEART RATE DATA =====

  async syncHeartRate(userId: string, startDate: string, endDate: string): Promise<number> {
    const dates = this.getDateRange(startDate, endDate);
    let syncedCount = 0;

    for (const date of dates) {
      try {
        const fitbitData = await this.fitbitService.getHeartRateData(userId, date);
        const heartRateData = this.transformHeartRateData(fitbitData, userId, date);

        await this.heartRateRepo.upsert(heartRateData, {
          conflictPaths: ['userId', 'date'],
          skipUpdateIfNoValuesChanged: true,
        });

        syncedCount++;
      } catch (error) {
        this.logger.warn(`Failed to sync heart rate for ${date}: ${error.message}`);
      }
    }

    return syncedCount;
  }

  async getHeartRate(userId: string, startDate: string, endDate: string): Promise<HeartRateData[]> {
    return this.heartRateRepo.find({
      where: {
        userId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: { date: 'DESC' },
    });
  }

  // ===== SLEEP DATA =====

  async syncSleep(userId: string, startDate: string, endDate: string): Promise<number> {
    const dates = this.getDateRange(startDate, endDate);
    let syncedCount = 0;

    for (const date of dates) {
      try {
        const fitbitData = await this.fitbitService.getSleepLog(userId, date);

        if (fitbitData.sleep && fitbitData.sleep.length > 0) {
          const sleepData = this.transformSleepData(fitbitData, userId);

          await this.sleepRepo.upsert(sleepData, {
            conflictPaths: ['userId', 'dateOfSleep'],
            skipUpdateIfNoValuesChanged: true,
          });

          syncedCount++;
        }
      } catch (error) {
        this.logger.warn(`Failed to sync sleep for ${date}: ${error.message}`);
      }
    }

    return syncedCount;
  }

  async getSleep(userId: string, startDate: string, endDate: string): Promise<SleepData[]> {
    return this.sleepRepo.find({
      where: {
        userId,
        dateOfSleep: Between(new Date(startDate), new Date(endDate)),
      },
      order: { dateOfSleep: 'DESC' },
    });
  }

  // ===== WEIGHT DATA =====

  async syncWeight(userId: string, startDate: string, endDate: string): Promise<number> {
    const dates = this.getDateRange(startDate, endDate);
    let syncedCount = 0;

    for (const date of dates) {
      try {
        const fitbitData = await this.fitbitService.getWeightLog(userId, date);

        if (fitbitData.weight && fitbitData.weight.length > 0) {
          const weightData = this.transformWeightData(fitbitData, userId);

          await this.weightRepo.upsert(weightData, {
            conflictPaths: ['userId', 'date'],
            skipUpdateIfNoValuesChanged: true,
          });

          syncedCount++;
        }
      } catch (error) {
        this.logger.warn(`Failed to sync weight for ${date}: ${error.message}`);
      }
    }

    return syncedCount;
  }

  async getWeight(userId: string, startDate: string, endDate: string): Promise<WeightData[]> {
    return this.weightRepo.find({
      where: {
        userId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: { date: 'DESC' },
    });
  }

  // ===== AGGREGATION METHODS =====

  async getWeeklyActivitySummary(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const activities = await this.activityRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });

    if (activities.length === 0) {
      return {
        period: 'week',
        startDate,
        endDate,
        totalSteps: 0,
        averageSteps: 0,
        totalCalories: 0,
        totalActiveMinutes: 0,
        daysActive: 0,
      };
    }

    const totalSteps = activities.reduce((sum, a) => sum + a.steps, 0);
    const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
    const totalActiveMinutes = activities.reduce((sum, a) => sum + a.activeMinutes, 0);
    const totalDistance = activities.reduce((sum, a) => sum + Number(a.distance), 0);
    const totalFloors = activities.reduce((sum, a) => sum + a.floors, 0);
    const daysActive = activities.filter(a => a.steps > 0).length;

    return {
      period: 'week',
      startDate,
      endDate,
      totalSteps,
      averageSteps: Math.round(totalSteps / 7),
      totalCalories: Math.round(totalCalories),
      totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      totalActiveMinutes,
      totalFloors,
      daysActive,
    };
  }

  async getWeeklyActivityBreakdown(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

    const activities = await this.activityRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    // Create a map of activities by date for quick lookup
    const activityMap = new Map<string, ActivityData>();
    activities.forEach(activity => {
      const dateStr = new Date(activity.date).toISOString().split('T')[0];
      activityMap.set(dateStr, activity);
    });

    // Generate 7 days of data (including days with no data)
    const days: Array<{ day: string; steps: number; calories: number; date: string }> = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];

      const activity = activityMap.get(dateStr);

      days.push({
        day: dayName,
        steps: activity?.steps || 0,
        calories: activity?.calories || 0,
        date: dateStr,
      });
    }

    return {
      days,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  async getMonthlyActivitySummary(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const activities = await this.activityRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });

    if (activities.length === 0) {
      return {
        period: 'month',
        startDate,
        endDate,
        totalSteps: 0,
        averageSteps: 0,
        totalCalories: 0,
        totalActiveMinutes: 0,
        daysActive: 0,
      };
    }

    const totalSteps = activities.reduce((sum, a) => sum + a.steps, 0);
    const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
    const totalActiveMinutes = activities.reduce((sum, a) => sum + a.activeMinutes, 0);
    const totalDistance = activities.reduce((sum, a) => sum + Number(a.distance), 0);
    const totalFloors = activities.reduce((sum, a) => sum + a.floors, 0);
    const daysActive = activities.filter(a => a.steps > 0).length;

    return {
      period: 'month',
      startDate,
      endDate,
      totalSteps,
      averageSteps: Math.round(totalSteps / 30),
      totalCalories: Math.round(totalCalories),
      totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      totalActiveMinutes,
      totalFloors,
      daysActive,
    };
  }

  async getSleepQualitySummary(userId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sleepRecords = await this.sleepRepo.find({
      where: {
        userId,
        dateOfSleep: Between(startDate, endDate),
      },
    });

    if (sleepRecords.length === 0) {
      return {
        period: `${days} days`,
        startDate,
        endDate,
        averageDuration: 0,
        averageEfficiency: 0,
        averageDeepSleep: 0,
        totalNights: 0,
      };
    }

    const totalDuration = sleepRecords.reduce((sum, s) => sum + s.duration, 0);
    const totalEfficiency = sleepRecords.reduce((sum, s) => sum + s.efficiency, 0);
    const totalDeepSleep = sleepRecords.reduce((sum, s) => sum + (s.deepSleepMinutes || 0), 0);

    return {
      period: `${days} days`,
      startDate,
      endDate,
      averageDuration: Math.round(totalDuration / sleepRecords.length),
      averageEfficiency: Math.round(totalEfficiency / sleepRecords.length),
      averageDeepSleep: Math.round(totalDeepSleep / sleepRecords.length),
      totalNights: sleepRecords.length,
    };
  }

  async getWeightTrend(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const weightRecords = await this.weightRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    if (weightRecords.length < 2) {
      return {
        period: `${days} days`,
        startDate,
        endDate,
        startWeight: null,
        endWeight: null,
        change: 0,
        trend: 'insufficient_data',
      };
    }

    const startWeight = weightRecords[0].weight;
    const endWeight = weightRecords[weightRecords.length - 1].weight;
    const change = endWeight - startWeight;

    let trend = 'stable';
    if (change > 0.5) trend = 'gaining';
    else if (change < -0.5) trend = 'losing';

    return {
      period: `${days} days`,
      startDate,
      endDate,
      startWeight,
      endWeight,
      change: Math.round(change * 10) / 10,
      trend,
    };
  }

  async getDashboard(userId: string) {
    const [weeklyActivity, monthlyActivity, sleepSummary, weightTrend] = await Promise.all([
      this.getWeeklyActivitySummary(userId),
      this.getMonthlyActivitySummary(userId),
      this.getSleepQualitySummary(userId, 7),
      this.getWeightTrend(userId, 30),
    ]);

    return {
      weeklyActivity,
      monthlyActivity,
      sleepSummary,
      weightTrend,
      generatedAt: new Date(),
    };
  }

  async getTodayStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Get today's activity data
    const activity = await this.activityRepo.findOne({
      where: { userId, date: today },
    });

    // Get today's sleep data (might be from last night)
    const sleep = await this.sleepRepo.findOne({
      where: { userId, dateOfSleep: new Date(today) },
      order: { dateOfSleep: 'DESC' },
    });

    // Get today's heart rate data
    const heartRate = await this.heartRateRepo.findOne({
      where: { userId, date: new Date(today) },
    });

    // Get goals from raw data or use defaults
    const goals = activity?.rawData?.goals || {};

    return {
      steps: activity?.steps || 0,
      stepsGoal: goals.steps || 10000,
      calories: activity?.calories || 0,
      caloriesGoal: goals.caloriesOut || 2500,
      activeMinutes: activity?.activeMinutes || 0,
      activeMinutesGoal: goals.activeMinutes || 30,
      heartRate: heartRate?.restingHeartRate || 0,
      sleep: sleep?.minutesAsleep ? Math.round(sleep.minutesAsleep / 60) : 0,
      sleepGoal: 8,
    };
  }

  async getTodayActivityStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await this.activityRepo.findOne({
      where: { userId, date: today },
    });

    const goals = activity?.rawData?.goals || {};

    return {
      steps: activity?.steps || 0,
      stepsGoal: goals.steps || 10000,
      distance: parseFloat(activity?.distance?.toString() || '0'),
      distanceGoal: goals.distance || 8,
      calories: activity?.calories || 0,
      caloriesGoal: goals.caloriesOut || 2500,
      activeMinutes: activity?.activeMinutes || 0,
      activeMinutesGoal: goals.activeMinutes || 30,
      floors: activity?.floors || 0,
      floorsGoal: goals.floors || 10,
    };
  }

  // ===== HELPER METHODS =====

  private transformActivityData(fitbitResponse: any, userId: string, date: string): Partial<ActivityData> {
    const summary = fitbitResponse.summary || {};

    return {
      userId,
      date: new Date(date),
      steps: summary.steps || 0,
      distance: summary.distances?.[0]?.distance || 0,
      floors: summary.floors || 0,
      elevation: summary.elevation || 0,
      calories: summary.caloriesOut || 0,
      activeMinutes: summary.fairlyActiveMinutes + summary.veryActiveMinutes || 0,
      sedentaryMinutes: summary.sedentaryMinutes || 0,
      lightlyActiveMinutes: summary.lightlyActiveMinutes || 0,
      fairlyActiveMinutes: summary.fairlyActiveMinutes || 0,
      veryActiveMinutes: summary.veryActiveMinutes || 0,
      distances: summary.distances || [],
      rawData: fitbitResponse,
    };
  }

  private transformHeartRateData(fitbitResponse: any, userId: string, date: string): Partial<HeartRateData> {
    const heartData = fitbitResponse['activities-heart']?.[0];
    const value = heartData?.value || {};
    const zones = value.heartRateZones || [];

    return {
      userId,
      date: new Date(date),
      restingHeartRate: value.restingHeartRate || null,
      heartRateZones: zones,
      outOfRangeMinutes: zones.find(z => z.name === 'Out of Range')?.minutes || null,
      fatBurnMinutes: zones.find(z => z.name === 'Fat Burn')?.minutes || null,
      cardioMinutes: zones.find(z => z.name === 'Cardio')?.minutes || null,
      peakMinutes: zones.find(z => z.name === 'Peak')?.minutes || null,
      rawData: fitbitResponse,
    };
  }

  private transformSleepData(fitbitResponse: any, userId: string): Partial<SleepData> {
    const sleep = fitbitResponse.sleep[0];
    const levels = sleep.levels?.summary || {};

    return {
      userId,
      dateOfSleep: new Date(sleep.dateOfSleep),
      duration: sleep.duration,
      efficiency: sleep.efficiency,
      startTime: new Date(sleep.startTime),
      endTime: new Date(sleep.endTime),
      minutesAsleep: sleep.minutesAsleep,
      minutesAwake: sleep.minutesAwake,
      minutesToFallAsleep: sleep.minutesToFallAsleep || 0,
      minutesAfterWakeup: sleep.minutesAfterWakeup || 0,
      timeInBed: sleep.timeInBed,
      type: sleep.type,
      deepSleepMinutes: levels.deep?.minutes || null,
      lightSleepMinutes: levels.light?.minutes || null,
      remSleepMinutes: levels.rem?.minutes || null,
      wakeSleepMinutes: levels.wake?.minutes || null,
      sleepStages: {
        deep: levels.deep?.minutes || 0,
        light: levels.light?.minutes || 0,
        rem: levels.rem?.minutes || 0,
        wake: levels.wake?.minutes || 0,
      },
      levels: sleep.levels,
      rawData: fitbitResponse,
    };
  }

  private transformWeightData(fitbitResponse: any, userId: string): Partial<WeightData> {
    const weight = fitbitResponse.weight[0];

    return {
      userId,
      date: new Date(weight.date),
      weight: weight.weight,
      bmi: weight.bmi || null,
      fat: weight.fat || null,
      unit: 'kg',
      loggedAt: new Date(weight.time),
      source: weight.source || 'manual',
      rawData: fitbitResponse,
    };
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  }
}
