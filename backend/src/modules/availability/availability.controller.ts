// backend/src/modules/availability/availability.controller.ts

import { Controller, Get, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { ReservationSettingsService } from '@/modules/settings/reservation-settings.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';
import { SeatFirstSpan } from './types';

interface AvailabilityDayResponse {
    settings: {
        gridUnit: number;
        standardReservationMinutes: number;
        bufferSlots: number;
    };
    businessHours: Array<{ start: string; end: string }>;  // 追加
    data: SeatFirstSpan[];
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
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month1to12: number,
    ) {
        const monthIndex = month1to12 - 1;
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
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('date') date: string,
        @Query('partySize', ParseIntPipe) partySize: number,
    ): Promise<AvailabilityDayResponse> {
        // 1) 設定取得
        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        const gridUnit = cfg.gridUnit;
        const standardReservationMinutes = cfg.standardReservationMinutes;
        const bufferSlots = Math.ceil(cfg.bufferTime / gridUnit);

        // 2) 営業時間スパン取得
        const [year, month] = date.split('-').map(Number);
        const monthDetails = await this.monthScheduleService.getMonthDetail(
            storeId,
            year,
            month - 1,
        );
        const dayDetail = monthDetails.find((d) => d.date === date);
        if (!dayDetail) throw new NotFoundException(`DayDetail for ${date} not found`);
        const businessHours = dayDetail.layoutSpans.map(({ start, end }) => ({ start, end }));

        // 3) 生スパン取得
        const data = await this.availabilityService.getSeatFirst(
            BigInt(storeId),
            date,
            partySize,
            gridUnit,
            standardReservationMinutes,
            bufferSlots,
        );

        // 4) レスポンス返却
        return {
            settings: { gridUnit, standardReservationMinutes, bufferSlots },
            businessHours,
            data,
        };
    }
}
