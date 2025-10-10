import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './apps/auth/auth.module';
import { UsersModule } from './apps/users/users.module';
import { FitbitModule } from './apps/fitbit/fitbit.module';
import { WhoopModule } from './apps/whoop/whoop.module';
import { FitnessDataModule } from './apps/fitness-data/fitness-data.module';
import { AiModule } from './apps/ai/ai.module';
import { HealthModule } from './health/health.module';
import { DeviceConnectionsModule } from './device-connections/device-connections.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    FitbitModule,
    WhoopModule,
    DeviceConnectionsModule,
    FitnessDataModule,
    AiModule,
    HealthModule,
  ],
})
export class AppModule {}
