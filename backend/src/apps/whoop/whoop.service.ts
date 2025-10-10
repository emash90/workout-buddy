import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';
import { WhoopToken } from '../../entities/whoop-token.entity';
import { DeviceConnectionsService } from '../../device-connections/device-connections.service';
import { FitnessProvider } from '../../device-connections/enums/provider.enum';
import {
  WhoopTokenResponse,
  WhoopUserProfile,
  WhoopCycle,
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  WhoopBodyMeasurement,
  WhoopPaginatedResponse,
} from './interfaces/whoop.interface';

@Injectable()
export class WhoopService {
  private readonly logger = new Logger(WhoopService.name);
  private readonly httpClient: AxiosInstance;
  private readonly whoopConfig: any;

  constructor(
    @InjectRepository(WhoopToken)
    private whoopTokenRepository: Repository<WhoopToken>,
    private configService: ConfigService,
    private deviceConnectionsService: DeviceConnectionsService,
  ) {
    this.whoopConfig = this.configService.get('whoop');
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
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
      client_id: this.whoopConfig.clientId,
      redirect_uri: this.whoopConfig.redirectUri,
      scope: this.whoopConfig.scope,
      state,
    });

    const authUrl = `${this.whoopConfig.authUrl}?${params.toString()}`;

    this.logger.log(`Generated Whoop auth URL for user ${userId}`);
    return { authUrl, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<WhoopTokenResponse> {
    try {
      const userId = this.extractUserIdFromState(state);

      // Check if user can connect to Whoop
      const canConnect = await this.deviceConnectionsService.canConnectProvider(
        userId,
        FitnessProvider.WHOOP,
      );

      if (!canConnect) {
        throw new BadRequestException(
          'Cannot connect Whoop. Please disconnect your current provider first.'
        );
      }

      const tokenData = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.whoopConfig.redirectUri,
        client_id: this.whoopConfig.clientId,
        client_secret: this.whoopConfig.clientSecret,
      };

      const response = await this.httpClient.post<WhoopTokenResponse>(
        this.whoopConfig.tokenUrl,
        tokenData,
      );

      const tokenResponse = response.data;

      // Calculate expiration timestamp
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);

      // Save token to database
      await this.saveToken(userId, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
        whoopUserId: tokenResponse.user_id,
        metadata: {
          scope: tokenResponse.scope,
          tokenType: tokenResponse.token_type,
        },
      });

      // Update user's connected provider
      await this.deviceConnectionsService.updateConnectedProvider(
        userId,
        FitnessProvider.WHOOP,
      );

      this.logger.log(`Successfully exchanged code for token for user ${userId}`);
      return tokenResponse;
    } catch (error) {
      this.logger.error('Error exchanging code for token:', error);
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.error_description || 'Failed to exchange code for token'
        );
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(userId: string): Promise<WhoopToken> {
    try {
      const existingToken = await this.whoopTokenRepository.findOne({
        where: { userId },
      });

      if (!existingToken) {
        throw new UnauthorizedException('No Whoop token found for user');
      }

      const tokenData = {
        grant_type: 'refresh_token',
        refresh_token: existingToken.refreshToken,
        client_id: this.whoopConfig.clientId,
        client_secret: this.whoopConfig.clientSecret,
      };

      const response = await this.httpClient.post<WhoopTokenResponse>(
        this.whoopConfig.tokenUrl,
        tokenData,
      );

      const tokenResponse = response.data;
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);

      // Update existing token
      existingToken.accessToken = tokenResponse.access_token;
      existingToken.refreshToken = tokenResponse.refresh_token;
      existingToken.expiresAt = expiresAt;

      await this.whoopTokenRepository.save(existingToken);

      this.logger.log(`Successfully refreshed token for user ${userId}`);
      return existingToken;
    } catch (error) {
      this.logger.error('Error refreshing token:', error);
      throw new UnauthorizedException('Failed to refresh Whoop token');
    }
  }

  /**
   * Get valid access token (refresh if expired)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    let token = await this.whoopTokenRepository.findOne({
      where: { userId },
    });

    if (!token) {
      throw new UnauthorizedException('No Whoop token found for user');
    }

    // Check if token is expired (with 5 minute buffer)
    const expiresAt = token.expiresAt;
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (expiresAt < now + bufferTime) {
      this.logger.log(`Token expired for user ${userId}, refreshing...`);
      token = await this.refreshAccessToken(userId);
    }

    return token.accessToken;
  }

  /**
   * Make authenticated API request to Whoop
   */
  private async makeAuthenticatedRequest<T>(
    userId: string,
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const accessToken = await this.getValidAccessToken(userId);

    try {
      const response = await this.httpClient.request<T>({
        method,
        url: `${this.whoopConfig.apiBaseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error making request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get user profile from Whoop
   */
  async getUserProfile(userId: string): Promise<WhoopUserProfile> {
    return this.makeAuthenticatedRequest<WhoopUserProfile>(
      userId,
      'GET',
      '/v1/user/profile/basic',
    );
  }

  /**
   * Get cycles (daily summaries)
   */
  async getCycles(
    userId: string,
    start?: string,
    end?: string,
    nextToken?: string,
  ): Promise<WhoopPaginatedResponse<WhoopCycle>> {
    let endpoint = '/v1/cycle';
    const params = new URLSearchParams();

    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (nextToken) params.append('nextToken', nextToken);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest<WhoopPaginatedResponse<WhoopCycle>>(
      userId,
      'GET',
      endpoint,
    );
  }

  /**
   * Get recovery data
   */
  async getRecovery(
    userId: string,
    start?: string,
    end?: string,
    nextToken?: string,
  ): Promise<WhoopPaginatedResponse<WhoopRecovery>> {
    let endpoint = '/v1/recovery';
    const params = new URLSearchParams();

    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (nextToken) params.append('nextToken', nextToken);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest<WhoopPaginatedResponse<WhoopRecovery>>(
      userId,
      'GET',
      endpoint,
    );
  }

  /**
   * Get sleep data
   */
  async getSleep(
    userId: string,
    start?: string,
    end?: string,
    nextToken?: string,
  ): Promise<WhoopPaginatedResponse<WhoopSleep>> {
    let endpoint = '/v1/activity/sleep';
    const params = new URLSearchParams();

    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (nextToken) params.append('nextToken', nextToken);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest<WhoopPaginatedResponse<WhoopSleep>>(
      userId,
      'GET',
      endpoint,
    );
  }

  /**
   * Get workout data
   */
  async getWorkouts(
    userId: string,
    start?: string,
    end?: string,
    nextToken?: string,
  ): Promise<WhoopPaginatedResponse<WhoopWorkout>> {
    let endpoint = '/v1/activity/workout';
    const params = new URLSearchParams();

    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (nextToken) params.append('nextToken', nextToken);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest<WhoopPaginatedResponse<WhoopWorkout>>(
      userId,
      'GET',
      endpoint,
    );
  }

  /**
   * Get body measurements
   */
  async getBodyMeasurement(userId: string): Promise<WhoopBodyMeasurement> {
    return this.makeAuthenticatedRequest<WhoopBodyMeasurement>(
      userId,
      'GET',
      '/v1/user/measurement/body',
    );
  }

  /**
   * Save or update token in database
   */
  private async saveToken(
    userId: string,
    tokenData: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      whoopUserId: string;
      metadata?: any;
    },
  ): Promise<WhoopToken> {
    let token = await this.whoopTokenRepository.findOne({
      where: { userId },
    });

    if (token) {
      // Update existing token
      token.accessToken = tokenData.accessToken;
      token.refreshToken = tokenData.refreshToken;
      token.expiresAt = tokenData.expiresAt;
      token.whoopUserId = tokenData.whoopUserId;
      token.metadata = tokenData.metadata;
    } else {
      // Create new token
      token = this.whoopTokenRepository.create({
        userId,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        whoopUserId: tokenData.whoopUserId,
        metadata: tokenData.metadata,
      });
    }

    return this.whoopTokenRepository.save(token);
  }

  /**
   * Generate state parameter for OAuth
   */
  private generateStateParameter(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return Buffer.from(`${userId}:${timestamp}:${random}`).toString('base64');
  }

  /**
   * Extract user ID from state parameter
   */
  private extractUserIdFromState(state: string): string {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      return userId;
    } catch (error) {
      throw new BadRequestException('Invalid state parameter');
    }
  }

  /**
   * Get token for user
   */
  async getTokenForUser(userId: string): Promise<WhoopToken | null> {
    return this.whoopTokenRepository.findOne({ where: { userId } });
  }

  /**
   * Delete token (disconnect)
   */
  async deleteToken(userId: string): Promise<void> {
    await this.whoopTokenRepository.delete({ userId });
    this.logger.log(`Deleted Whoop token for user ${userId}`);
  }
}
