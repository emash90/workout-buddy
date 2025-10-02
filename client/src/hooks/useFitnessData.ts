import { useEffect, useState } from 'react';
import { fitnessService } from '../services/fitnessService';
import type {
  DashboardStats,
  ActivityStats,
  SleepStats,
  HeartRateStats,
  WeeklyData,
  HourlyData,
} from '../services/fitnessService';

interface UseFitnessDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(date?: string): UseFitnessDataResult<DashboardStats> {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getDashboardStats(date);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useWeeklyActivity(): UseFitnessDataResult<WeeklyData[]> {
  const [data, setData] = useState<WeeklyData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getWeeklyActivity();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching weekly activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

export function useActivityStats(date?: string): UseFitnessDataResult<ActivityStats> {
  const [data, setData] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getActivityStats(date);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching activity stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useHourlyActivity(date?: string): UseFitnessDataResult<HourlyData[]> {
  const [data, setData] = useState<HourlyData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getHourlyActivity(date);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching hourly activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useSleepStats(date?: string): UseFitnessDataResult<SleepStats> {
  const [data, setData] = useState<SleepStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getSleepStats(date);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching sleep stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useHeartRateStats(date?: string): UseFitnessDataResult<HeartRateStats> {
  const [data, setData] = useState<HeartRateStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getHeartRateStats(date);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching heart rate stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useFitbitStatus(): UseFitnessDataResult<{ connected: boolean; lastSync?: string }> {
  const [data, setData] = useState<{ connected: boolean; lastSync?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fitnessService.getFitbitStatus();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching Fitbit status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}
