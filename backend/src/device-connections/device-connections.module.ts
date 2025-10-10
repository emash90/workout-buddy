import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceConnectionsController } from './device-connections.controller';
import { DeviceConnectionsService } from './device-connections.service';
import { User } from '../entities/user.entity';
import { FitbitToken } from '../entities/fitbit-token.entity';
import { WhoopToken } from '../entities/whoop-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FitbitToken, WhoopToken]),
  ],
  controllers: [DeviceConnectionsController],
  providers: [DeviceConnectionsService],
  exports: [DeviceConnectionsService],
})
export class DeviceConnectionsModule {}
