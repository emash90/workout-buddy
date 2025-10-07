import { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import type { Insight, DailyInsight } from '../services/aiService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Insights = () => {
  const [insights, setInsights] = useState<Insight | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
    fetchDailyInsight();
  }, [period]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getInsights(period);
      setInsights(data);
    } catch (err: any) {
      console.error('Failed to fetch insights:', err);
      setError(err.response?.data?.message || 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyInsight = async () => {
    try {
      const data = await aiService.getDailyInsight();
      setDailyInsight(data);
    } catch (err: any) {
      console.error('Failed to fetch daily insight:', err);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'Past Week';
      case 'month':
        return 'Past Month';
      case 'year':
        return 'Past Year';
      default:
        return 'Past Month';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Insights
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchInsights}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600 mt-1">
              Personalized insights powered by AI analyzing your fitness data
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={period === 'week' ? 'primary' : 'outline'}
              onClick={() => setPeriod('week')}
            >
              Week
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'outline'}
              onClick={() => setPeriod('month')}
            >
              Month
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'outline'}
              onClick={() => setPeriod('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Daily Insight Card */}
        {dailyInsight && (
          <Card className="mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Today's Insight</h3>
                <div className="space-y-2">
                  {dailyInsight.insights.map((insight, index) => (
                    <p key={index} className="text-white text-opacity-90">
                      {insight}
                    </p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <p className="text-sm text-white text-opacity-75">
                    {dailyInsight.motivation}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <div className="text-3xl mb-2">👟</div>
              <p className="text-sm text-gray-600 mb-1">Average Steps</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.stats.average.toLocaleString()}
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm text-gray-600 mb-1">Consistency Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.stats.consistency.toFixed(1)}%
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-gray-600 mb-1">Days Hit Goal</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.stats.days_hit_goal}/{insights.stats.days_analyzed}
              </p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-600 mb-1">Range</p>
              <p className="text-xl font-bold text-gray-900">
                {insights.stats.min.toLocaleString()} - {insights.stats.max.toLocaleString()}
              </p>
            </Card>
          </div>
        )}

        {/* Key Insights */}
        {insights && insights.insights.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Key Insights ({getPeriodLabel()})
            </h2>
            <div className="space-y-3">
              {insights.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                >
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-gray-800 flex-1">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity Patterns */}
        {insights && insights.patterns && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Trends */}
            {insights.patterns.trends && insights.patterns.trends.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Activity Trends
                </h2>
                <div className="space-y-2">
                  {insights.patterns.trends.map((trend, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <p className="text-gray-800">{trend}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Patterns */}
            {insights.patterns.patterns && insights.patterns.patterns.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔄</span>
                  Behavior Patterns
                </h2>
                <div className="space-y-2">
                  {insights.patterns.patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <p className="text-gray-800">{pattern}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations */}
        {insights &&
          insights.patterns.recommendations &&
          insights.patterns.recommendations.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💪</span>
                Personalized Recommendations
              </h2>
              <div className="space-y-3">
                {insights.patterns.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg"
                  >
                    <span className="text-2xl flex-shrink-0">🎯</span>
                    <p className="text-gray-800 flex-1 font-medium">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        {/* Empty State */}
        {insights &&
          insights.insights.length === 0 &&
          (!insights.patterns || insights.patterns.trends.length === 0) && (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Insights Available
              </h3>
              <p className="text-gray-600 mb-4">
                We need more fitness data to generate personalized insights for you.
              </p>
              <p className="text-sm text-gray-500">
                Keep tracking your activity and check back soon!
              </p>
            </Card>
          )}
      </div>
    </div>
  );
};

export default Insights;
