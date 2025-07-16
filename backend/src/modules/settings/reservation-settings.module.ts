import { Module } from '@nestjs/common';
import { ReservationSettingsService } from './reservation-settings.service';
import { ReservationSettingsController } from './reservation-settings.controller';
import { PrismaService } from '@/prisma-client/prisma.service';

@Module({
    controllers: [ReservationSettingsController],
    providers: [ReservationSettingsService, PrismaService],
    exports: [ReservationSettingsService],
})
export class ReservationSettingsModule { }
