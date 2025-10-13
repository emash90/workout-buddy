import { Injectable, Logger } from '@nestjs/common';
import { ActivityData, HeartRateData, SleepData, WeightData } from '../../entities';
import {
  WhoopCycle,
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  WhoopBodyMeasurement,
} from './interfaces/whoop.interface';

/**
 * Whoop Data Mapper Service
 *
 * Transforms Whoop API data into our database entity format.
 * This allows us to store Whoop data in the same tables as Fitbit data
 * with the dataSource field distinguishing the provider.
 */
@Injectable()
export class WhoopDataMapperService {
  private readonly logger = new Logger(WhoopDataMapperService.name);

  /**
   * Map Whoop Cycle data to ActivityData entity
   *
   * Whoop Cycles represent daily summaries with strain metrics.
   * We map these to activity data by converting strain to estimated metrics.
   */
  mapCycleToActivity(cycle: WhoopCycle, userId: string): Partial<ActivityData> | null {
    if (!cycle.score) {
      this.logger.warn(`Cycle ${cycle.id} has no score, skipping activity mapping`);
      return null;
    }

    // Extract date from cycle start time
    const date = new Date(cycle.start);
    date.setHours(0, 0, 0, 0);

    // Whoop doesn't provide step count, but we can estimate from strain
    // Strain ranges from 0-21, we'll estimate steps based on this
    const estimatedSteps = this.estimateStepsFromStrain(cycle.score.strain);

    // Convert kilojoules to calories (1 kJ = 0.239 calories)
    const calories = Math.round(cycle.score.kilojoule * 0.239);

    // Estimate active minutes from strain (higher strain = more active minutes)
    const activeMinutes = this.estimateActiveMinutesFromStrain(cycle.score.strain);

    return {
      userId,
      date,
      steps: estimatedSteps,
      distance: 0, // Whoop doesn't provide daily distance in cycle data
      floors: 0, // Whoop doesn't track floors
      elevation: 0,
      calories,
      activeMinutes,
      sedentaryMinutes: 0, // Not provided by Whoop
      lightlyActiveMinutes: 0,
      fairlyActiveMinutes: Math.round(activeMinutes * 0.4),
      veryActiveMinutes: Math.round(activeMinutes * 0.6),
      distances: [],
      rawData: cycle,
      dataSource: 'whoop',
    };
  }

  /**
   * Map Whoop Recovery and Cycle data to HeartRateData entity
   *
   * Whoop provides resting heart rate as part of recovery metrics
   */
  mapRecoveryToHeartRate(
    recovery: WhoopRecovery,
    cycle: WhoopCycle,
    userId: string,
  ): Partial<HeartRateData> | null {
    if (!recovery.score) {
      this.logger.warn(`Recovery ${recovery.cycle_id} has no score, skipping heart rate mapping`);
      return null;
    }

    // Extract date from cycle start time
    const date = new Date(cycle.start);
    date.setHours(0, 0, 0, 0);

    // Map recovery score to heart rate zones (approximation)
    const zones = this.mapRecoveryToHeartRateZones(recovery, cycle);

    return {
      userId,
      date,
      restingHeartRate: Math.round(recovery.score.resting_heart_rate),
      heartRateZones: zones,
      outOfRangeMinutes: zones[0]?.minutes || null,
      fatBurnMinutes: zones[1]?.minutes || null,
      cardioMinutes: zones[2]?.minutes || null,
      peakMinutes: zones[3]?.minutes || null,
      intradayData: undefined, // Whoop doesn't provide intraday heart rate data via API
      rawData: { recovery, cycle },
      dataSource: 'whoop',
    };
  }

