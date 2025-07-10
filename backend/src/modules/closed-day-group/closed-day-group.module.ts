import { Module } from '@nestjs/common';
import { ClosedDayGroupService } from './closed-day-group.service';
import { ClosedDayGroupController } from './closed-day-group.controller';

@Module({
  controllers: [ClosedDayGroupController],
  providers: [ClosedDayGroupService],
})
export class ClosedDayGroupModule {}
