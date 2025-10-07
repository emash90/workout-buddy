import { useState, useEffect } from 'react';
import { Target, Flame, Footprints, Clock, Heart, Moon, Activity, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { useDashboardStats, useWeeklyActivity } from '../hooks/useFitnessData';
import Header from '../components/Header';
import { Sidebar, StatCard, Card, ChartBar, MetricItem } from '../components/ui';
import aiService from '../services/aiService';
import type { DailyInsight, Insight } from '../services/aiService';

const Dashboard = () => {
  const { data: stats, refetch: refetchStats } = useDashboardStats();
  const { data: weeklyData, refetch: refetchWeekly } = useWeeklyActivity();
  const [weeklyMetric, setWeeklyMetric] = useState<'steps' | 'calories'>('steps');
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [monthlyInsights, setMonthlyInsights] = useState<Insight | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [daily, monthly] = await Promise.all([
          aiService.getDailyInsight().catch(err => {
            console.error('Failed to fetch daily insight:', err);
            return null;
          }),
          aiService.getInsights('month').catch(err => {
            console.error('Failed to fetch monthly insights:', err);
            return null;
          })
        ]);

        if (daily) setDailyInsight(daily);
        if (monthly) setMonthlyInsights(monthly);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      }
    };

    fetchInsights();
  }, []);

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
                  <button
                    onClick={() => setWeeklyMetric('steps')}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      weeklyMetric === 'steps'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Steps
                  </button>
                  <button
                    onClick={() => setWeeklyMetric('calories')}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      weeklyMetric === 'calories'
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Calories
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <ChartBar
                  data={displayWeeklyData.map((d) => ({
                    label: d.day,
                    value: weeklyMetric === 'steps' ? d.steps : d.calories,
                  }))}
                  color={weeklyMetric === 'steps' ? 'from-blue-500 to-blue-400' : 'from-orange-500 to-rose-600'}
                  height={256}
                  showGridLines={true}
                  showValues={false}
                  showTooltip={true}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded ${
                      weeklyMetric === 'steps' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                  ></div>
                  <span className="text-gray-600">
                    Avg:{' '}
                    {Math.round(
                      displayWeeklyData.reduce(
                        (acc, d) => acc + (weeklyMetric === 'steps' ? d.steps : d.calories),
                        0
                      ) / displayWeeklyData.length
                    ).toLocaleString()}{' '}
                    {weeklyMetric === 'steps' ? 'steps' : 'kcal'}
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

          {/* AI Insights Section */}
          <div className="mt-6 space-y-6">
            {/* Daily AI Insight */}
            {dailyInsight && (
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white" gradient="">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">Today's AI Insight</h3>
                      <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        Powered by Gemini
                      </span>
                    </div>

                    {/* Today's Performance */}
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white text-opacity-75 mb-1">Today's Steps</p>
                          <p className="text-2xl font-bold">{dailyInsight.today_steps.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white text-opacity-75 mb-1">Weekly Average</p>
                          <p className="text-2xl font-bold">{dailyInsight.weekly_average.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          dailyInsight.comparison === 'above'
                            ? 'bg-green-500 bg-opacity-20 text-green-100'
                            : 'bg-orange-500 bg-opacity-20 text-orange-100'
                        }`}>
                          {dailyInsight.comparison === 'above' ? '📈' : '📊'} {' '}
                          {Math.abs(dailyInsight.difference_percentage).toFixed(1)}% {dailyInsight.comparison} average
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="space-y-2 mb-4">
                      {dailyInsight.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-lg flex-shrink-0">💡</span>
                          <p className="text-white text-opacity-90 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>

                    {/* Motivation */}
                    <div className="pt-4 border-t border-white border-opacity-20">
                      <p className="text-sm text-white text-opacity-90 font-medium">
                        {dailyInsight.motivation}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Monthly Insights & Recommendations */}
            {monthlyInsights && monthlyInsights.stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trends & Patterns */}
                <Card>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Monthly Trends</h3>
                      <p className="text-xs text-gray-500">Based on your last 30 days</p>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Avg. Steps</p>
                        <p className="font-bold text-gray-900">{(monthlyInsights.stats.average || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Consistency</p>
                        <p className="font-bold text-gray-900">{(monthlyInsights.stats.consistency || 0).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Goal Days</p>
                        <p className="font-bold text-gray-900">{monthlyInsights.stats.days_hit_goal || 0}/{monthlyInsights.stats.days_analyzed || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Range</p>
                        <p className="font-bold text-gray-900 text-xs">{(monthlyInsights.stats.min || 0).toLocaleString()} - {(monthlyInsights.stats.max || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Trends */}
                  <div className="space-y-2">
                    {monthlyInsights.patterns?.trends && Array.isArray(monthlyInsights.patterns.trends) &&
                      monthlyInsights.patterns.trends.slice(0, 3).map((trend, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
                          <span className="flex-shrink-0 mt-0.5">📈</span>
                          <p className="text-sm text-gray-800">{trend}</p>
                        </div>
                      ))
                    }
                    {monthlyInsights.patterns?.patterns && Array.isArray(monthlyInsights.patterns.patterns) &&
                      monthlyInsights.patterns.patterns.slice(0, 2).map((pattern, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-purple-50 rounded-lg">
                          <span className="flex-shrink-0 mt-0.5">🔄</span>
                          <p className="text-sm text-gray-800">{pattern}</p>
                        </div>
                      ))
                    }
                  </div>
                </Card>

                {/* Personalized Recommendations */}
                <Card>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
                      <p className="text-xs text-gray-500">Personalized for your goals</p>
                    </div>
                  </div>

                  {monthlyInsights.patterns?.recommendations && Array.isArray(monthlyInsights.patterns.recommendations) && monthlyInsights.patterns.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {monthlyInsights.patterns.recommendations.map((recommendation, index) => (
                        <div key={index} className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-r-lg">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl flex-shrink-0">💪</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                {recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Additional AI-Generated Recommendations */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3 font-medium">💡 Quick Wins:</p>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2 text-sm text-gray-700">
                            <span>•</span>
                            <p>Try increasing your daily step goal by 10% next week</p>
                          </div>
                          <div className="flex items-start space-x-2 text-sm text-gray-700">
                            <span>•</span>
                            <p>Schedule 3 specific times for walks to build consistency</p>
                          </div>
                          <div className="flex items-start space-x-2 text-sm text-gray-700">
                            <span>•</span>
                            <p>Use the AI Coach (bottom right) for personalized workout suggestions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Keep tracking to get personalized recommendations!</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
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