  /**
   * Map Whoop Sleep data to SleepData entity
   *
   * Whoop has detailed sleep tracking with stages
   */
  mapSleepToSleepData(sleep: WhoopSleep, userId: string): Partial<SleepData> | null {
    if (!sleep.score) {
      this.logger.warn(`Sleep ${sleep.id} has no score, skipping sleep mapping`);
      return null;
    }

    const stages = sleep.score.stage_summary;

    // Convert milliseconds to minutes
    const totalInBedMinutes = Math.round(stages.total_in_bed_time_milli / 60000);
    const totalAwakeMinutes = Math.round(stages.total_awake_time_milli / 60000);
    const lightSleepMinutes = Math.round(stages.total_light_sleep_time_milli / 60000);
    const deepSleepMinutes = Math.round(stages.total_slow_wave_sleep_time_milli / 60000);
    const remSleepMinutes = Math.round(stages.total_rem_sleep_time_milli / 60000);

    const totalSleepMinutes = lightSleepMinutes + deepSleepMinutes + remSleepMinutes;

    // Calculate efficiency: (time asleep / time in bed) * 100
    const efficiency = totalInBedMinutes > 0
      ? Math.round((totalSleepMinutes / totalInBedMinutes) * 100)
      : 0;

    // Extract date from sleep start
    const dateOfSleep = new Date(sleep.start);
    dateOfSleep.setHours(0, 0, 0, 0);

    return {
      userId,
      dateOfSleep,
      duration: stages.total_in_bed_time_milli * 1000, // Convert to microseconds for consistency
      efficiency: sleep.score.sleep_efficiency_percentage || efficiency,
      startTime: new Date(sleep.start),
      endTime: new Date(sleep.end),
      minutesAsleep: totalSleepMinutes,
      minutesAwake: totalAwakeMinutes,
      minutesToFallAsleep: 0, // Whoop doesn't provide this explicitly
      minutesAfterWakeup: 0, // Whoop doesn't provide this explicitly
      timeInBed: totalInBedMinutes,
      type: sleep.nap ? 'nap' : 'stages', // Mark naps accordingly
      deepSleepMinutes,
      lightSleepMinutes,
      remSleepMinutes,
      wakeSleepMinutes: totalAwakeMinutes,
      sleepStages: {
        deep: deepSleepMinutes,
        light: lightSleepMinutes,
        rem: remSleepMinutes,
        wake: totalAwakeMinutes,
      },
      levels: {
        summary: {
          deep: { minutes: deepSleepMinutes, count: stages.sleep_cycle_count },
          light: { minutes: lightSleepMinutes, count: 0 },
          rem: { minutes: remSleepMinutes, count: 0 },
          wake: { minutes: totalAwakeMinutes, count: stages.disturbance_count },
        },
        data: [], // Whoop doesn't provide detailed level transitions via API
      },
      rawData: sleep,
      dataSource: 'whoop',
    };
  }

  /**
   * Map Whoop Workout data to ActivityData entity
   *
   * Workouts can supplement the daily cycle data with specific exercise sessions
   */
  mapWorkoutToActivity(workout: WhoopWorkout, userId: string): Partial<ActivityData> | null {
    if (!workout.score) {
      this.logger.warn(`Workout ${workout.id} has no score, skipping workout mapping`);
      return null;
    }

    // Extract date from workout start time
    const date = new Date(workout.start);
    date.setHours(0, 0, 0, 0);

    // Convert kilojoules to calories
    const calories = Math.round(workout.score.kilojoule * 0.239);

    // Estimate steps from distance if available
    const distanceKm = workout.score.distance_meter ? workout.score.distance_meter / 1000 : 0;
    const estimatedSteps = distanceKm > 0 ? Math.round(distanceKm * 1300) : 0; // ~1300 steps per km

    // Calculate active minutes from heart rate zones
    const zones = workout.score.zone_duration;
    const activeMinutes = Math.round(
      (zones.zone_three_milli + zones.zone_four_milli + zones.zone_five_milli) / 60000
    );

    return {
      userId,
      date,
      steps: estimatedSteps,
      distance: distanceKm,
      floors: 0,
      elevation: workout.score.altitude_gain_meter || 0,
      calories,
      activeMinutes,
      sedentaryMinutes: 0,
      lightlyActiveMinutes: Math.round(zones.zone_one_milli / 60000),
      fairlyActiveMinutes: Math.round(zones.zone_two_milli / 60000),
      veryActiveMinutes: activeMinutes,
      distances: distanceKm > 0 ? [{ activity: 'workout', distance: distanceKm }] : [],
      rawData: workout,
      dataSource: 'whoop',
    };
  }

  /**
   * Map Whoop Body Measurement to WeightData entity
   */
  mapBodyMeasurementToWeight(
    bodyMeasurement: WhoopBodyMeasurement,
    userId: string,
  ): Partial<WeightData> {
    const now = new Date();

    return {
      userId,
      date: now,
      weight: bodyMeasurement.weight_kilogram,
      bmi: undefined, // Calculate separately if needed
      fat: undefined, // Whoop doesn't provide body fat percentage
      unit: 'kg',
      loggedAt: now,
      source: 'whoop',
      rawData: bodyMeasurement,
    };
  }

