import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';
import { FitbitToken } from '../../entities/fitbit-token.entity';
import {
  FitbitTokenResponse,
  FitbitUserProfile,
  FitbitActivitySummary,
  FitbitHeartRateData,
  FitbitActivityTypesResponse,
  FitbitSleepLog,
  FitbitDailySummary
} from './interfaces/fitbit.interface';

@Injectable()
export class FitbitService {
  private readonly logger = new Logger(FitbitService.name);
  private readonly httpClient: AxiosInstance;
  private readonly fitbitConfig: any;

  constructor(
    @InjectRepository(FitbitToken)
    private fitbitTokenRepository: Repository<FitbitToken>,
    private configService: ConfigService,
  ) {
    this.fitbitConfig = this.configService.get('fitbit');
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(userId: string): { authUrl: string; state: string } {
    const state = this.generateStateParameter(userId);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.fitbitConfig.clientId,
      redirect_uri: this.fitbitConfig.redirectUri,
      scope: this.fitbitConfig.scope,
      state,
    });
     let  client_id = this.fitbitConfig.clientId
    
    console.log('client_id', client_id, )
    const authUrl = `${this.fitbitConfig.authUrl}?${params.toString()}`;

    return { authUrl, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<FitbitTokenResponse> {
    try {
      const userId = this.extractUserIdFromState(state);

      const tokenData = qs.stringify({
        client_id: this.fitbitConfig.clientId,
        grant_type: 'authorization_code',
        redirect_uri: this.fitbitConfig.redirectUri,
        code,
      });

      const authHeader = Buffer.from(
        `${this.fitbitConfig.clientId}:${this.fitbitConfig.clientSecret}`
      ).toString('base64');

      const response = await this.httpClient.post(
        this.fitbitConfig.tokenUrl,
        tokenData,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to exchange code for token', error.response?.data);
      throw new BadRequestException('Failed to obtain access token from Fitbit');
    }
  }

  /**
   * Save or update Fitbit token for user
   */
  async saveToken(userId: string, tokenResponse: FitbitTokenResponse): Promise<FitbitToken> {
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    // Check if token already exists for user
    let existingToken = await this.fitbitTokenRepository.findOne({
      where: { userId },
    });

    if (existingToken) {
      // Update existing token
      existingToken.accessToken = tokenResponse.access_token;
      existingToken.refreshToken = tokenResponse.refresh_token;
      existingToken.fitbitUserId = tokenResponse.user_id;
      existingToken.expiresIn = tokenResponse.expires_in;
      existingToken.expiresAt = expiresAt;
      existingToken.tokenType = tokenResponse.token_type;
      existingToken.scope = tokenResponse.scope;

      return this.fitbitTokenRepository.save(existingToken);
    } else {
      // Create new token
      const newToken = this.fitbitTokenRepository.create({
        userId,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        fitbitUserId: tokenResponse.user_id,
        expiresIn: tokenResponse.expires_in,
        expiresAt,
        tokenType: tokenResponse.token_type,
        scope: tokenResponse.scope,
      });

      return this.fitbitTokenRepository.save(newToken);
    }
  }

  /**
   * Get user's Fitbit token
   */
  async getUserToken(userId: string): Promise<FitbitToken | null> {
    return this.fitbitTokenRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Refresh expired access token
   */
  async refreshToken(userId: string): Promise<FitbitToken> {
    const token = await this.getUserToken(userId);
    if (!token) {
      throw new UnauthorizedException('No Fitbit token found for user');
    }

    try {
      const tokenData = qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      });

      const authHeader = Buffer.from(
        `${this.fitbitConfig.clientId}:${this.fitbitConfig.clientSecret}`
      ).toString('base64');

      const response = await this.httpClient.post(
        this.fitbitConfig.tokenUrl,
        tokenData,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return this.saveToken(userId, response.data);
    } catch (error) {
      this.logger.error('Failed to refresh token', error.response?.data);
      throw new UnauthorizedException('Failed to refresh Fitbit token');
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidToken(userId: string): Promise<string> {
    let token = await this.getUserToken(userId);
    if (!token) {
      throw new UnauthorizedException('No Fitbit connection found');
    }

    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const expiresAt = new Date(token.expiresAt.getTime() - 5 * 60 * 1000);

    if (now >= expiresAt) {
      token = await this.refreshToken(userId);
    }

    return token.accessToken;
  }

  /**
   * Make authenticated API call to Fitbit
   */
  async makeApiCall(userId: string, endpoint: string): Promise<any> {
    const accessToken = await this.getValidToken(userId);
    const url = `${this.fitbitConfig.apiBaseUrl}${endpoint}`;

    this.logger.log(`Making Fitbit API call to: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Fitbit API call failed: ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new BadRequestException(`Failed to fetch data from Fitbit: ${error.response?.statusText || error.message}`);
    }
  }

  /**
   * Get user profile from Fitbit
   */
  async getUserProfile(userId: string): Promise<FitbitUserProfile> {
    return this.makeApiCall(userId, '/1/user/-/profile.json');
  }

  /**
   * Get activity list
   */
  async getActivitySummary(
    userId: string,
    afterDate?: string,
    sort: string = 'asc',
    offset: number = 0,
    limit: number = 20
  ): Promise<FitbitActivitySummary> {
    // If no afterDate provided, default to 30 days ago
    const defaultAfterDate = afterDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const params = new URLSearchParams({
      afterDate: defaultAfterDate,
      sort,
      offset: offset.toString(),
      limit: limit.toString(),
    });

    return this.makeApiCall(userId, `/1/user/-/activities/list.json?${params.toString()}`);
  }

  /**
   * Get heart rate data for a specific date
   */
  async getHeartRateData(userId: string, date: string = 'today'): Promise<FitbitHeartRateData> {
    return this.makeApiCall(userId, `/1/user/-/activities/heart/date/${date}/1d.json`);
  }

  /**
   * Get all available activity types from Fitbit
   */
  async getActivityTypes(userId: string): Promise<FitbitActivityTypesResponse> {
    return this.makeApiCall(userId, '/1/activities.json');
  }

  /**
   * Get sleep log for a specific date
   */
  async getSleepLog(userId: string, date?: string): Promise<FitbitSleepLog> {
    // Sleep API requires YYYY-MM-DD format, doesn't accept "today"
    const sleepDate = date || new Date().toISOString().split('T')[0];
    return this.makeApiCall(userId, `/1.2/user/-/sleep/date/${sleepDate}.json`);
  }

  /**
   * Get daily activity summary for a specific date
   */
  async getDailySummary(userId: string, date?: string): Promise<FitbitDailySummary> {
    const activityDate = date || new Date().toISOString().split('T')[0];
    return this.makeApiCall(userId, `/1/user/-/activities/date/${activityDate}.json`);
  }

  /**
   * Get weight log for a specific date
   */
  async getWeightLog(userId: string, date?: string) {
    const weightDate = date || new Date().toISOString().split('T')[0];
    return this.makeApiCall(userId, `/1/user/-/body/log/weight/date/${weightDate}.json`);
  }

  /**
   * Get body fat log for a specific date
   */
  async getBodyFatLog(userId: string, date?: string) {
    const fatDate = date || new Date().toISOString().split('T')[0];
    return this.makeApiCall(userId, `/1/user/-/body/log/fat/date/${fatDate}.json`);
  }

  /**
   * Get active minutes time series
   */
  async getActiveMinutesTimeSeries(userId: string, startDate?: string, endDate?: string) {
    // Default to last 7 days if not provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.makeApiCall(userId, `/1/user/-/activities/active-zone-minutes/date/${start}/${end}.json`);
  }

  /**
   * Disconnect Fitbit account
   */
  async disconnectAccount(userId: string): Promise<boolean> {
    const token = await this.getUserToken(userId);
    if (token) {
      await this.fitbitTokenRepository.remove(token);
      return true;
    }
    return false;
  }

  /**
   * Generate secure state parameter
   */
  private generateStateParameter(userId: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return Buffer.from(`${userId}:${timestamp}:${random}`).toString('base64');
  }

  /**
   * Extract user ID from state parameter
   */
  private extractUserIdFromState(state: string): string {
    try {
      const decoded = Buffer.from(state, 'base64').toString();
      const [userId] = decoded.split(':');
      return userId;
    } catch (error) {
      throw new BadRequestException('Invalid state parameter');
    }
  }
}