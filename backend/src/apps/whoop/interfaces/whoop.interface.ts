/**
 * Whoop API Interface Definitions
 * Based on Whoop API v2 documentation
 */

// OAuth Token Response
export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: string; // "Bearer"
  scope: string;
  user_id: string;
}

// User Profile
export interface WhoopUserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// Cycle (Recovery, Day Strain, Sleep)
export interface WhoopCycle {
  id: number;
  user_id: number;
  created_at: string; // ISO 8601
  updated_at: string;
  start: string; // ISO 8601
  end: string | null;
  timezone_offset: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: {
    strain: number; // 0-21
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  } | null;
}

// Recovery
export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: {
    user_calibrating: boolean;
    recovery_score: number; // 0-100
    resting_heart_rate: number;
    hrv_rmssd_milli: number; // Heart Rate Variability
    spo2_percentage: number | null;
    skin_temp_celsius: number | null;
  } | null;
}

// Sleep
export interface WhoopSleep {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone_offset: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  } | null;
}

// Workout
export interface WhoopWorkout {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number | null;
    altitude_gain_meter: number | null;
    altitude_change_meter: number | null;
    zone_duration: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  } | null;
}

// Body Measurement (Weight)
export interface WhoopBodyMeasurement {
  height_meter: number;
  weight_kilogram: number;
  max_heart_rate: number;
}

// Paginated Response
export interface WhoopPaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}

// API Response wrapper
export interface WhoopApiResponse<T> {
  data: T;
}

// Error Response
export interface WhoopErrorResponse {
  error: string;
  error_description?: string;
}
