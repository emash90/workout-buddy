import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  Heart,
  Moon,
  TrendingUp,
  Calendar,
  Flame,
  Footprints,
  Clock,
  BarChart3,
  Home,
  Settings,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Award,
  Zap,
  MapPin,
  ArrowUp,
  RefreshCw,
} from 'lucide-react';
import { useActivityStats, useHourlyActivity } from '../hooks/useFitnessData';
import { authService } from '../services/auth.service';
import { fitbitService } from '../services/fitbitService';
import type { FitbitConnectionStatus } from '../services/fitbitService';

const Activity = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const { data: activityStats } = useActivityStats();
  const { data: hourlyData } = useHourlyActivity();

  useEffect(() => {
    loadFitbitStatus();
  }, []);

  const loadFitbitStatus = async () => {
    try {
      const status = await fitbitService.getConnectionStatus();
      setFitbitStatus(status);
    } catch (error) {
      console.error('Failed to load Fitbit status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
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

  const todayStats = {
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

  const maxHourlySteps = Math.max(...hourlyActivity.map((h) => h.steps), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2 mb-8">
            <ActivityIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Workout Buddy
            </span>
          </Link>

          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </Link>

            <Link
              to="/activity"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-blue-50 text-blue-600"
            >
              <ActivityIcon className="w-5 h-5" />
              <span className="font-medium">Activity</span>
            </Link>

            <Link
              to="/sleep"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Sleep</span>
            </Link>

            <Link
              to="/heart-rate"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Heart Rate</span>
            </Link>

            <Link
              to="/analytics"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <Link
              to="/settings"
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Tracking</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor your daily movement and active minutes
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">User</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeRange('day')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Today
              </button>
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
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Custom Range</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Steps Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Steps</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayStats.steps.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {todayStats.stepsGoal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(todayStats.steps / todayStats.stepsGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Distance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Distance</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayStats.distance.toFixed(1)} km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {todayStats.distanceGoal} km
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${(todayStats.distance / todayStats.distanceGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Calories</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayStats.calories.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {todayStats.caloriesGoal.toLocaleString()} kcal
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full transition-all"
                    style={{ width: `${(todayStats.calories / todayStats.caloriesGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Active Minutes Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Active Minutes</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayStats.activeMinutes} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {todayStats.activeMinutesGoal} min
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(todayStats.activeMinutes / todayStats.activeMinutesGoal) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Floors Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Floors Climbed</h3>
                    <p className="text-2xl font-bold text-gray-900">{todayStats.floors}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {todayStats.floorsGoal} floors
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(todayStats.floors / todayStats.floorsGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-sm text-white">
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

              <div className="flex items-end justify-between h-48 space-x-1">
                {hourlyActivity.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{
                          height: `${(data.steps / maxHourlySteps) * 100}%`,
                          minHeight: '2px',
                        }}
                      ></div>
                    </div>
                    {index % 4 === 0 && (
                      <span className="text-xs text-gray-400 mt-2">{data.hour}h</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Most active hour: <span className="font-medium text-gray-900">No data yet</span>
                </p>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Weekly Summary</h2>

              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {day.steps.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(day.steps / todayStats.stepsGoal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Weekly Average</span>
                  <span className="text-lg font-bold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State for No Data - Only show if no steps data */}
          {todayStats.steps === 0 && (
            <div className="mt-6 bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {fitbitStatus?.connected ? 'No Data for Today' : 'No Activity Data Yet'}
                </h3>
                <p className="text-gray-500">
                  {fitbitStatus?.connected
                    ? 'Your device is connected. Data will appear here once it syncs. Try refreshing or check back later.'
                    : 'Go to Settings to connect your fitness device and start tracking your daily activities, steps, and calories burned.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Activity;
