// backend/src/modules/availability/availability.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { SeatMatrixService } from '@/modules/schedule/seat-matrix.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';

// ドメイン用の型定義をファイル内にインライン定義
/** 月間カレンダー用サマリ */
type DaySummary = { date: string; status: 'closed' | 'full' | 'available' };
/** 席ファーストの詳細可用性スパン */
type SeatFirstSpan = { seatId: number; spans: Array<{ start: string; end: string }> };

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
        const monthDetails = await this.monthScheduleService.getMonthDetail(
            Number(storeId),
            year,
            month,
        );

        const summaries: DaySummary[] = await Promise.all(
            monthDetails.map(async (dd) => {
                if (dd.status === 'closed') {
                    // 閉店日
                    return { date: dd.date, status: 'closed' };
                }

                const rawSpans = await this.seatMatrixService.compressToSeatFirst(
                    storeId,
                    new Date(dd.date),
                    gridUnit,
                    bufferSlots,
                );

                const hasRoom = rawSpans.some(({ spans }) =>
                    spans.some(({ start, end }) => {
                        const [sh, sm] = start.split(':').map(Number);
                        const [eh, em] = end.split(':').map(Number);
                        return (eh * 60 + em) - (sh * 60 + sm) >= standardSlotMin;
                    }),
                );

                // リテラル型を保持するために明示的に型注釈
                const status: 'available' | 'full' = hasRoom ? 'available' : 'full';
                return { date: dd.date, status };
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
        const allSpans = await this.seatMatrixService.compressToSeatFirst(
            storeId,
            new Date(dateStr),
            gridUnit,
            bufferSlots,
        );

        const seatIds = allSpans.map((s) => BigInt(s.seatId));
        const seats = await this.prisma.seat.findMany({
            where: {
                id: { in: seatIds },
                minCapacity: { lte: partySize },
                maxCapacity: { gte: partySize },
                status: 'ACTIVE',
            },
            select: { id: true },
        });
        const allowed = new Set(seats.map((s) => Number(s.id)));

        return allSpans.filter((s) => allowed.has(s.seatId));
    }
}