  /**
   * Estimate steps from Whoop strain
   *
   * Strain ranges from 0-21:
   * - 0-5: Low activity (< 3000 steps)
   * - 5-10: Moderate activity (3000-7000 steps)
   * - 10-15: High activity (7000-12000 steps)
   * - 15-21: Very high activity (12000-20000 steps)
   */
  private estimateStepsFromStrain(strain: number): number {
    if (strain < 5) {
      return Math.round(strain * 600); // 0-3000 steps
    } else if (strain < 10) {
      return Math.round(3000 + (strain - 5) * 800); // 3000-7000 steps
    } else if (strain < 15) {
      return Math.round(7000 + (strain - 10) * 1000); // 7000-12000 steps
    } else {
      return Math.round(12000 + (strain - 15) * 1333); // 12000-20000 steps
    }
  }

  /**
   * Estimate active minutes from strain
   *
   * Higher strain indicates more intense/longer activity
   */
  private estimateActiveMinutesFromStrain(strain: number): number {
    // Rough estimate: strain of 10 = 30 minutes active
    return Math.round(strain * 3);
  }

  /**
   * Map recovery metrics to heart rate zones
   *
   * This is an approximation since Whoop doesn't directly provide HR zones
   */
  private mapRecoveryToHeartRateZones(recovery: WhoopRecovery, cycle: WhoopCycle): any[] {
    if (!cycle.score || !recovery.score) {
      return [];
    }

    const restingHR = recovery.score.resting_heart_rate;
    const maxHR = cycle.score.max_heart_rate;

    // Approximate zone boundaries
    const zone1Max = Math.round(restingHR + (maxHR - restingHR) * 0.5);
    const zone2Max = Math.round(restingHR + (maxHR - restingHR) * 0.6);
    const zone3Max = Math.round(restingHR + (maxHR - restingHR) * 0.7);

    return [
      {
        name: 'Out of Range',
        min: 30,
        max: zone1Max,
        minutes: 0,
        caloriesOut: 0,
      },
      {
        name: 'Fat Burn',
        min: zone1Max,
        max: zone2Max,
        minutes: 0,
        caloriesOut: 0,
      },
      {
        name: 'Cardio',
        min: zone2Max,
        max: zone3Max,
        minutes: 0,
        caloriesOut: 0,
      },
      {
        name: 'Peak',
        min: zone3Max,
        max: maxHR,
        minutes: 0,
        caloriesOut: 0,
      },
    ];
  }

  /**
   * Aggregate multiple workouts into a single daily activity summary
   *
   * When multiple workouts exist for a day, combine them
   */
  aggregateWorkoutsToDaily(
    workouts: Partial<ActivityData>[],
    cycleData?: Partial<ActivityData>,
  ): Partial<ActivityData> | null {
    if (workouts.length === 0 && !cycleData) {
      return null;
    }

    if (workouts.length === 0 && cycleData) {
      return cycleData;
    }

    // Start with cycle data or create base object
    const aggregated: Partial<ActivityData> = cycleData || {
      steps: 0,
      distance: 0,
      floors: 0,
      elevation: 0,
      calories: 0,
      activeMinutes: 0,
      sedentaryMinutes: 0,
      lightlyActiveMinutes: 0,
      fairlyActiveMinutes: 0,
      veryActiveMinutes: 0,
      distances: [],
      rawData: { workouts: [] },
      dataSource: 'whoop',
    };

    // Aggregate workout data
    for (const workout of workouts) {
      aggregated.steps = (aggregated.steps || 0) + (workout.steps || 0);
      aggregated.distance = (aggregated.distance || 0) + (workout.distance || 0);
      aggregated.elevation = (aggregated.elevation || 0) + (workout.elevation || 0);
      aggregated.calories = (aggregated.calories || 0) + (workout.calories || 0);
      aggregated.activeMinutes = (aggregated.activeMinutes || 0) + (workout.activeMinutes || 0);
      aggregated.lightlyActiveMinutes = (aggregated.lightlyActiveMinutes || 0) + (workout.lightlyActiveMinutes || 0);
      aggregated.fairlyActiveMinutes = (aggregated.fairlyActiveMinutes || 0) + (workout.fairlyActiveMinutes || 0);
      aggregated.veryActiveMinutes = (aggregated.veryActiveMinutes || 0) + (workout.veryActiveMinutes || 0);

      // Merge distances
      if (workout.distances && workout.distances.length > 0) {
        aggregated.distances = [...(aggregated.distances || []), ...workout.distances];
      }

      // Collect raw workout data
      if (!aggregated.rawData.workouts) {
        aggregated.rawData.workouts = [];
      }
      aggregated.rawData.workouts.push(workout.rawData);
    }

    return aggregated;
  }
}
