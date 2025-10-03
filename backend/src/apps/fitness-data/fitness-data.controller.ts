import {
  Controller,
  Get,
  Post,
  Request,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FitnessDataService } from './fitness-data.service';
import {
  SyncRequestDto,
  SyncResponseDto,
  HistoricalSyncDto,
  WeeklySummaryDto,
  MonthlySummaryDto,
  SleepSummaryDto,
  WeightTrendDto,
  DashboardDto,
  WeeklyBreakdownDto,
} from './dto';

@ApiTags('Fitness Data')
@Controller('fitness-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FitnessDataController {
  constructor(private fitnessDataService: FitnessDataService) {}

  // ===== SYNC ENDPOINTS =====

  @Post('sync')
  @ApiOperation({
    summary: 'Sync all fitness data',
    description: 'Syncs activity, heart rate, sleep, and weight data from Fitbit to local database'
  })
  @ApiResponse({ status: 200, description: 'Data synced successfully', type: SyncResponseDto })
  async syncAll(@Request() req, @Body() dto: SyncRequestDto): Promise<SyncResponseDto> {
    const userId = req.user.userId;
    return this.fitnessDataService.syncUserData(userId, dto.startDate, dto.endDate, dto.dataTypes);
  }

  @Post('sync/today')
  @ApiOperation({
    summary: 'Quick sync for today only',
    description: 'Syncs only today\'s data for faster updates'
  })
  @ApiResponse({ status: 200, description: 'Today\'s data synced successfully', type: SyncResponseDto })
  async syncToday(@Request() req): Promise<SyncResponseDto> {
    const userId = req.user.userId;
    return this.fitnessDataService.syncToday(userId);
  }

  @Post('sync/historical')
  @ApiOperation({
    summary: 'Backfill historical data',
    description: 'Syncs historical data for specified number of days'
  })
  @ApiResponse({ status: 200, description: 'Historical data synced successfully', type: SyncResponseDto })
  async syncHistorical(@Request() req, @Body() dto: HistoricalSyncDto): Promise<SyncResponseDto> {
    const userId = req.user.userId;
    return this.fitnessDataService.syncHistorical(userId, dto.days);
  }

  // ===== ACTIVITY ENDPOINTS =====

  @Get('activities/today')
  @ApiOperation({
    summary: 'Get today\'s activity stats',
    description: 'Get detailed activity stats for today'
  })
  @ApiResponse({ status: 200, description: 'Today\'s activity stats retrieved successfully' })
  async getTodayActivity(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getTodayActivityStats(userId);
  }

  @Get('activities')
  @ApiOperation({
    summary: 'Get activity data',
    description: 'Retrieve stored activity data for a date range'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Activity data retrieved successfully' })
  async getActivities(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.userId;
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.fitnessDataService.getActivities(userId, start, end);
  }

  // ===== HEART RATE ENDPOINTS =====

  @Get('heart-rate')
  @ApiOperation({
    summary: 'Get heart rate data',
    description: 'Retrieve stored heart rate data for a date range'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Heart rate data retrieved successfully' })
  async getHeartRate(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.userId;
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.fitnessDataService.getHeartRate(userId, start, end);
  }

  // ===== SLEEP ENDPOINTS =====

  @Get('sleep')
  @ApiOperation({
    summary: 'Get sleep data',
    description: 'Retrieve stored sleep data for a date range'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Sleep data retrieved successfully' })
  async getSleep(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.userId;
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.fitnessDataService.getSleep(userId, start, end);
  }

  // ===== WEIGHT ENDPOINTS =====

  @Get('weight')
  @ApiOperation({
    summary: 'Get weight data',
    description: 'Retrieve stored weight data for a date range'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Weight data retrieved successfully' })
  async getWeight(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.userId;
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.fitnessDataService.getWeight(userId, start, end);
  }

  // ===== SUMMARY & AGGREGATION ENDPOINTS =====

  @Get('summary/weekly')
  @ApiOperation({
    summary: 'Get weekly activity summary',
    description: 'Get aggregated activity data for the past 7 days'
  })
  @ApiResponse({ status: 200, description: 'Weekly summary retrieved successfully', type: WeeklySummaryDto })
  async getWeeklySummary(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getWeeklyActivitySummary(userId);
  }

  @Get('activities/weekly-breakdown')
  @ApiOperation({
    summary: 'Get weekly activity breakdown',
    description: 'Get daily activity data for the past 7 days (for charts)'
  })
  @ApiResponse({ status: 200, description: 'Weekly breakdown retrieved successfully', type: WeeklyBreakdownDto })
  async getWeeklyBreakdown(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getWeeklyActivityBreakdown(userId);
  }

  @Get('summary/monthly')
  @ApiOperation({
    summary: 'Get monthly activity summary',
    description: 'Get aggregated activity data for the past 30 days'
  })
  @ApiResponse({ status: 200, description: 'Monthly summary retrieved successfully', type: MonthlySummaryDto })
  async getMonthlySummary(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getMonthlyActivitySummary(userId);
  }

  @Get('summary/sleep')
  @ApiOperation({
    summary: 'Get sleep quality summary',
    description: 'Get sleep quality metrics for a specified number of days'
  })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze', example: 7 })
  @ApiResponse({ status: 200, description: 'Sleep summary retrieved successfully', type: SleepSummaryDto })
  async getSleepSummary(@Request() req, @Query('days') days?: number) {
    const userId = req.user.userId;
    return this.fitnessDataService.getSleepQualitySummary(userId, days || 7);
  }

  @Get('summary/weight-trend')
  @ApiOperation({
    summary: 'Get weight trend analysis',
    description: 'Analyze weight changes over a specified number of days'
  })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze', example: 30 })
  @ApiResponse({ status: 200, description: 'Weight trend retrieved successfully', type: WeightTrendDto })
  async getWeightTrend(@Request() req, @Query('days') days?: number) {
    const userId = req.user.userId;
    return this.fitnessDataService.getWeightTrend(userId, days || 30);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get complete dashboard',
    description: 'Get all summary data in a single request (weekly, monthly, sleep, weight)'
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: DashboardDto })
  async getDashboard(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getDashboard(userId);
  }

  @Get('today-stats')
  @ApiOperation({
    summary: 'Get today\'s stats',
    description: 'Get today\'s activity, sleep, and heart rate stats for dashboard display'
  })
  @ApiResponse({ status: 200, description: 'Today\'s stats retrieved successfully' })
  async getTodayStats(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessDataService.getTodayStats(userId);
  }
}
