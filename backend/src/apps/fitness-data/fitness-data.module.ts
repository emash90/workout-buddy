import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessDataService } from './fitness-data.service';
import { FitnessDataController } from './fitness-data.controller';
import { ActivityData, HeartRateData, SleepData, WeightData, UserGoals } from '../../entities';
import { FitbitModule } from '../fitbit/fitbit.module';
import { WhoopModule } from '../whoop/whoop.module';
import { DeviceConnectionsModule } from '../../device-connections/device-connections.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityData,
      HeartRateData,
      SleepData,
      WeightData,
      UserGoals,
    ]),
    FitbitModule,
    WhoopModule,
    DeviceConnectionsModule,
  ],
  controllers: [FitnessDataController],
  providers: [FitnessDataService],
  exports: [FitnessDataService],
})
export class FitnessDataModule {}
