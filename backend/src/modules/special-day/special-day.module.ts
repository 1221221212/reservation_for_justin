import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { SpecialDayService } from './special-day.service';
import { SpecialDayController } from './special-day.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SpecialDayController],
  providers: [SpecialDayService],
  exports: [SpecialDayService],
})
export class SpecialDayModule {}
