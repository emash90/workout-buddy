import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitbitService } from './fitbit.service';
import { FitbitController } from './fitbit.controller';
import { FitbitToken } from '../../entities/fitbit-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitbitToken])],
  controllers: [FitbitController],
  providers: [FitbitService],
  exports: [FitbitService],
})
export class FitbitModule {}