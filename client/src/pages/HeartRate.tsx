import { useState, useEffect } from 'react';
import {
  Heart,
  TrendingUp,
  Calendar,
  AlertCircle,
  Award,
  Activity,
  Activity as Pulse,
} from 'lucide-react';
import { useHeartRateStats } from '../hooks/useFitnessData';
import { fitbitService } from '../services/fitbitService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import Header from '../components/Header';
import { Sidebar, EmptyState } from '../components/ui';

const HeartRate = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);

  const { data: heartRateStats, refetch: refetchHeartRate } = useHeartRateStats();

  const handleSyncComplete = async () => {
    await refetchHeartRate();
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


  const defaultHeartRateStats = {
    restingHeartRate: 0,
    currentHeartRate: 0,
    maxHeartRate: 0,
    minHeartRate: 0,
    avgHeartRate: 0,
  };

  const currentStats = {
    restingHeartRate: heartRateStats?.restingHeartRate ?? defaultHeartRateStats.restingHeartRate,
    currentHeartRate: heartRateStats?.currentHeartRate ?? defaultHeartRateStats.currentHeartRate,
    maxHeartRate: heartRateStats?.maxHeartRate ?? defaultHeartRateStats.maxHeartRate,
    minHeartRate: heartRateStats?.minHeartRate ?? defaultHeartRateStats.minHeartRate,
    avgHeartRate: heartRateStats?.avgHeartRate ?? defaultHeartRateStats.avgHeartRate,
  };

  const heartRateZones = [
    {
      name: 'Peak',
      range: '171-220 bpm',
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      minutes: 0,
      description: 'Maximum effort',
    },
    {
      name: 'Cardio',
      range: '137-170 bpm',
      color: 'from-orange-500 to-rose-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      minutes: 0,
      description: 'High intensity',
    },
    {
      name: 'Fat Burn',
      range: '103-136 bpm',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      minutes: 0,
      description: 'Moderate intensity',
    },
    {
      name: 'Light',
      range: '68-102 bpm',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      minutes: 0,
      description: 'Low intensity',
    },
    {
      name: 'Rest',
      range: 'Below 68 bpm',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      minutes: 0,
      description: 'Resting state',
    },
  ];

  const hourlyHeartRate = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    bpm: 0,
  }));

  const weeklyRestingHR = [
    { day: 'Mon', bpm: 0 },
    { day: 'Tue', bpm: 0 },
    { day: 'Wed', bpm: 0 },
    { day: 'Thu', bpm: 0 },
    { day: 'Fri', bpm: 0 },
    { day: 'Sat', bpm: 0 },
    { day: 'Sun', bpm: 0 },
  ];

  const maxBpm = Math.max(...hourlyHeartRate.map((h) => h.bpm), 220);
  const totalZoneMinutes = heartRateZones.reduce((acc, zone) => acc + zone.minutes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <Header
          title="Heart Rate Tracking"
          subtitle="Monitor your heart health and cardiovascular fitness"
          showSync={true}
          onSyncComplete={handleSyncComplete}
        />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeRange('day')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'day'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'week'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === 'month'
                    ? 'bg-rose-600 text-white'
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

          {/* Current Heart Rate - Featured */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-rose-500 via-pink-500 to-red-600 rounded-3xl p-8 shadow-xl text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium opacity-90 mb-2">Current Heart Rate</h2>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-7xl font-bold">{currentStats.currentHeartRate}</span>
                    <span className="text-3xl font-medium opacity-90">bpm</span>
                  </div>
                  <p className="text-sm opacity-90 mt-2">
                    {currentStats.currentHeartRate === 0
                      ? 'No data available'
                      : 'Normal resting rate'}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                    <Heart className="w-10 h-10 fill-white" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Resting</div>
                  <div className="text-2xl font-bold">{currentStats.restingHeartRate}</div>
                  <div className="text-xs opacity-75">bpm</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Max Today</div>
                  <div className="text-2xl font-bold">{currentStats.maxHeartRate}</div>
                  <div className="text-xs opacity-75">bpm</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-1">Average</div>
                  <div className="text-2xl font-bold">{currentStats.avgHeartRate}</div>
                  <div className="text-xs opacity-75">bpm</div>
                </div>
              </div>
            </div>

            {/* Heart Rate Variability */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Heart Rate Variability</h3>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-sm text-gray-500">ms</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">No Data</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    HRV measures the variation in time between heartbeats. Higher values typically
                    indicate better cardiovascular fitness and recovery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Heart Rate Zones */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Heart Rate Zones</h2>
              <div className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-900">{totalZoneMinutes} min</span>
              </div>
            </div>

            <div className="space-y-4">
              {heartRateZones.map((zone, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded bg-gradient-to-r ${zone.color}`}
                      ></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{zone.range}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">{zone.description}</span>
                      <span className={`text-sm font-bold ${zone.textColor}`}>
                        {zone.minutes} min
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${zone.color} h-3 rounded-full transition-all`}
                      style={{
                        width:
                          totalZoneMinutes > 0
                            ? `${(zone.minutes / totalZoneMinutes) * 100}%`
                            : '0%',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Understanding Heart Rate Zones</p>
                  <p>
                    Training in different zones helps improve cardiovascular fitness. Aim for a mix of
                    zones based on your fitness goals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 24-Hour Heart Rate */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">24-Hour Heart Rate</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>

              <div className="flex items-end justify-between h-48 space-x-1">
                {hourlyHeartRate.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-rose-500 to-pink-400 rounded-t transition-all hover:from-rose-600 hover:to-pink-500 cursor-pointer relative"
                        style={{
                          height: `${(data.bpm / maxBpm) * 100}%`,
                          minHeight: '2px',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {data.bpm} bpm
                        </div>
                      </div>
                    </div>
                    {index % 4 === 0 && (
                      <span className="text-xs text-gray-400 mt-2">{data.hour}h</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-500 rounded"></div>
                    <span className="text-gray-600">Heart Rate</span>
                  </div>
                </div>
                <div className="text-gray-500">Last 24 hours</div>
              </div>
            </div>

            {/* Weekly Resting HR Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Resting HR Trend</h2>

              <div className="space-y-4">
                {weeklyRestingHR.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <span className="text-sm font-bold text-rose-600">{day.bpm} bpm</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${(day.bpm / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Weekly Average</div>
                  <div className="text-2xl font-bold text-gray-900">0 bpm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cardiovascular Fitness Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-sm text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium opacity-90 mb-2">
                    Cardiovascular Fitness
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold">0</span>
                    <span className="text-xl opacity-90">/ 100</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <p className="text-sm opacity-90">
                Your cardio fitness score is based on your resting heart rate and activity levels.
                Connect your device to get started.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Health Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Pulse className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Monitor regularly</p>
                    <p className="text-gray-600">Track your heart rate throughout the day</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Lower is better</p>
                    <p className="text-gray-600">
                      A lower resting heart rate indicates better fitness
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Stay active</p>
                    <p className="text-gray-600">Regular exercise improves heart health</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <EmptyState
            icon={Heart}
            title="No Heart Rate Data Yet"
            description={
              fitbitStatus?.connected
                ? 'Your device is connected. Heart rate data will appear here once it syncs. Wear your device and check back later.'
                : 'Go to Settings to connect your fitness device and start tracking your heart rate, zones, and cardiovascular fitness throughout the day.'
            }
            iconColor="bg-rose-100 text-rose-600"
          />
        </div>
      </main>
    </div>
  );
};

export default HeartRate;
