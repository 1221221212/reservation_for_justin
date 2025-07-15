// backend/src/modules/availability/availability.controller.ts
import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { SeatFirstSpan } from './types';

@Controller('availability')
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) { }

    /**
     * 月間カレンダー用サマリ取得
     */
    @Get('month')
    async getMonth(
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month1to12: number,
        @Query('gridUnit', ParseIntPipe) gridUnit: number,
        @Query('standardSlotMin', ParseIntPipe) standardSlotMin: number,
        @Query('bufferSlots', ParseIntPipe) bufferSlots: number,
    ) {
        const zeroBasedMonth = month1to12 - 1;  // 1-12 → 0-11
        return this.availabilityService.getCalendar(
            BigInt(storeId),
            year,
            zeroBasedMonth,
            gridUnit,
            standardSlotMin,
            bufferSlots,
        );
    }

    /**
     * 日別シートファースト可用性取得
     */
    @Get('day')
    async getDay(
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('date') date: string,
        @Query('partySize', ParseIntPipe) partySize: number,
        @Query('gridUnit', ParseIntPipe) gridUnit: number,
        @Query('standardSlotMin', ParseIntPipe) standardSlotMin: number,
        @Query('bufferSlots', ParseIntPipe) bufferSlots: number,
    ): Promise<SeatFirstSpan[]> {
        return this.availabilityService.getSeatFirst(
            BigInt(storeId),
            date,
            partySize,
            gridUnit,
            standardSlotMin,
            bufferSlots,
        );
    }
}
