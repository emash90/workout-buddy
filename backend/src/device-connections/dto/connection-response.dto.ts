import { FitnessProvider } from '../enums/provider.enum';

export class ConnectionStatusDto {
  userId: string;
  connectedProvider: FitnessProvider | null;
  providerConnectedAt: Date | null;
  isConnected: boolean;
}

export class AvailableProvidersDto {
  providers: FitnessProvider[];
}

export class DisconnectResponseDto {
  success: boolean;
  message: string;
  provider: FitnessProvider;
}

export class SwitchProviderDto {
  fromProvider: FitnessProvider;
  toProvider: FitnessProvider;
}
