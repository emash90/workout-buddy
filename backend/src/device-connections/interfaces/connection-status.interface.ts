import { FitnessProvider } from '../enums/provider.enum';

export interface ConnectionStatus {
  userId: string;
  connectedProvider: FitnessProvider | null;
  providerConnectedAt: Date | null;
  isConnected: boolean;
}

export interface ProviderToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | Date;
  providerId?: string;
  metadata?: any;
}
