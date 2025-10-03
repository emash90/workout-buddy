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
import { useActivityStats, useWeeklyActivity } from '../hooks/useFitnessData';
import { fitbitService } from '../services/fitbitService';
import { fitnessService } from '../services/fitnessService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import Header from '../components/Header';
import { Sidebar, StatCard, Card, CardFooter, EmptyState, TimeRangeSelector, MetricItem } from '../components/ui';

const Activity = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);
  const [aggregatedStats, setAggregatedStats] = useState<any>(null);

  const { data: activityStats, refetch: refetchActivity } = useActivityStats();
  const { data: weeklyData, refetch: refetchWeekly } = useWeeklyActivity();

  const handleSyncComplete = async () => {
    // Refetch data after sync
    await Promise.all([refetchActivity(), refetchWeekly()]);
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

  // Use actual weekly data from API
  const defaultWeeklyProgress = [
    { day: 'Mon', steps: 0, distance: 0, calories: 0 },
    { day: 'Tue', steps: 0, distance: 0, calories: 0 },
    { day: 'Wed', steps: 0, distance: 0, calories: 0 },
    { day: 'Thu', steps: 0, distance: 0, calories: 0 },
    { day: 'Fri', steps: 0, distance: 0, calories: 0 },
    { day: 'Sat', steps: 0, distance: 0, calories: 0 },
    { day: 'Sun', steps: 0, distance: 0, calories: 0 },
  ];

  const weeklyProgress = Array.isArray(weeklyData)
    ? weeklyData.map(d => ({
        day: d.day,
        steps: d.steps,
        distance: 0, // Distance not in weekly data - could be added to backend
        calories: d.calories,
      }))
    : defaultWeeklyProgress;

  // Calculate current streak (consecutive days from end of week backwards)
  const calculateCurrentStreak = () => {
    const goalSteps = displayStats.stepsGoal || 10000;
    let streak = 0;

    // Start from the most recent day and go backwards
    for (let i = weeklyProgress.length - 1; i >= 0; i--) {
      if (weeklyProgress[i].steps >= goalSteps) {
        streak++;
      } else {
        break; // Stop at first day that didn't meet goal
      }
    }

    return streak;
  };

  const currentStreak = calculateCurrentStreak();
  const daysHitGoal = weeklyProgress.filter(d => d.steps >= (displayStats.stepsGoal || 10000)).length;

  const achievements = [
    { id: 1, name: 'First 10K Steps', icon: '👟', unlocked: false },
    { id: 2, name: 'Week Warrior', icon: '🔥', unlocked: false },
    { id: 3, name: 'Early Bird', icon: '🌅', unlocked: false },
    { id: 4, name: 'Night Owl', icon: '🦉', unlocked: false },
  ];


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
            {/* Activity Milestones & Achievements */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Milestones & Achievements</h2>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Current Streak</span>
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <div className="text-3xl font-bold text-blue-900">
                      {currentStreak}
                    </div>
                    <div className="text-sm text-blue-700">
                      {currentStreak === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {currentStreak > 0
                      ? 'Keep it going! 🔥'
                      : `Hit goal to start streak (${daysHitGoal}/7 days this week)`
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">Best Day</span>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900">
                    {Math.max(...weeklyProgress.map(d => d.steps), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    {Math.max(...weeklyProgress.map(d => d.steps)) > 0
                      ? 'steps this week'
                      : 'No steps logged yet'
                    }
                  </p>
                </div>
              </div>

              {/* Achievement Badges */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* First Steps Achievement */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    displayStats.steps > 0
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        displayStats.steps > 0 ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        👟
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          displayStats.steps > 0 ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          First Steps
                        </p>
                        <p className="text-xs text-gray-500">
                          {displayStats.steps > 0 ? 'Unlocked!' : 'Start walking'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 10K Steps Achievement */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    displayStats.steps >= 10000
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        displayStats.steps >= 10000 ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        🏆
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          displayStats.steps >= 10000 ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          10K Master
                        </p>
                        <p className="text-xs text-gray-500">
                          {displayStats.steps >= 10000 ? 'Unlocked!' : `${(10000 - displayStats.steps).toLocaleString()} steps to go`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Week Warrior Achievement */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    daysHitGoal >= 5
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        daysHitGoal >= 5
                          ? 'bg-purple-100'
                          : 'bg-gray-200'
                      }`}>
                        🔥
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          daysHitGoal >= 5
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}>
                          Week Warrior
                        </p>
                        <p className="text-xs text-gray-500">
                          {daysHitGoal >= 5
                            ? 'Unlocked! 5+ goal days'
                            : `Hit goal ${5 - daysHitGoal} more days (${daysHitGoal}/5)`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Crusher Achievement */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    displayStats.calories >= 3000
                      ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        displayStats.calories >= 3000 ? 'bg-orange-100' : 'bg-gray-200'
                      }`}>
                        🔥
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          displayStats.calories >= 3000 ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Calorie Crusher
                        </p>
                        <p className="text-xs text-gray-500">
                          {displayStats.calories >= 3000
                            ? 'Unlocked!'
                            : `${(3000 - displayStats.calories).toLocaleString()} kcal to go`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
