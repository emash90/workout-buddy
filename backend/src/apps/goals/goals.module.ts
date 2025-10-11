import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { UserGoals } from '../../entities/user-goals.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserGoals]),
    HttpModule,
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
