import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  Moon,
  Target,
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
} from 'lucide-react';
import { useDashboardStats, useWeeklyActivity } from '../hooks/useFitnessData';
import { authService } from '../services/auth.service';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyActivity();

  const handleLogout = () => {
    authService.logout();
  };

  // Default values when data is null or loading
  const defaultStats = {
    steps: 0,
    stepsGoal: 10000,
    calories: 0,
    caloriesGoal: 2500,
    activeMinutes: 0,
    activeMinutesGoal: 30,
    heartRate: 0,
    sleep: 0,
    sleepGoal: 8,
  };

  const displayStats = {
    steps: stats?.steps ?? defaultStats.steps,
    stepsGoal: stats?.stepsGoal ?? defaultStats.stepsGoal,
    calories: stats?.calories ?? defaultStats.calories,
    caloriesGoal: stats?.caloriesGoal ?? defaultStats.caloriesGoal,
    activeMinutes: stats?.activeMinutes ?? defaultStats.activeMinutes,
    activeMinutesGoal: stats?.activeMinutesGoal ?? defaultStats.activeMinutesGoal,
    heartRate: stats?.heartRate ?? defaultStats.heartRate,
    sleep: stats?.sleep ?? defaultStats.sleep,
    sleepGoal: stats?.sleepGoal ?? defaultStats.sleepGoal,
  };

  const defaultWeeklyData = [
    { day: 'Mon', steps: 0, calories: 0 },
    { day: 'Tue', steps: 0, calories: 0 },
    { day: 'Wed', steps: 0, calories: 0 },
    { day: 'Thu', steps: 0, calories: 0 },
    { day: 'Fri', steps: 0, calories: 0 },
    { day: 'Sat', steps: 0, calories: 0 },
    { day: 'Sun', steps: 0, calories: 0 },
  ];

  const displayWeeklyData = Array.isArray(weeklyData) ? weeklyData : defaultWeeklyData;

  const maxSteps = Math.max(...displayWeeklyData.map((d) => d.steps), 1);

  const isLoading = statsLoading || weeklyLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Workout Buddy
            </span>
          </div>

          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-blue-50 text-blue-600"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </Link>

            <Link
              to="/activity"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Activity className="w-5 h-5" />
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
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Steps Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {displayStats.steps.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                of {displayStats.stepsGoal.toLocaleString()} steps
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(displayStats.steps / displayStats.stepsGoal) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {displayStats.calories.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                of {displayStats.caloriesGoal.toLocaleString()} kcal
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(displayStats.calories / displayStats.caloriesGoal) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Active Minutes Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {displayStats.activeMinutes} min
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                of {displayStats.activeMinutesGoal} min goal
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(displayStats.activeMinutes / displayStats.activeMinutesGoal) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Heart Rate Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">Now</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {displayStats.heartRate} bpm
              </h3>
              <p className="text-sm text-gray-500 mb-3">Resting heart rate</p>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-rose-200 rounded"></div>
                <div className="w-1 h-6 bg-rose-300 rounded"></div>
                <div className="w-1 h-5 bg-rose-400 rounded"></div>
                <div className="w-1 h-7 bg-rose-500 rounded"></div>
                <div className="w-1 h-4 bg-rose-400 rounded"></div>
                <div className="w-1 h-6 bg-rose-500 rounded"></div>
                <div className="w-1 h-8 bg-rose-600 rounded"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Weekly Activity
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                    Steps
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    Calories
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between h-64 space-x-3">
                {displayWeeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{
                          height: `${(data.steps / maxSteps) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                      {data.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">
                    Avg: {Math.round(displayWeeklyData.reduce((acc, d) => acc + d.steps, 0) / displayWeeklyData.length).toLocaleString()} steps
                  </span>
                </div>
                <div className="text-gray-500">Last 7 days</div>
              </div>
            </div>

            {/* Goals & Sleep Card */}
            <div className="space-y-6">
              {/* Today's Goals */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Today's Goals
                  </h2>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Steps
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round((displayStats.steps / displayStats.stepsGoal) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(displayStats.steps / displayStats.stepsGoal) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Calories
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        {Math.round((displayStats.calories / displayStats.caloriesGoal) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full"
                        style={{
                          width: `${(displayStats.calories / displayStats.caloriesGoal) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Active Minutes
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {Math.round((displayStats.activeMinutes / displayStats.activeMinutesGoal) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                        style={{
                          width: `${(displayStats.activeMinutes / displayStats.activeMinutesGoal) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sleep Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-sm text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Last Night's Sleep</h2>
                  <Moon className="w-5 h-5" />
                </div>

                <div className="mb-4">
                  <div className="text-4xl font-bold mb-1">
                    {displayStats.sleep}h
                  </div>
                  <p className="text-indigo-100 text-sm">
                    {displayStats.sleep >= displayStats.sleepGoal ? 'Great sleep!' : displayStats.sleep > 0 ? `${displayStats.sleepGoal - displayStats.sleep}h below goal` : 'No data'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100">Deep Sleep</span>
                    <span className="font-medium">0h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100">REM Sleep</span>
                    <span className="font-medium">0h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-100">Light Sleep</span>
                    <span className="font-medium">0h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Activities
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No activities yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Connect your Fitbit to start tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
