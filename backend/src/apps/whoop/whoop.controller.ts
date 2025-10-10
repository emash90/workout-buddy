import {
  Controller,
  Get,
  Query,
  Request,
  Redirect,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhoopService } from './whoop.service';

interface WhoopCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

interface WhoopAuthResponse {
  authUrl: string;
  state: string;
}

interface WhoopConnectionStatus {
  connected: boolean;
  whoopUserId?: string;
  connectedAt?: Date;
}

@Controller('whoop')
export class WhoopController {
  constructor(private readonly whoopService: WhoopService) {}

  /**
   * GET /whoop/authorize
   * Get Whoop OAuth authorization URL
   */
  @Get('authorize')
  @UseGuards(JwtAuthGuard)
  async authorize(@Request() req: any): Promise<WhoopAuthResponse> {
    const userId = req.user.userId;
    const { authUrl, state } = this.whoopService.generateAuthUrl(userId);
    return { authUrl, state };
  }

  /**
   * GET /whoop/callback
   * Handle Whoop OAuth callback
   */
  @Get('callback')
  @Redirect()
  async callback(@Query() query: WhoopCallbackQuery) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';

    try {
      // Check for OAuth errors
      if (query.error) {
        return {
          url: `${frontendUrl}/whoop/error?message=${encodeURIComponent(query.error_description || query.error)}`,
          statusCode: 302,
        };
      }

      if (!query.code || !query.state) {
        return {
          url: `${frontendUrl}/whoop/error?message=Missing_authorization_code`,
          statusCode: 302,
        };
      }

      // Exchange code for token
      await this.whoopService.exchangeCodeForToken(query.code, query.state);

      return {
        url: `${frontendUrl}/whoop/success`,
        statusCode: 302,
      };
    } catch (error) {
      console.error('Whoop callback error:', error);
      const errorMessage = error.message || 'Connection_failed';
      return {
        url: `${frontendUrl}/whoop/error?message=${encodeURIComponent(errorMessage)}`,
        statusCode: 302,
      };
    }
  }

  /**
   * GET /whoop/status
   * Check Whoop connection status for authenticated user
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getConnectionStatus(@Request() req: any): Promise<WhoopConnectionStatus> {
    const userId = req.user.userId;
    const token = await this.whoopService.getTokenForUser(userId);

    return {
      connected: !!token,
      whoopUserId: token?.whoopUserId,
      connectedAt: token?.createdAt,
    };
  }

  /**
   * GET /whoop/profile
   * Get user profile from Whoop
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const userId = req.user.userId;
    return this.whoopService.getUserProfile(userId);
  }

  /**
   * GET /whoop/cycles
   * Get cycle data (daily summaries)
   */
  @Get('cycles')
  @UseGuards(JwtAuthGuard)
  async getCycles(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('nextToken') nextToken?: string,
  ) {
    const userId = req.user.userId;
    return this.whoopService.getCycles(userId, start, end, nextToken);
  }

  /**
   * GET /whoop/recovery
   * Get recovery data
   */
  @Get('recovery')
  @UseGuards(JwtAuthGuard)
  async getRecovery(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('nextToken') nextToken?: string,
  ) {
    const userId = req.user.userId;
    return this.whoopService.getRecovery(userId, start, end, nextToken);
  }

  /**
   * GET /whoop/sleep
   * Get sleep data
   */
  @Get('sleep')
  @UseGuards(JwtAuthGuard)
  async getSleep(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('nextToken') nextToken?: string,
  ) {
    const userId = req.user.userId;
    return this.whoopService.getSleep(userId, start, end, nextToken);
  }

  /**
   * GET /whoop/workouts
   * Get workout data
   */
  @Get('workouts')
  @UseGuards(JwtAuthGuard)
  async getWorkouts(
    @Request() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('nextToken') nextToken?: string,
  ) {
    const userId = req.user.userId;
    return this.whoopService.getWorkouts(userId, start, end, nextToken);
  }

  /**
   * GET /whoop/body
   * Get body measurements
   */
  @Get('body')
  @UseGuards(JwtAuthGuard)
  async getBodyMeasurement(@Request() req: any) {
    const userId = req.user.userId;
    return this.whoopService.getBodyMeasurement(userId);
  }
}
