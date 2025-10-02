import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './apps/auth/auth.module';
import { UsersModule } from './apps/users/users.module';
import { FitbitModule } from './apps/fitbit/fitbit.module';
import { FitnessDataModule } from './apps/fitness-data/fitness-data.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    FitbitModule,
    FitnessDataModule,
    HealthModule,
  ],
})
export class AppModule {}
