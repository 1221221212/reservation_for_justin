// backend/src/modules/availability/availability.controller.ts

import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { ReservationSettingsService } from '@/modules/settings/reservation-settings.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';
import { GetMonthAvailabilityDto } from './dto/get-month-availability.dto';
import { GetDayAvailabilityDto } from './dto/get-day-availability.dto';

interface AvailabilityDayResponse {
    settings: {
        gridUnit: number;
        standardReservationMinutes: number;
        bufferSlots: number;
    };
    businessHours: Array<{ start: string; end: string }>;
    data: Array<{ seatId: number; spans: Array<{ start: string; end: string }> }>;
}

@Controller('availability')
export class AvailabilityController {
    constructor(
        private readonly availabilityService: AvailabilityService,
        private readonly settingsService: ReservationSettingsService,
        private readonly monthScheduleService: MonthScheduleService,
    ) { }

    @Get('month')
    async getMonth(
        @Query() query: GetMonthAvailabilityDto,
    ) {
        const { storeId, year, month } = query;
        const monthIndex = month - 1;
        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        const gridUnit = cfg.gridUnit;
        const standardReservationMinutes = cfg.standardReservationMinutes;
        const bufferSlots = Math.ceil(cfg.bufferTime / gridUnit);

        return this.availabilityService.getCalendar(
            BigInt(storeId),
            year,
            monthIndex,
            gridUnit,
            standardReservationMinutes,
            bufferSlots,
        );
    }

    @Get('day')
    async getDay(
        @Query() query: GetDayAvailabilityDto,
    ): Promise<AvailabilityDayResponse> {
        const { storeId, date, partySize } = query;

        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        const gridUnit = cfg.gridUnit;
        const standardReservationMinutes = cfg.standardReservationMinutes;
        const bufferSlots = Math.ceil(cfg.bufferTime / gridUnit);

        const [year, month] = date.split('-').map(Number);
        const monthDetails = await this.monthScheduleService.getMonthDetail(
            storeId,
            year,
            month - 1,
        );
        const dayDetail = monthDetails.find((d) => d.date === date);
        if (!dayDetail) throw new NotFoundException(`DayDetail for ${date} not found`);
        const businessHours = dayDetail.layoutSpans.map(({ start, end }) => ({ start, end }));

        const data = await this.availabilityService.getSeatFirst(
            BigInt(storeId),
            date,
            partySize,
            gridUnit,
            standardReservationMinutes,
            bufferSlots,
        );

        return {
            settings: { gridUnit, standardReservationMinutes, bufferSlots },
            businessHours,
            data,
        };
    }
}