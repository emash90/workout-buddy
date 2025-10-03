import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Filter,
  Footprints,
  Flame,
  Clock,
  Target,
  Award,
  Zap,
  Moon,
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useFitnessData';
import { fitbitService } from '../services/fitbitService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import Header from '../components/Header';
import { Sidebar, EmptyState } from '../components/ui';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);

  const { data: dashboardStats, refetch: refetchDashboard } = useDashboardStats();

  const handleSyncComplete = async () => {
    await refetchDashboard();
  };

  useEffect(() => {
    loadFitbitStatus();
  }, []);

  const loadFitbitStatus = async () => {
    try {
      const status = await fitbitService.getConnectionStatus();
      setFitbitStatus(status);
    } catch (error) {
      console.error('Failed to load Fitbit status:', error);
    }
  };


  const defaultSummaryStats = {
    totalSteps: 0,
    totalCalories: 0,
    totalActiveMinutes: 0,
    avgSleep: 0,
    avgHeartRate: 0,
    workoutsCompleted: 0,
  };

  const summaryStats = {
    totalSteps: dashboardStats?.steps ?? defaultSummaryStats.totalSteps,
    totalCalories: dashboardStats?.calories ?? defaultSummaryStats.totalCalories,
    totalActiveMinutes: dashboardStats?.activeMinutes ?? defaultSummaryStats.totalActiveMinutes,
    avgSleep: dashboardStats?.sleep ?? defaultSummaryStats.avgSleep,
    avgHeartRate: dashboardStats?.heartRate ?? defaultSummaryStats.avgHeartRate,
    workoutsCompleted: defaultSummaryStats.workoutsCompleted,
  };


  const trends = [
    {
      name: 'Steps',
      current: 0,
      previous: 0,
      change: 0,
      icon: Footprints,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Calories',
      current: 0,
      previous: 0,
      change: 0,
      icon: Flame,
      color: 'from-orange-500 to-rose-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Active Minutes',
      current: 0,
      previous: 0,
      change: 0,
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Sleep Hours',
      current: 0,
      previous: 0,
      change: 0,
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const monthlyData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    sleep: 0,
  }));

  const goals = [
    { name: 'Daily Steps', target: 10000, achieved: 0, percentage: 0, color: 'blue' },
    { name: 'Weekly Workouts', target: 5, achieved: 0, percentage: 0, color: 'orange' },
    { name: 'Sleep Hours', target: 56, achieved: 0, percentage: 0, color: 'indigo' },
    { name: 'Active Minutes', target: 150, achieved: 0, percentage: 0, color: 'emerald' },
  ];

  const achievements = [
    { name: 'First Steps', description: 'Log your first activity', unlocked: false, date: null },
    { name: 'Week Warrior', description: 'Complete 7 days streak', unlocked: false, date: null },
    { name: '10K Club', description: 'Walk 10,000 steps in a day', unlocked: false, date: null },
    { name: 'Sleep Master', description: 'Get 8+ hours for 5 days', unlocked: false, date: null },
    { name: 'Calorie Crusher', description: 'Burn 3,000+ calories', unlocked: false, date: null },
    { name: 'Early Bird', description: 'Wake up before 6 AM for 7 days', unlocked: false, date: null },
  ];

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <span className="w-4 h-4">-</span>;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const maxValue = Math.max(...monthlyData.map((d) => d.steps), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <Header
          title="Analytics & Insights"
          subtitle="Comprehensive view of your fitness progress and trends"
          showSync={true}
          onSyncComplete={handleSyncComplete}
        />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Time Range & Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Year
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Custom Range</span>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Total Steps</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalSteps.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Calories Burned</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalCalories.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Active Minutes</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalActiveMinutes}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Avg Sleep</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.avgSleep}h</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Avg Heart Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.avgHeartRate} bpm
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Workouts</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.workoutsCompleted}
              </div>
            </div>
          </div>

          {/* Trends Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${trend.color} rounded-xl flex items-center justify-center`}
                  >
                    <trend.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor(trend.change)}`}>
                    {getTrendIcon(trend.change)}
                    <span>{Math.abs(trend.change)}%</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{trend.name}</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {trend.current.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  vs {trend.previous.toLocaleString()} last period
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Monthly Progress Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Progress Over Time</h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Metrics</option>
                  <option value="steps">Steps</option>
                  <option value="calories">Calories</option>
                  <option value="activeMinutes">Active Minutes</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>

              <div className="flex items-end justify-between h-64 space-x-1">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer relative"
                        style={{
                          height: `${(data.steps / maxValue) * 100}%`,
                          minHeight: '2px',
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Day {data.day}: {data.steps}
                        </div>
                      </div>
                    </div>
                    {index % 5 === 0 && (
                      <span className="text-xs text-gray-400 mt-2">{data.day}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Daily Progress</span>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Goals</h2>
                <Target className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {goal.achieved} / {goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-600 h-2 rounded-full transition-all`}
                        style={{ width: `${goal.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Customize Goals
                </button>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
                  <p className="text-sm text-gray-500">0 / {achievements.length} unlocked</p>
                </div>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        achievement.unlocked ? 'bg-amber-100' : 'bg-gray-200'
                      }`}
                    >
                      {achievement.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-bold mb-1 ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-amber-600 mt-1">
                          Unlocked {achievement.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Weekly Performance</h3>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Best Day</span>
                  <span className="font-bold">No data yet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Consistency</span>
                  <span className="font-bold">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Improvement</span>
                  <span className="font-bold">0%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Fitness Score</h3>
                <Zap className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">0</div>
                <div className="text-sm opacity-90">out of 100</div>
              </div>
              <p className="text-sm opacity-90">
                {fitbitStatus?.connected
                  ? 'Your device is connected. Your fitness score will be calculated once sufficient data is collected from your activities, sleep, and heart rate.'
                  : 'Go to Settings to connect your fitness device and calculate your fitness score based on activity, sleep, and heart rate data.'}
              </p>
            </div>
          </div>

          {/* Empty State */}
          <EmptyState
            icon={BarChart3}
            title="No Analytics Data Yet"
            description={
              fitbitStatus?.connected
                ? 'Your device is connected. Analytics and trends will appear here once you have sufficient historical data. Keep using your device to track your fitness journey.'
                : 'Go to Settings to connect your fitness device and start tracking detailed analytics, trends, and insights about your fitness journey.'
            }
            iconColor="bg-blue-100 text-blue-600"
          />
        </div>
      </main>
    </div>
  );
};

export default Analytics;
