import api from './api';

// Types for API responses
export interface DashboardStats {
  steps: number;
  stepsGoal: number;
  calories: number;
  caloriesGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  heartRate: number;
  sleep: number;
  sleepGoal: number;
}

export interface ActivityStats {
  steps: number;
  stepsGoal: number;
  distance: number;
  distanceGoal: number;
  calories: number;
  caloriesGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  floors: number;
  floorsGoal: number;
}

export interface SleepStats {
  totalSleep: number;
  sleepGoal: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awake: number;
  sleepScore: number;
  bedtime: string;
  wakeTime: string;
  efficiency: number;
}

export interface HeartRateStats {
  restingHeartRate: number;
  currentHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  avgHeartRate: number;
}

export interface WeeklyData {
  day: string;
  steps: number;
  calories: number;
  activeMinutes?: number;
  sleep?: number;
  heartRate?: number;
}

export interface HourlyData {
  hour: number;
  steps: number;
  bpm?: number;
  calories?: number;
}

export const fitnessService = {
  // Dashboard data
  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const params = date ? { date } : {};
    const response = await api.get<DashboardStats>('/fitness-data/today-stats', { params });
    return response.data;
  },

  async getWeeklyActivity(): Promise<WeeklyData[]> {
    const response = await api.get<WeeklyData[]>('/fitness-data/summary/weekly');
    return response.data;
  },

  // Activity data
  async getActivityStats(date?: string): Promise<ActivityStats> {
    // If no date provided, get today's stats
    if (!date) {
      const response = await api.get<ActivityStats>('/fitness-data/activities/today');
      return response.data;
    }
    const params = { date };
    const response = await api.get<ActivityStats>('/fitness-data/activities', { params });
    return response.data;
  },

  async getHourlyActivity(date?: string): Promise<HourlyData[]> {
    const params = date ? { date } : {};
    const response = await api.get<HourlyData[]>('/fitness-data/activities', { params });
    return response.data;
  },

  // Sleep data
  async getSleepStats(date?: string): Promise<SleepStats> {
    const params = date ? { date } : {};
    const response = await api.get<SleepStats>('/fitness-data/sleep', { params });
    return response.data;
  },

  async getWeeklySleep(): Promise<WeeklyData[]> {
    const response = await api.get<WeeklyData[]>('/fitness-data/summary/sleep');
    return response.data;
  },

  // Heart rate data
  async getHeartRateStats(date?: string): Promise<HeartRateStats> {
    const params = date ? { date } : {};
    const response = await api.get<HeartRateStats>('/fitness-data/heart-rate', { params });
    return response.data;
  },

  async getHourlyHeartRate(date?: string): Promise<HourlyData[]> {
    const params = date ? { date } : {};
    const response = await api.get<HourlyData[]>('/fitness-data/heart-rate', { params });
    return response.data;
  },

  async getWeeklyRestingHR(): Promise<WeeklyData[]> {
    const response = await api.get<WeeklyData[]>('/fitness-data/heart-rate');
    return response.data;
  },

  // Analytics data
  async getAnalyticsSummary(period: 'week' | 'month' | 'year'): Promise<any> {
    const endpoint = period === 'week' ? '/fitness-data/summary/weekly' : '/fitness-data/summary/monthly';
    const response = await api.get(endpoint);
    return response.data;
  },

  async getTrends(period: 'week' | 'month' | 'year'): Promise<any> {
    const endpoint = period === 'week' ? '/fitness-data/summary/weekly' : '/fitness-data/summary/monthly';
    const response = await api.get(endpoint);
    return response.data;
  },

  async getGoalsProgress(): Promise<any> {
    const response = await api.get('/fitness-data/dashboard');
    return response.data;
  },

  async getAchievements(): Promise<any> {
    const response = await api.get('/fitness-data/dashboard');
    return response.data;
  },

  // Fitbit integration
  async connectFitbit(): Promise<{ authUrl: string }> {
    const response = await api.get<{ authUrl: string }>('/fitbit/auth');
    return response.data;
  },

  async disconnectFitbit(): Promise<void> {
    await api.delete('/fitbit/disconnect');
  },

  async syncFitbitData(): Promise<void> {
    await api.post('/fitbit/sync');
  },

  async getFitbitStatus(): Promise<{ connected: boolean; lastSync?: string }> {
    const response = await api.get<{ connected: boolean; lastSync?: string }>('/fitbit/status');
    return response.data;
  },

  // Sync fitness data from Fitbit
  async syncTodayData(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/fitness-data/sync/today');
    return response.data;
  },

  async syncAllData(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/fitness-data/sync');
    return response.data;
  },
};
