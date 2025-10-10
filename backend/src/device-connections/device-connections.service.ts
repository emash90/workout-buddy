import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FitbitToken } from '../entities/fitbit-token.entity';
import { WhoopToken } from '../entities/whoop-token.entity';
import { FitnessProvider } from './enums/provider.enum';
import { ConnectionStatus } from './interfaces/connection-status.interface';

@Injectable()
export class DeviceConnectionsService {
  private readonly logger = new Logger(DeviceConnectionsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FitbitToken)
    private fitbitTokenRepository: Repository<FitbitToken>,
    @InjectRepository(WhoopToken)
    private whoopTokenRepository: Repository<WhoopToken>,
  ) {}

  /**
   * Get the connection status for a user
   */
  async getConnectionStatus(userId: string): Promise<ConnectionStatus> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      connectedProvider: user.connectedProvider as FitnessProvider | null,
      providerConnectedAt: user.providerConnectedAt,
      isConnected: !!user.connectedProvider,
    };
  }

  /**
   * Check if user can connect to a new provider
   * Only one provider can be connected at a time
   */
  async canConnectProvider(userId: string, provider: FitnessProvider): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If no provider is connected, can connect any provider
    if (!user.connectedProvider) {
      return true;
    }

    // If trying to connect the same provider that's already connected, allow it (re-auth)
    if (user.connectedProvider === provider) {
      return true;
    }

    // Cannot connect a different provider
    return false;
  }

  /**
   * Update user's connected provider
   */
  async updateConnectedProvider(
    userId: string,
    provider: FitnessProvider,
  ): Promise<void> {
    const canConnect = await this.canConnectProvider(userId, provider);

    if (!canConnect) {
      throw new BadRequestException(
        `Cannot connect ${provider}. Please disconnect your current provider first.`
      );
    }

    await this.userRepository.update(userId, {
      connectedProvider: provider,
      providerConnectedAt: new Date(),
    });

    this.logger.log(`User ${userId} connected to ${provider}`);
  }

  /**
   * Disconnect a provider for a user
   */
  async disconnectProvider(userId: string, provider: FitnessProvider): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.connectedProvider !== provider) {
      throw new BadRequestException(
        `${provider} is not currently connected for this user`
      );
    }

    // Delete tokens based on provider
    if (provider === FitnessProvider.FITBIT) {
      await this.fitbitTokenRepository.delete({ userId });
    } else if (provider === FitnessProvider.WHOOP) {
      await this.whoopTokenRepository.delete({ userId });
    }

    // Clear provider info from user
    await this.userRepository.update(userId, {
      connectedProvider: null,
      providerConnectedAt: null,
    });

    this.logger.log(`User ${userId} disconnected from ${provider}`);
  }

  /**
   * Switch from one provider to another
   */
  async switchProvider(
    userId: string,
    fromProvider: FitnessProvider,
    toProvider: FitnessProvider,
  ): Promise<void> {
    if (fromProvider === toProvider) {
      throw new BadRequestException('Cannot switch to the same provider');
    }

    // Disconnect old provider
    await this.disconnectProvider(userId, fromProvider);

    this.logger.log(`User ${userId} switched from ${fromProvider} to ${toProvider}`);
  }

  /**
   * Get token for user's connected provider
   */
  async getProviderToken(userId: string): Promise<FitbitToken | WhoopToken | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.connectedProvider) {
      return null;
    }

    if (user.connectedProvider === FitnessProvider.FITBIT) {
      return this.fitbitTokenRepository.findOne({ where: { userId } });
    } else if (user.connectedProvider === FitnessProvider.WHOOP) {
      return this.whoopTokenRepository.findOne({ where: { userId } });
    }

    return null;
  }

  /**
   * Check if a provider token exists and is valid
   */
  async hasValidToken(userId: string, provider: FitnessProvider): Promise<boolean> {
    let token: FitbitToken | WhoopToken | null = null;

    if (provider === FitnessProvider.FITBIT) {
      token = await this.fitbitTokenRepository.findOne({ where: { userId } });
      if (!token) return false;

      // Check if Fitbit token is expired
      const expiresAt = (token as FitbitToken).expiresAt;
      return expiresAt > new Date();
    } else if (provider === FitnessProvider.WHOOP) {
      token = await this.whoopTokenRepository.findOne({ where: { userId } });
      if (!token) return false;

      // Check if Whoop token is expired (expiresAt is Unix timestamp)
      const expiresAt = (token as WhoopToken).expiresAt;
      return expiresAt > Date.now();
    }

    return false;
  }

  /**
   * Get list of all available providers
   */
  getAvailableProviders(): FitnessProvider[] {
    return Object.values(FitnessProvider);
  }
}
