import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessDataService } from './fitness-data.service';
import { FitnessDataController } from './fitness-data.controller';
import { ActivityData, HeartRateData, SleepData, WeightData } from '../../entities';
import { FitbitModule } from '../fitbit/fitbit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityData,
      HeartRateData,
      SleepData,
      WeightData,
    ]),
    FitbitModule,
  ],
  controllers: [FitnessDataController],
  providers: [FitnessDataService],
  exports: [FitnessDataService],
})
export class FitnessDataModule {}
