import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Redirect,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FitbitService } from './fitbit.service';
import { FitbitCallbackDto, FitbitAuthResponseDto, FitbitConnectionStatusDto } from './dto';

@ApiTags('Fitbit Integration')
@Controller('fitbit')
export class FitbitController {
  constructor(private readonly fitbitService: FitbitService) {}

  @Get('authorize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Fitbit OAuth authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
    type: FitbitAuthResponseDto,
  })
  async authorize(@Request() req: any): Promise<FitbitAuthResponseDto> {
    const userId = req.user.userId;
    const { authUrl, state } = this.fitbitService.generateAuthUrl(userId);
    return { authUrl, state };
  }

  @Get('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getToken(@Request() req: any) {
    const userId = req.user.userId;
    return this.fitbitService.getUserToken(userId);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Fitbit OAuth callback' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Fitbit' })
  @ApiQuery({ name: 'state', description: 'State parameter for security', required: false })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with success/error status',
  })
  @Redirect()
  async callback(@Query() query: FitbitCallbackDto) {
    try {
      if (!query.code) {
        return {
          url: `${process.env.FRONTEND_URL || 'http://localhost'}/fitbit/error?message=Authorization_denied`,
          statusCode: 302,
        };
      }

      // Exchange code for token
      const tokenResponse = await this.fitbitService.exchangeCodeForToken(
        query.code,
        query.state || ''
      );

      // Extract user ID from state
      const userId = this.extractUserIdFromState(query.state || '');

      // Save token to database
      await this.fitbitService.saveToken(userId, tokenResponse);

      return {
        url: `${process.env.FRONTEND_URL || 'http://localhost'}/fitbit/success`,
        statusCode: 302,
      };
    } catch (error) {
      console.error('Fitbit callback error:', error);
      return {
        url: `${process.env.FRONTEND_URL || 'http://localhost'}/fitbit/error?message=Connection_failed`,
        statusCode: 302,
      };
    }
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check Fitbit connection status' })
  @ApiResponse({
    status: 200,
    description: 'Connection status retrieved successfully',
    type: FitbitConnectionStatusDto,
  })
  async getConnectionStatus(@Request() req: any): Promise<FitbitConnectionStatusDto> {
    const userId = req.user.userId;
    const token = await this.fitbitService.getUserToken(userId);

    if (token) {
      return {
        connected: true,
        fitbitUserId: token.fitbitUserId,
        connectedAt: token.createdAt,
      };
    }

    return { connected: false };
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Fitbit account' })
  @ApiResponse({
    status: 200,
    description: 'Fitbit account disconnected successfully',
  })
  async disconnect(@Request() req: any): Promise<{ message: string }> {
    const userId = req.user.userId;
    const disconnected = await this.fitbitService.disconnectAccount(userId);

    if (disconnected) {
      return { message: 'Fitbit account disconnected successfully' };
    }

    return { message: 'No Fitbit connection found' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Fitbit user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: any) {
    const userId = req.user.userId;
    return this.fitbitService.getUserProfile(userId);
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity list' })
  @ApiQuery({
    name: 'afterDate',
    description: 'Date in YYYY-MM-DD format',
    required: false,
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sort order: asc or desc',
    required: false,
    example: 'asc'
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
    example: 0
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit for pagination',
    required: false,
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Activity data retrieved successfully',
  })
  async getActivity(
    @Request() req: any,
    @Query('afterDate') afterDate?: string,
    @Query('sort') sort?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getActivitySummary(userId, afterDate, sort, offset, limit);
  }

  @Get('heartrate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get heart rate data for a specific date' })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    required: false,
    example: '2024-01-01'
  })
  @ApiResponse({
    status: 200,
    description: 'Heart rate data retrieved successfully',
  })
  async getHeartRate(
    @Request() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getHeartRateData(userId, date || 'today');
  }

  @Get('activity-types')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all available Fitbit activity types',
    description: 'Returns a list of all activity types available in Fitbit.'
  })
  @ApiResponse({
    status: 200,
    description: 'Activity types retrieved successfully',
  })
  async getActivityTypes(@Request() req: any) {
    const userId = req.user.userId;
    return this.fitbitService.getActivityTypes(userId);
  }

  @Get('sleep')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get sleep log for a specific date',
    description: 'Returns sleep data including duration, efficiency, and sleep stages for the specified date.'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format (defaults to today)',
    required: false,
    example: '2024-01-01'
  })
  @ApiResponse({
    status: 200,
    description: 'Sleep data retrieved successfully',
  })
  async getSleep(
    @Request() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getSleepLog(userId, date);
  }

  @Get('daily-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get daily activity summary',
    description: 'Returns a comprehensive summary of daily activities including steps, distance, floors, and calories.'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format (defaults to today)',
    required: false,
    example: '2024-01-01'
  })
  @ApiResponse({
    status: 200,
    description: 'Daily summary retrieved successfully',
  })
  async getDailySummary(
    @Request() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getDailySummary(userId, date);
  }

  @Get('weight')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get weight log',
    description: 'Returns weight measurements for the specified date.'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format (defaults to today)',
    required: false,
    example: '2024-01-01'
  })
  @ApiResponse({
    status: 200,
    description: 'Weight log retrieved successfully',
  })
  async getWeight(
    @Request() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getWeightLog(userId, date);
  }

  @Get('body-fat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get body fat log',
    description: 'Returns body fat percentage measurements for the specified date.'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format (defaults to today)',
    required: false,
    example: '2024-01-01'
  })
  @ApiResponse({
    status: 200,
    description: 'Body fat log retrieved successfully',
  })
  async getBodyFat(
    @Request() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getBodyFatLog(userId, date);
  }

  @Get('active-minutes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get active minutes time series',
    description: 'Returns active zone minutes data for a date range. Defaults to last 7 days if dates not provided.'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in YYYY-MM-DD format (defaults to 7 days ago)',
    required: false,
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in YYYY-MM-DD format (defaults to today)',
    required: false,
    example: '2024-01-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Active minutes data retrieved successfully',
  })
  async getActiveMinutes(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.userId;
    return this.fitbitService.getActiveMinutesTimeSeries(userId, startDate, endDate);
  }

  private extractUserIdFromState(state: string): string {
    try {
      const decoded = Buffer.from(state, 'base64').toString();
      const [userId] = decoded.split(':');
      return userId;
    } catch (error) {
      throw new Error('Invalid state parameter');
    }
  }
}