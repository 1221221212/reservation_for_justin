// backend/src/modules/availability/availability.controller.ts
import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { ReservationSettingsService } from '@/modules/settings/reservation-settings.service';
import { SeatFirstSpan } from './types';

@Controller('availability')
export class AvailabilityController {
    constructor(
        private readonly availabilityService: AvailabilityService,
        private readonly settingsService: ReservationSettingsService,
    ) { }

    @Get('month')
    async getMonth(
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month1to12: number,
    ) {
        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        return this.availabilityService.getCalendar(
            BigInt(storeId),
            year,
            month1to12 - 1,
            cfg.gridUnit,
            cfg.standardReservationMinutes,
            cfg.bufferTime,
        );
    }

    @Get('day')
    async getDay(
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('date') date: string,
        @Query('partySize', ParseIntPipe) partySize: number,
    ): Promise<SeatFirstSpan[]> {
        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        return this.availabilityService.getSeatFirst(
            BigInt(storeId),
            date,
            partySize,
            cfg.gridUnit,
            cfg.standardReservationMinutes,
            cfg.bufferTime,
        );
    }
}
