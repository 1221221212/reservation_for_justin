// backend/src/modules/availability/availability.service.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/services/redis.service';
import { SeatMatrixService } from '@/modules/schedule/seat-matrix.service';
import { MonthScheduleService } from '@/modules/schedule/month-schedule.service';
import { isCacheableDate } from '@/common/utils/date-utils';
import { DaySummary, SeatFirstSpan } from './types';

@Injectable()
export class AvailabilityService {
    constructor(
        private readonly redis: RedisService,
        private readonly seatMatrixService: SeatMatrixService,
        private readonly monthScheduleService: MonthScheduleService,
    ) { }

    /**
     * 月間カレンダー用サマリ取得
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
        // --- キャッシュキー組み立て ---
        const monthStr = String(month + 1).padStart(2, '0');
        const monthKeyDate = `${year}-${monthStr}-01`;
        const cacheKey = `availability:month:${storeId}:${year}-${monthStr}` +
            `:g${gridUnit}:s${standardSlotMin}:b${bufferSlots}`;

        // --- キャッシュ取得 ---
        if (isCacheableDate(monthKeyDate, 90)) {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached) as DaySummary[];
            }
        }

        // --- 実データ取得 & “full” 判定 ---
        const monthDetails = await this.monthScheduleService.getMonthDetail(
            Number(storeId),
            year,
            month,
        );

        const summary: DaySummary[] = [];
        for (const dd of monthDetails) {
            if (dd.status === 'closed') {
                summary.push({ date: dd.date, status: 'closed' });
            } else {
                // 空きスパンを取得 (partySize には標準スロット長を代用)
                const seatFirst = await this.getSeatFirst(
                    storeId,
                    dd.date,
                    standardSlotMin,
                    gridUnit,
                    standardSlotMin,
                    bufferSlots,
                );
                // いずれかの席に標準SlotMin以上の連続空きスパンがあれば available
                const hasAny = seatFirst.some((s) =>
                    s.spans.some((span) => {
                        const [sh, sm] = span.start.split(':').map(Number);
                        const [eh, em] = span.end.split(':').map(Number);
                        return (eh * 60 + em) - (sh * 60 + sm) >= standardSlotMin;
                    }),
                );
                summary.push({ date: dd.date, status: hasAny ? 'available' : 'full' });
            }
        }

        // --- キャッシュ書き込み ---
        if (isCacheableDate(monthKeyDate, 90)) {
            await this.redis.set(cacheKey, JSON.stringify(summary), 60 * 60 * 24 * 95);
        }

        return summary;
    }

    // --- 既存の getSeatFirst メソッドはそのまま ---
    async getSeatFirst(
        storeId: bigint,
        dateStr: string,
        partySize: number,
        gridUnit: number,
        standardSlotMin: number,
        bufferSlots: number,
    ): Promise<SeatFirstSpan[]> {
        const cacheKey = `availability:day:${storeId}:${dateStr}` +
            `:g${gridUnit}:b${bufferSlots}`;
        if (isCacheableDate(dateStr, 90)) {
            const cached = await this.redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }
        const result = await this.seatMatrixService.compressToSeatFirst(
            storeId,
            new Date(dateStr),
            gridUnit,
            bufferSlots,
        );
        if (isCacheableDate(dateStr, 90)) {
            await this.redis.set(cacheKey, JSON.stringify(result), 60 * 60 * 24 * 95);
        }
        return result;
    }
}
