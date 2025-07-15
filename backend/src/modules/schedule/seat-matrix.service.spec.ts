/// <reference types="jest" />

import { PrismaService } from '@/prisma-client/prisma.service';
import { MonthScheduleService } from './month-schedule.service';
import { SeatMatrixService } from './seat-matrix.service';
import { slotsPerDay } from '@/common/utils/slot-utils';

describe('SeatMatrixService', () => {
    let service: SeatMatrixService;
    let mockPrisma: PrismaService;
    let mockMonth: MonthScheduleService;

    beforeEach(() => {
        // PrismaService のモックを any でキャストしつつ、reservationSeat を必ず定義
        mockPrisma = {
            reservationSeat: {
                findMany: jest.fn(),
            },
        } as unknown as PrismaService;

        // MonthScheduleService のモック
        mockMonth = {
            getMonthDetail: jest.fn(),
        } as unknown as MonthScheduleService;

        service = new SeatMatrixService(mockPrisma, mockMonth);
    });

    it('営業枠のみで予約なしの場合、全スロットが available になる', async () => {
        // モックで営業枠を 10:00–12:00 に設定
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue([
            {
                date: '2025-07-15',
                status: 'open',
                appliedRuleType: 'weeklySchedule',
                appliedRuleId: 1,
                layoutSpans: [],
                seatSpans: [{ seatId: 1, start: '10:00', end: '12:00' }],
            },
        ]);

        // 予約なし
        (mockPrisma.reservationSeat.findMany as jest.Mock).mockResolvedValue([]);

        const matrix = await service.buildMatrixForDate(
            BigInt(1),
            new Date('2025-07-15'),
            60,      // gridUnit=60分
            0,       // bufferSlots=0
        );

        const total = slotsPerDay(60);
        expect(matrix[1]).toHaveLength(total);
        for (let i = 0; i < total; i++) {
            const expected = i >= 10 && i < 12;
            expect(matrix[1][i]).toBe(expected);
        }
    });

    it('予約反映＋bufferSlots 前後が false になる', async () => {
        // モックで営業枠を 10:00–14:00 に設定
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue([
            {
                date: '2025-07-15',
                status: 'open',
                appliedRuleType: 'weeklySchedule',
                appliedRuleId: 1,
                layoutSpans: [],
                seatSpans: [{ seatId: 1, start: '10:00', end: '14:00' }],
            },
        ]);

        // 11:00–12:00 の予約あり
        (mockPrisma.reservationSeat.findMany as jest.Mock).mockResolvedValue([
            {
                seatId: BigInt(1),
                startTime: new Date('2025-07-15T11:00:00Z'),
                endTime: new Date('2025-07-15T12:00:00Z'),
            },
        ]);

        const matrix = await service.buildMatrixForDate(
            BigInt(1),
            new Date('2025-07-15'),
            60,   // gridUnit=60分
            1,    // bufferSlots=1
        );

        // スロット番号: 10=10:00,11=11:00,12=12:00,13=13:00
        // 予約帯 11-12 → buffer 前後を含め 10-13 は false
        expect(matrix[1][10]).toBe(false); // buffer start
        expect(matrix[1][11]).toBe(false); // reserved
        expect(matrix[1][12]).toBe(false); // buffer end
        // 9・14 など枠外／枠外は false は当たり前、13 は true
        expect(matrix[1][13]).toBe(true);
    });

    it('compressToSeatFirst が正しい spans を返す', async () => {
        // モックで営業枠を 10:00–13:00 に設定
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue([
            {
                date: '2025-07-15',
                status: 'open',
                appliedRuleType: 'weeklySchedule',
                appliedRuleId: 1,
                layoutSpans: [],
                seatSpans: [{ seatId: 1, start: '10:00', end: '13:00' }],
            },
        ]);

        // 11:00–12:00 の予約あり
        (mockPrisma.reservationSeat.findMany as jest.Mock).mockResolvedValue([
            {
                seatId: BigInt(1),
                startTime: new Date('2025-07-15T11:00:00Z'),
                endTime: new Date('2025-07-15T12:00:00Z'),
            },
        ]);

        const result = await service.compressToSeatFirst(
            BigInt(1),
            new Date('2025-07-15'),
            60,
            0,
        );

        // 10–11 と 12–13 の2スパンに分かれる
        expect(result).toEqual([
            {
                seatId: 1,
                spans: [
                    { start: '10:00', end: '11:00' },
                    { start: '12:00', end: '13:00' },
                ],
            },
        ]);
    });
});
