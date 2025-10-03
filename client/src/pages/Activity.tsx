import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Flame,
  Footprints,
  Clock,
  Award,
  Zap,
  MapPin,
} from 'lucide-react';
import { useActivityStats, useHourlyActivity } from '../hooks/useFitnessData';
import { fitbitService } from '../services/fitbitService';
import { fitnessService } from '../services/fitnessService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import Header from '../components/Header';
import { Sidebar, StatCard, Card, CardFooter, EmptyState, TimeRangeSelector, ChartBar, MetricItem } from '../components/ui';

const Activity = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);
  const [aggregatedStats, setAggregatedStats] = useState<any>(null);

  const { data: activityStats, refetch: refetchActivity } = useActivityStats();
  const { data: hourlyData, refetch: refetchHourly } = useHourlyActivity();

  const handleSyncComplete = async () => {
    // Refetch data after sync
    await Promise.all([refetchActivity(), refetchHourly()]);
  };

  useEffect(() => {
    loadFitbitStatus();
  }, []);

  useEffect(() => {
    loadAggregatedStats();
  }, [timeRange]);

  const loadFitbitStatus = async () => {
    try {
      const status = await fitbitService.getConnectionStatus();
      setFitbitStatus(status);
    } catch (error) {
      console.error('Failed to load Fitbit status:', error);
    }
  };

  const loadAggregatedStats = async () => {
    try {
      if (timeRange === 'week') {
        const data = await fitnessService.getWeeklyActivityStats();
        setAggregatedStats(data);
      } else if (timeRange === 'month') {
        const data = await fitnessService.getMonthlyActivityStats();
        setAggregatedStats(data);
      } else {
        setAggregatedStats(null);
      }
    } catch (error) {
      console.error('Failed to load aggregated stats:', error);
    }
  };

  const defaultActivityStats = {
    steps: 0,
    stepsGoal: 10000,
    distance: 0,
    distanceGoal: 8,
    calories: 0,
    caloriesGoal: 2500,
    activeMinutes: 0,
    activeMinutesGoal: 30,
    floors: 0,
    floorsGoal: 10,
  };

  // Use aggregated stats for week/month, or today's stats for day
  const displayStats = timeRange === 'day' ? {
    steps: activityStats?.steps ?? defaultActivityStats.steps,
    stepsGoal: activityStats?.stepsGoal ?? defaultActivityStats.stepsGoal,
    distance: activityStats?.distance ?? defaultActivityStats.distance,
    distanceGoal: activityStats?.distanceGoal ?? defaultActivityStats.distanceGoal,
    calories: activityStats?.calories ?? defaultActivityStats.calories,
    caloriesGoal: activityStats?.caloriesGoal ?? defaultActivityStats.caloriesGoal,
    activeMinutes: activityStats?.activeMinutes ?? defaultActivityStats.activeMinutes,
    activeMinutesGoal: activityStats?.activeMinutesGoal ?? defaultActivityStats.activeMinutesGoal,
    floors: activityStats?.floors ?? defaultActivityStats.floors,
    floorsGoal: activityStats?.floorsGoal ?? defaultActivityStats.floorsGoal,
  } : {
    steps: aggregatedStats?.totalSteps ?? 0,
    stepsGoal: timeRange === 'week' ? 70000 : 300000, // 10k * 7 or 10k * 30
    distance: aggregatedStats?.totalDistance ?? 0,
    distanceGoal: timeRange === 'week' ? 56 : 240, // 8km * 7 or 8km * 30
    calories: aggregatedStats?.totalCalories ?? 0,
    caloriesGoal: timeRange === 'week' ? 17500 : 75000, // 2500 * 7 or 2500 * 30
    activeMinutes: aggregatedStats?.totalActiveMinutes ?? 0,
    activeMinutesGoal: timeRange === 'week' ? 210 : 900, // 30 * 7 or 30 * 30
    floors: aggregatedStats?.totalFloors ?? 0,
    floorsGoal: timeRange === 'week' ? 70 : 300, // 10 * 7 or 10 * 30
  };

  const weeklyProgress = [
    { day: 'Mon', steps: 0, distance: 0, calories: 0 },
    { day: 'Tue', steps: 0, distance: 0, calories: 0 },
    { day: 'Wed', steps: 0, distance: 0, calories: 0 },
    { day: 'Thu', steps: 0, distance: 0, calories: 0 },
    { day: 'Fri', steps: 0, distance: 0, calories: 0 },
    { day: 'Sat', steps: 0, distance: 0, calories: 0 },
    { day: 'Sun', steps: 0, distance: 0, calories: 0 },
  ];

  const achievements = [
    { id: 1, name: 'First 10K Steps', icon: '👟', unlocked: false },
    { id: 2, name: 'Week Warrior', icon: '🔥', unlocked: false },
    { id: 3, name: 'Early Bird', icon: '🌅', unlocked: false },
    { id: 4, name: 'Night Owl', icon: '🦉', unlocked: false },
  ];

  const defaultHourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    steps: 0,
  }));

  const hourlyActivity = Array.isArray(hourlyData) ? hourlyData : defaultHourlyActivity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <Header
          title="Activity Tracking"
          subtitle="Monitor your daily movement and active minutes"
          showSync={true}
          onSyncComplete={handleSyncComplete}
        />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between mb-6">
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: 'day', label: 'Today' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
            />

            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Custom Range</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Footprints}
              title="Steps"
              value={displayStats.steps}
              goal={displayStats.stepsGoal}
              unit="steps"
              color="from-blue-500 to-blue-600"
            />

            <StatCard
              icon={MapPin}
              title="Distance"
              value={displayStats.distance.toFixed(1)}
              goal={displayStats.distanceGoal}
              unit="km"
              color="from-emerald-500 to-teal-600"
            />

            <StatCard
              icon={Flame}
              title="Calories"
              value={displayStats.calories}
              goal={displayStats.caloriesGoal}
              unit="kcal"
              color="from-orange-500 to-rose-600"
            />

            <StatCard
              icon={Clock}
              title="Active Minutes"
              value={displayStats.activeMinutes}
              goal={displayStats.activeMinutesGoal}
              unit="min"
              color="from-purple-500 to-pink-600"
            />

            <StatCard
              icon={TrendingUp}
              title="Floors Climbed"
              value={displayStats.floors}
              goal={displayStats.floorsGoal}
              unit="floors"
              color="from-cyan-500 to-blue-600"
            />

            <Card gradient="bg-gradient-to-br from-amber-500 to-orange-600">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-8 h-8" />
                <div>
                  <h3 className="text-sm font-medium opacity-90">Achievements</h3>
                  <p className="text-2xl font-bold">0 / {achievements.length}</p>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">Start tracking to unlock badges!</p>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                View All Achievements
              </button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Activity Chart */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Hourly Activity</h2>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                    Steps
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    Calories
                  </button>
                </div>
              </div>

              <ChartBar
                data={hourlyActivity.map((h) => ({
                  label: h.hour % 4 === 0 ? `${h.hour}h` : '',
                  value: h.steps
                }))}
                color="from-blue-500 to-blue-400"
                height={192}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Most active hour: <span className="font-medium text-gray-900">No data yet</span>
                </p>
              </div>
            </Card>

            {/* Weekly Summary */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Weekly Summary</h2>

              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <MetricItem
                    key={index}
                    label={day.day}
                    value={day.steps}
                    max={displayStats.stepsGoal}
                    color="from-blue-500 to-blue-600"
                  />
                ))}
              </div>

              <CardFooter>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Weekly Average</span>
                  <span className="text-lg font-bold text-gray-900">0</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Empty State for No Data - Only show if no steps data */}
          {displayStats.steps === 0 && (
            <EmptyState
              icon={Zap}
              title={fitbitStatus?.connected ? 'No Data for Today' : 'No Activity Data Yet'}
              description={
                fitbitStatus?.connected
                  ? 'Your device is connected. Data will appear here once it syncs. Try refreshing or check back later.'
                  : 'Go to Settings to connect your fitness device and start tracking your daily activities, steps, and calories burned.'
              }
              iconColor="bg-blue-100 text-blue-600"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Activity;
