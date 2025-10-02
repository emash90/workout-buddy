import Cookies from 'js-cookie';
import api from './api';
import type { LoginCredentials, SignupData, AuthResponse, User } from '../types/auth.types';

const TOKEN_NAME = 'access_token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      Cookies.set(TOKEN_NAME, response.data.access_token, {
        expires: 7, // 7 days
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });
    }
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    if (response.data.access_token) {
      Cookies.set(TOKEN_NAME, response.data.access_token, {
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });
    }
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  getToken(): string | undefined {
    return Cookies.get(TOKEN_NAME);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    Cookies.remove(TOKEN_NAME);
    window.location.href = '/login';
  },
};
