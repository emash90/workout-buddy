import {
  Controller,
  Get,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DeviceConnectionsService } from './device-connections.service';
import { JwtAuthGuard } from '../apps/auth/guards/jwt-auth.guard';
import { FitnessProvider } from './enums/provider.enum';
import {
  ConnectionStatusDto,
  AvailableProvidersDto,
  DisconnectResponseDto,
  SwitchProviderDto,
} from './dto/connection-response.dto';

@Controller('device-connections')
@UseGuards(JwtAuthGuard)
export class DeviceConnectionsController {
  constructor(
    private readonly deviceConnectionsService: DeviceConnectionsService,
  ) {}

  /**
   * GET /device-connections/status
   * Get the current connection status for the authenticated user
   */
  @Get('status')
  async getStatus(@Request() req): Promise<ConnectionStatusDto> {
    return this.deviceConnectionsService.getConnectionStatus(req.user.userId);
  }

  /**
   * GET /device-connections/providers
   * Get list of all available fitness providers
   */
  @Get('providers')
  getAvailableProviders(): AvailableProvidersDto {
    return {
      providers: this.deviceConnectionsService.getAvailableProviders(),
    };
  }

  /**
   * GET /device-connections/can-connect/:provider
   * Check if user can connect to a specific provider
   */
  @Get('can-connect/:provider')
  async canConnect(
    @Request() req,
    @Param('provider') provider: FitnessProvider,
  ): Promise<{ canConnect: boolean; provider: FitnessProvider }> {
    const canConnect = await this.deviceConnectionsService.canConnectProvider(
      req.user.userId,
      provider,
    );

    return { canConnect, provider };
  }

  /**
   * DELETE /device-connections/:provider
   * Disconnect a specific provider
   */
  @Delete(':provider')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @Request() req,
    @Param('provider') provider: FitnessProvider,
  ): Promise<DisconnectResponseDto> {
    await this.deviceConnectionsService.disconnectProvider(
      req.user.userId,
      provider,
    );

    return {
      success: true,
      message: `Successfully disconnected from ${provider}`,
      provider,
    };
  }

  /**
   * POST /device-connections/switch
   * Switch from one provider to another
   */
  @Post('switch')
  @HttpCode(HttpStatus.OK)
  async switchProvider(
    @Request() req,
    @Body() switchDto: SwitchProviderDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.deviceConnectionsService.switchProvider(
      req.user.userId,
      switchDto.fromProvider,
      switchDto.toProvider,
    );

    return {
      success: true,
      message: `Successfully switched from ${switchDto.fromProvider} to ${switchDto.toProvider}`,
    };
  }
}
