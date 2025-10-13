import api from './api';

interface WhoopAuthResponse {
  authUrl: string;
  state: string;
}

interface WhoopConnectionStatus {
  connected: boolean;
  whoopUserId?: string;
  connectedAt?: Date;
}

interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

class WhoopService {
  /**
   * Get Whoop OAuth authorization URL
   */
  async getAuthorizationUrl(): Promise<WhoopAuthResponse> {
    const response = await api.get<WhoopAuthResponse>('/whoop/authorize');
    return response.data;
  }

  /**
   * Check Whoop connection status
   */
  async getConnectionStatus(): Promise<WhoopConnectionStatus> {
    const response = await api.get<WhoopConnectionStatus>('/whoop/status');
    return response.data;
  }

  /**
   * Disconnect Whoop account
   */
  async disconnect(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/whoop/disconnect');
    return response.data;
  }

  /**
   * Get Whoop user profile
   */
  async getProfile(): Promise<WhoopProfile> {
    const response = await api.get<WhoopProfile>('/whoop/profile');
    return response.data;
  }

  /**
   * Initiate Whoop connection by redirecting to authorization URL
   */
  async initiateConnection(): Promise<void> {
    const { authUrl } = await this.getAuthorizationUrl();
    window.location.href = authUrl;
  }
}

export const whoopService = new WhoopService();

// Export types
export type { WhoopAuthResponse, WhoopConnectionStatus, WhoopProfile };
