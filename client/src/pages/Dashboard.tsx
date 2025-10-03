import { Target, Flame, Footprints, Clock, Heart, Moon, Activity } from 'lucide-react';
import { useDashboardStats, useWeeklyActivity } from '../hooks/useFitnessData';
import Header from '../components/Header';
import { Sidebar, StatCard, Card, ChartBar, MetricItem } from '../components/ui';

const Dashboard = () => {
  const { data: stats, refetch: refetchStats } = useDashboardStats();
  const { data: weeklyData, refetch: refetchWeekly } = useWeeklyActivity();

  const handleSyncComplete = async () => {
    await Promise.all([refetchStats(), refetchWeekly()]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <Header
          title="Welcome back!"
          subtitle={new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          showSync={true}
          onSyncComplete={handleSyncComplete}
        />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Footprints}
              title="Steps"
              value={displayStats.steps}
              goal={displayStats.stepsGoal}
              unit="steps"
              color="from-blue-500 to-blue-600"
              subtitle="Today"
            />

            <StatCard
              icon={Flame}
              title="Calories"
              value={displayStats.calories}
              goal={displayStats.caloriesGoal}
              unit="kcal"
              color="from-orange-500 to-rose-600"
              subtitle="Today"
            />

            <StatCard
              icon={Clock}
              title="Active Minutes"
              value={displayStats.activeMinutes}
              goal={displayStats.activeMinutesGoal}
              unit="min"
              color="from-emerald-500 to-teal-600"
              subtitle="Today"
            />

            <StatCard
              icon={Heart}
              title="Heart Rate"
              value={displayStats.heartRate}
              unit="bpm"
              color="from-rose-500 to-pink-600"
              subtitle="Now"
              showProgress={false}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
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
                data={displayWeeklyData.map((d) => ({ label: d.day, value: d.steps }))}
                color="from-blue-500 to-blue-400"
                height={256}
              />

              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">
                    Avg: {Math.round(displayWeeklyData.reduce((acc, d) => acc + d.steps, 0) / displayWeeklyData.length).toLocaleString()} steps
                  </span>
                </div>
                <div className="text-gray-500">Last 7 days</div>
              </div>
            </Card>

            {/* Goals & Sleep Card */}
            <div className="space-y-6">
              {/* Today's Goals */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Today's Goals</h2>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <MetricItem
                    label="Steps"
                    value={displayStats.steps}
                    max={displayStats.stepsGoal}
                    color="from-blue-500 to-blue-600"
                  />

                  <MetricItem
                    label="Calories"
                    value={displayStats.calories}
                    max={displayStats.caloriesGoal}
                    color="from-orange-500 to-rose-600"
                  />

                  <MetricItem
                    label="Active Minutes"
                    value={displayStats.activeMinutes}
                    max={displayStats.activeMinutesGoal}
                    color="from-emerald-500 to-teal-600"
                  />
                </div>
              </Card>

              {/* Sleep Card */}
              <Card gradient="bg-gradient-to-br from-indigo-500 to-purple-600">
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
              </Card>
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

            {displayStats.steps === 0 && displayStats.calories === 0 && displayStats.activeMinutes === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activities yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Connect your device in Settings to start tracking
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Footprints className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Daily Activity</p>
                      <p className="text-sm text-gray-500">{displayStats.steps.toLocaleString()} steps today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{displayStats.calories} cal</p>
                    <p className="text-xs text-gray-500">{displayStats.activeMinutes} active min</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
