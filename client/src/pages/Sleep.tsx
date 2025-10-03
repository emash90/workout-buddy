import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  Moon,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Home,
  Settings,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Sunrise,
  Sunset,
  CloudMoon,
  Info,
  Star,
} from 'lucide-react';
import { useSleepStats } from '../hooks/useFitnessData';
import { authService } from '../services/auth.service';
import { fitbitService } from '../services/fitbitService';
import type { FitbitConnectionStatus } from '../services/fitbitService';

const Sleep = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);

  const { data: sleepStats, isLoading } = useSleepStats();

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

  const handleLogout = () => {
    authService.logout();
  };

  const defaultSleepStats = {
    totalSleep: 0,
    sleepGoal: 8,
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awake: 0,
    sleepScore: 0,
    bedtime: '--:--',
    wakeTime: '--:--',
    efficiency: 0,
  };

  const todayStats = {
    totalSleep: sleepStats?.totalSleep ?? defaultSleepStats.totalSleep,
    sleepGoal: sleepStats?.sleepGoal ?? defaultSleepStats.sleepGoal,
    deepSleep: sleepStats?.deepSleep ?? defaultSleepStats.deepSleep,
    lightSleep: sleepStats?.lightSleep ?? defaultSleepStats.lightSleep,
    remSleep: sleepStats?.remSleep ?? defaultSleepStats.remSleep,
    awake: sleepStats?.awake ?? defaultSleepStats.awake,
    sleepScore: sleepStats?.sleepScore ?? defaultSleepStats.sleepScore,
    bedtime: sleepStats?.bedtime ?? defaultSleepStats.bedtime,
    wakeTime: sleepStats?.wakeTime ?? defaultSleepStats.wakeTime,
    efficiency: sleepStats?.efficiency ?? defaultSleepStats.efficiency,
  };

  const weeklyData = [
    { day: 'Mon', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Tue', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Wed', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Thu', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Fri', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Sat', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
    { day: 'Sun', hours: 0, score: 0, deep: 0, light: 0, rem: 0 },
  ];

  const maxHours = 10;

  const sleepInsights = [
    {
      title: 'Sleep Duration',
      description: 'Connect your device to track sleep duration',
      icon: Clock,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Sleep Quality',
      description: 'Monitor your sleep stages and quality',
      icon: Star,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Sleep Pattern',
      description: 'Analyze your sleep consistency',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2 mb-8">
            <Activity className="w-8 h-8 text-blue-600" />
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
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Activity</span>
            </Link>

            <Link
              to="/sleep"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-blue-50 text-blue-600"
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
              <h1 className="text-2xl font-bold text-gray-900">Sleep Tracking</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor your sleep quality and patterns
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
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Last Night
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'month'
                    ? 'bg-indigo-600 text-white'
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

          {/* Sleep Score Card - Featured */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-xl text-white mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium opacity-90 mb-2">Last Night's Sleep</h2>
                <div className="flex items-baseline space-x-3">
                  <span className="text-6xl font-bold">{todayStats.totalSleep}</span>
                  <span className="text-2xl font-medium opacity-90">hours</span>
                </div>
              </div>
              <div className="text-center bg-white/20 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <div className="text-xs opacity-90 mb-1">Sleep Score</div>
                <div className="text-4xl font-bold">{todayStats.sleepScore}</div>
                <div className="text-xs opacity-90 mt-1">/ 100</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Sunset className="w-5 h-5" />
                  <span className="text-sm opacity-90">Bedtime</span>
                </div>
                <div className="text-2xl font-bold">{todayStats.bedtime}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Sunrise className="w-5 h-5" />
                  <span className="text-sm opacity-90">Wake Time</span>
                </div>
                <div className="text-2xl font-bold">{todayStats.wakeTime}</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Sleep Efficiency</span>
                <span className="text-sm font-bold">{todayStats.efficiency}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${todayStats.efficiency}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sleep Stages Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Sleep Stages</h2>

              <div className="space-y-6">
                {/* Deep Sleep */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Deep Sleep</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {todayStats.deepSleep}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${(todayStats.deepSleep / todayStats.totalSleep) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Essential for physical recovery and memory
                  </p>
                </div>

                {/* REM Sleep */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-600 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">REM Sleep</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {todayStats.remSleep}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${(todayStats.remSleep / todayStats.totalSleep) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Important for learning and emotional processing
                  </p>
                </div>

                {/* Light Sleep */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Light Sleep</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {todayStats.lightSleep}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-300 h-3 rounded-full transition-all"
                      style={{
                        width: `${(todayStats.lightSleep / todayStats.totalSleep) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transition between sleep stages
                  </p>
                </div>

                {/* Awake Time */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Awake</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {todayStats.awake}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-300 h-3 rounded-full transition-all"
                      style={{
                        width: `${(todayStats.awake / todayStats.totalSleep) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time spent awake during sleep</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recommended sleep</span>
                  <span className="font-medium text-gray-900">7-9 hours</span>
                </div>
              </div>
            </div>

            {/* Sleep Insights */}
            <div className="space-y-6">
              {sleepInsights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center mb-3`}
                  >
                    <insight.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-xs text-gray-500">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Sleep Pattern */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Weekly Sleep Pattern</h2>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-gray-600">Sleep Hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span className="text-gray-600">Sleep Score</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between h-64 space-x-4">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end h-full space-y-1">
                    {/* Sleep Hours Bar */}
                    <div className="relative group">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500 cursor-pointer"
                        style={{
                          height: `${(data.hours / maxHours) * 100}%`,
                          minHeight: '4px',
                        }}
                      ></div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {data.hours}h
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">{data.day}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Avg Sleep</div>
                <div className="text-xl font-bold text-gray-900">0h</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Avg Score</div>
                <div className="text-xl font-bold text-gray-900">0</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Best Night</div>
                <div className="text-xl font-bold text-gray-900">--</div>
              </div>
            </div>
          </div>

          {/* Sleep Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CloudMoon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sleep Better Tonight</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Maintain a consistent sleep schedule, even on weekends</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Create a relaxing bedtime routine to wind down</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Keep your bedroom cool, dark, and quiet</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Avoid caffeine and heavy meals before bedtime</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Moon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {fitbitStatus?.connected ? 'No Sleep Data for Today' : 'No Sleep Data Yet'}
              </h3>
              <p className="text-gray-500">
                {fitbitStatus?.connected
                  ? 'Your device is connected. Sleep data will appear here once it syncs. Check back after your next sleep session.'
                  : 'Go to Settings to connect your fitness device and start tracking your sleep patterns, quality, and get personalized insights.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sleep;
