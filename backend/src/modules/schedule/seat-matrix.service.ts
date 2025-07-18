// backend/src/modules/schedule/seat-matrix.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { MonthScheduleService } from './month-schedule.service';
import { bitmapToSpans, applyReservation } from '@/common/utils/bitmap-utils';
import { slotToTime, slotsPerDay } from '@/common/utils/slot-utils';

@Injectable()
export class SeatMatrixService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly monthScheduleService: MonthScheduleService,
    ) { }

    /**
     * buildMatrixForDate: 全席分のビットマップを生成
     */
    async buildMatrixForDate(
        storeId: bigint,
        date: Date,
        gridUnit: number,
        bufferSlots: number,
    ): Promise<Record<number, boolean[]>> {
        const year = date.getFullYear();
        const month = date.getMonth();
        const details = await this.monthScheduleService.getMonthDetail(
            Number(storeId), year, month,
        );
        const dateStr = date.toISOString().slice(0, 10);
        const dayDetail = details.find((d) => d.date === dateStr);
        if (!dayDetail) throw new NotFoundException(`DayDetail for ${dateStr} not found`);
        if (dayDetail.status === 'closed') return {};

        const totalSlots = slotsPerDay(gridUnit);
        const matrix: Record<number, boolean[]> = {};

        // 初期ビットマップ（全席分）
        for (const { seatId, start, end } of dayDetail.seatSpans) {
            if (!matrix[seatId]) matrix[seatId] = Array<boolean>(totalSlots).fill(false);
            const s = this.timeToSlot(start, gridUnit);
            const e = this.timeToSlot(end, gridUnit);
            for (let i = s; i < e; i++) matrix[seatId][i] = true;
        }

        // 予約反映 (bookedのみ)
        const reservations = await this.prisma.reservationSeat.findMany({
            where: { date, reservation: { status: 'booked' } },
            select: { seatId: true, startTime: true, endTime: true },
        });
        const fmt = (d: Date) =>
            d.toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit' });

        for (const { seatId, startTime, endTime } of reservations) {
            const sid = Number(seatId);
            const bitmap = matrix[sid];
            if (!bitmap) continue;
            const startSlot = this.timeToSlot(fmt(startTime), gridUnit);
            const endSlot = this.timeToSlot(fmt(endTime), gridUnit);
            applyReservation(bitmap, startSlot, endSlot, bufferSlots);
        }

        return matrix;
    }

    /**
     * compressToSeatFirst: 全席分のスパンを返す
     */
    public async compressToSeatFirst(
        storeId: bigint,
        date: Date,
        gridUnit: number,
        bufferSlots: number,
    ): Promise<Array<{ seatId: number; spans: Array<{ start: string; end: string }> }>> {
        const matrix = await this.buildMatrixForDate(storeId, date, gridUnit, bufferSlots);
        return Object.entries(matrix).map(([id, bitmap]) => {
            const rawSpans = bitmapToSpans(bitmap);
            return {
                seatId: Number(id),
                spans: rawSpans.map(({ startSlot, endSlot }) => ({
                    start: slotToTime(startSlot, gridUnit),
                    end: slotToTime(endSlot, gridUnit),
                })),
            };
        });
    }

    private timeToSlot(timeStr: string, gridUnit: number): number {
        const [h, m] = timeStr.split(':').map(Number);
        return Math.floor((h * 60 + m) / gridUnit);
    }
}
