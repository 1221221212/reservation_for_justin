// backend/src/modules/availability/availability.module.ts
import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { RedisService } from '@/common/services/redis.service';
import { ScheduleModule } from '@/modules/schedule/​schedule.module';
import { SeatMatrixService } from '@/modules/schedule/seat-matrix.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';
import { ReservationSettingsModule } from '@/modules/settings/reservation-settings.module';


@Module({
    imports: [
        ScheduleModule,
        ReservationSettingsModule,
    ],
    providers: [
        AvailabilityService,
        RedisService,
        SeatMatrixService,
        MonthScheduleService,
    ],
    controllers: [AvailabilityController],
})
export class AvailabilityModule { }
