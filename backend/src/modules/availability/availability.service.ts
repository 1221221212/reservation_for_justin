// backend/src/modules/availability/availability.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { SeatMatrixService } from '@/modules/schedule/seat-matrix.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';
import { DaySummary, SeatFirstSpan } from './types';

@Injectable()
export class AvailabilityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly seatMatrixService: SeatMatrixService,
        private readonly monthScheduleService: MonthScheduleService,
    ) { }

    /**
     * 月間カレンダー用サマリ取得（キャッシュなし・都度計算）
     * status: 'closed' | 'full' | 'available'
     */
    async getCalendar(
        storeId: bigint,
        year: number,
        month: number,       // 0〜11
        gridUnit: number,
        standardSlotMin: number,
        bufferSlots: number,
    ): Promise<DaySummary[]> {
        // 1) 月間スケジュール詳細を一度だけ取得
        const monthDetails = await this.monthScheduleService.getMonthDetail(
            Number(storeId),
            year,
            month,
        );

        // 2) 各日を並列で処理
        const summaries = await Promise.all(
            monthDetails.map(async (dd) => {
                if (dd.status === 'closed') {
                    return { date: dd.date, status: 'closed' } as DaySummary;
                }

                // 3) 日別の「フィルタ前スパン」を取得
                const rawSpans = await this.seatMatrixService.compressToSeatFirst(
                    storeId,
                    new Date(dd.date),
                    gridUnit,
                    bufferSlots,
                );

                // 4) いずれかの席に standardSlotMin 分以上の連続空きがあれば available
                const hasRoom = rawSpans.some(({ spans }) =>
                    spans.some(({ start, end }) => {
                        const [sh, sm] = start.split(':').map(Number);
                        const [eh, em] = end.split(':').map(Number);
                        return (eh * 60 + em) - (sh * 60 + sm) >= standardSlotMin;
                    }),
                );

                return {
                    date: dd.date,
                    status: hasRoom ? 'available' : 'full',
                } as DaySummary;
            }),
        );

        return summaries;
    }

    /**
     * 日別シートファースト可用性取得（キャッシュなし・都度計算）
     */
    async getSeatFirst(
        storeId: bigint,
        dateStr: string,
        partySize: number,
        gridUnit: number,
        standardSlotMin: number,
        bufferSlots: number,
    ): Promise<SeatFirstSpan[]> {
        // 全席の空きスパンをビルド（フィルタ前）
        const allSpans = await this.seatMatrixService.compressToSeatFirst(
            storeId,
            new Date(dateStr),
            gridUnit,
            bufferSlots,
        );

        // パーティサイズ（席容量）でフィルタ
        const seatIds = allSpans.map((s) => BigInt(s.seatId));
        const seats = await this.prisma.seat.findMany({
            where: {
                id: { in: seatIds },
                minCapacity: { lte: partySize },
                maxCapacity: { gte: partySize },
                status: 'active',
            },
            select: { id: true },
        });
        const allowed = new Set(seats.map((s) => Number(s.id)));

        return allSpans.filter((s) => allowed.has(s.seatId));
    }
}
