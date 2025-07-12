// backend/src/modules/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { ScheduleService } from './​schedule.service';
import { MonthScheduleService } from './month-schedule.service';
import { ScheduleController } from './​schedule.controller';
import { PrismaModule } from '@/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduleController],
  providers: [ScheduleService,MonthScheduleService,],
  exports: [ScheduleService],
})
export class ScheduleModule {}
