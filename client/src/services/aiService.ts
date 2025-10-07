import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  sources: string[];
  toolsUsed: string[];
  conversationId?: string;
}

export interface Insight {
  insights: string[];
  patterns: {
    trends: string[];
    patterns: string[];
    recommendations: string[];
    stats: {
      average: number;
      median: number;
      min: number;
      max: number;
      std_dev: number;
      consistency: number;
      days_analyzed: number;
      days_hit_goal: number;
    };
  };
  stats: {
    average: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
    consistency: number;
    days_analyzed: number;
    days_hit_goal: number;
  };
  period: string;
}

export interface DailyInsight {
  user_id: string;
  date: string;
  today_steps: number;
  weekly_average: number;
  comparison: string;
  difference_percentage: number;
  insights: string[];
  motivation: string;
}

export interface WorkoutPlanRequest {
  goal: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  equipment?: string[];
  limitations?: string[];
}

export interface QuickWorkoutRequest {
  goal: string;
  durationMinutes?: number;
  equipment?: string[];
}

const aiService = {
  /**
   * Send a message to the AI fitness coach
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', request);
    return response.data;
  },

  /**
   * Get personalized insights for a time period
   */
  async getInsights(period: 'week' | 'month' | 'year' = 'month'): Promise<Insight> {
    const response = await api.post<Insight>('/ai/insights', { period });
    return response.data;
  },

  /**
   * Get daily insight for today
   */
  async getDailyInsight(): Promise<DailyInsight> {
    const response = await api.get<DailyInsight>('/ai/daily-insight');
    return response.data;
  },

  /**
   * Generate a personalized workout plan
   */
  async generateWorkoutPlan(request: WorkoutPlanRequest): Promise<any> {
    const response = await api.post('/ai/workout-plan', request);
    return response.data;
  },

  /**
   * Get a quick workout suggestion
   */
  async getQuickWorkout(request: QuickWorkoutRequest): Promise<any> {
    const response = await api.get('/ai/quick-workout', {
      params: {
        goal: request.goal,
        durationMinutes: request.durationMinutes || 20,
        equipment: request.equipment?.join(','),
      },
    });
    return response.data;
  },

  /**
   * Clear chat history
   */
  async clearHistory(conversationId: string): Promise<void> {
    await api.delete('/ai/clear-history', {
      params: { conversationId },
    });
  },
};

export default aiService;
