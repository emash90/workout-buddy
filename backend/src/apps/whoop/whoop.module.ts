import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhoopController } from './whoop.controller';
import { WhoopService } from './whoop.service';
import { WhoopDataMapperService } from './whoop-data-mapper.service';
import { WhoopToken } from '../../entities/whoop-token.entity';
import { DeviceConnectionsModule } from '../../device-connections/device-connections.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhoopToken]),
    DeviceConnectionsModule,
  ],
  controllers: [WhoopController],
  providers: [WhoopService, WhoopDataMapperService],
  exports: [WhoopService, WhoopDataMapperService],
})
export class WhoopModule {}
