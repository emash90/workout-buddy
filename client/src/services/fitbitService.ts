import api from './api';

interface FitbitAuthResponse {
  authUrl: string;
  state: string;
}

interface FitbitConnectionStatus {
  connected: boolean;
  fitbitUserId?: string;
  connectedAt?: Date;
}

interface FitbitProfile {
  user: {
    displayName: string;
    avatar: string;
    memberSince: string;
  };
}

class FitbitService {
  /**
   * Get Fitbit OAuth authorization URL
   */
  async getAuthorizationUrl(): Promise<FitbitAuthResponse> {
    const response = await api.get<FitbitAuthResponse>('/fitbit/authorize');
    return response.data;
  }

  /**
   * Check Fitbit connection status
   */
  async getConnectionStatus(): Promise<FitbitConnectionStatus> {
    const response = await api.get<FitbitConnectionStatus>('/fitbit/status');
    return response.data;
  }

  /**
   * Disconnect Fitbit account
   */
  async disconnect(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/fitbit/disconnect');
    return response.data;
  }

  /**
   * Get Fitbit user profile
   */
  async getProfile(): Promise<FitbitProfile> {
    const response = await api.get<FitbitProfile>('/fitbit/profile');
    return response.data;
  }

  /**
   * Initiate Fitbit connection by redirecting to authorization URL
   */
  async initiateConnection(): Promise<void> {
    const { authUrl } = await this.getAuthorizationUrl();
    window.location.href = authUrl;
  }
}

export const fitbitService = new FitbitService();

// Export types
export type { FitbitAuthResponse, FitbitConnectionStatus, FitbitProfile };
