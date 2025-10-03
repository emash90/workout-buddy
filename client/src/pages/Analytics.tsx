import { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart3,
  Filter,
  Footprints,
  Flame,
  Clock,
  Target,
  Moon,
} from 'lucide-react';
import { fitbitService } from '../services/fitbitService';
import { fitnessService } from '../services/fitnessService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import Header from '../components/Header';
import { Sidebar, EmptyState } from '../components/ui';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSyncComplete = async () => {
    await loadAnalyticsData();
  };

  useEffect(() => {
    loadFitbitStatus();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadFitbitStatus = async () => {
    try {
      const status = await fitbitService.getConnectionStatus();
      setFitbitStatus(status);
    } catch (error) {
      console.error('Failed to load Fitbit status:', error);
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await fitnessService.getAnalyticsSummary(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const summaryStats = {
    totalSteps: analyticsData?.totalSteps ?? 0,
    totalCalories: analyticsData?.totalCalories ?? 0,
    totalActiveMinutes: analyticsData?.totalActiveMinutes ?? 0,
    totalDistance: analyticsData?.totalDistance ?? 0,
    totalFloors: analyticsData?.totalFloors ?? 0,
    avgSteps: analyticsData?.averageSteps ?? 0,
    daysActive: analyticsData?.daysActive ?? 0,
  };


  const trends = [
    {
      name: 'Steps',
      current: summaryStats.totalSteps,
      previous: 0,
      change: 0,
      icon: Footprints,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Calories',
      current: summaryStats.totalCalories,
      previous: 0,
      change: 0,
      icon: Flame,
      color: 'from-orange-500 to-rose-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Active Minutes',
      current: summaryStats.totalActiveMinutes,
      previous: 0,
      change: 0,
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Distance',
      current: summaryStats.totalDistance,
      previous: 0,
      change: 0,
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      unit: 'km',
    },
  ];

  const getPeriodMultiplier = () => {
    if (timeRange === 'week') return 7;
    if (timeRange === 'month') return 30;
    return 365;
  };

  const multiplier = getPeriodMultiplier();

  const goals = [
    {
      name: `${timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Steps`,
      target: 10000 * multiplier,
      achieved: summaryStats.totalSteps,
      percentage: Math.min((summaryStats.totalSteps / (10000 * multiplier)) * 100, 100),
      color: 'blue'
    },
    {
      name: `${timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Calories`,
      target: 2500 * multiplier,
      achieved: summaryStats.totalCalories,
      percentage: Math.min((summaryStats.totalCalories / (2500 * multiplier)) * 100, 100),
      color: 'orange'
    },
    {
      name: `${timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Distance`,
      target: 8 * multiplier,
      achieved: summaryStats.totalDistance,
      percentage: Math.min((summaryStats.totalDistance / (8 * multiplier)) * 100, 100),
      color: 'indigo'
    },
    {
      name: `${timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Active Minutes`,
      target: 30 * multiplier,
      achieved: summaryStats.totalActiveMinutes,
      percentage: Math.min((summaryStats.totalActiveMinutes / (30 * multiplier)) * 100, 100),
      color: 'emerald'
    },
  ];


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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading analytics data...</p>
              </div>
            </div>
          ) : (
            <>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Total Steps</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalSteps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {summaryStats.avgSteps.toLocaleString()}/day
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Calories Burned</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalCalories.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {Math.round(summaryStats.totalCalories / (summaryStats.daysActive || 1)).toLocaleString()}/day
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Active Minutes</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalActiveMinutes.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {Math.round(summaryStats.totalActiveMinutes / (summaryStats.daysActive || 1))}/day
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Distance</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalDistance.toFixed(1)} km
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {(summaryStats.totalDistance / (summaryStats.daysActive || 1)).toFixed(1)}/day
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Days Active</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.daysActive}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Out of {multiplier} days
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
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{trend.name}</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {trend.unit === 'km' ? trend.current.toFixed(1) : trend.current.toLocaleString()}
                  {trend.unit && <span className="text-sm text-gray-500 ml-1">{trend.unit}</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past year'}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        {goal.name.includes('Distance')
                          ? `${goal.achieved.toFixed(1)} / ${goal.target} km`
                          : `${goal.achieved.toLocaleString()} / ${goal.target.toLocaleString()}`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          goal.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          goal.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          goal.color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                          'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        }`}
                        style={{ width: `${Math.round(goal.percentage)}%` }}
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

            {/* Period Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Summary
                </h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Footprints className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Average Steps</p>
                      <p className="text-xl font-bold text-blue-900">{summaryStats.avgSteps.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">per day</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-700 font-medium">Average Calories</p>
                      <p className="text-xl font-bold text-orange-900">
                        {Math.round(summaryStats.totalCalories / (summaryStats.daysActive || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">per day</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-700 font-medium">Average Active Minutes</p>
                      <p className="text-xl font-bold text-emerald-900">
                        {Math.round(summaryStats.totalActiveMinutes / (summaryStats.daysActive || 1))}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">per day</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700 font-medium">Days Active</p>
                      <p className="text-xl font-bold text-indigo-900">{summaryStats.daysActive}</p>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">of {multiplier}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Show empty state only if no data */}
          {summaryStats.totalSteps === 0 && (
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
          )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
