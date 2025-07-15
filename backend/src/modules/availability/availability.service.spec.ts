/// <reference types="jest" />

import { AvailabilityService } from './availability.service';
import { RedisService } from '@/common/services/redis.service';
import { MonthScheduleService, DayDetail } from '@/modules/schedule/month-schedule.service';
import { SeatFirstSpan } from './types';

describe('AvailabilityService.getCalendar', () => {
    let service: AvailabilityService;
    let mockRedis: Partial<RedisService>;
    let mockMonth: Partial<MonthScheduleService>;

    beforeEach(() => {
        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
        };

        mockMonth = {
            getMonthDetail: jest.fn(),
        };

        service = new AvailabilityService(
            mockRedis as RedisService,
            {} as any,
            mockMonth as MonthScheduleService,
        );
    });

    it('should return "closed" for days with status closed', async () => {
        const details: DayDetail[] = [
            {
                date: '2025-08-01',
                isHoliday: false,
                status: 'closed',
                appliedRuleType: null,
                appliedRuleId: null,
                layoutSpans: [],
                seatSpans: [],
            },
        ];
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue(details);

        const result = await service.getCalendar(
            BigInt(1),
            2025,
            7,   // August (0-based)
            15,
            60,
            1,
        );

        expect(result).toEqual([{ date: '2025-08-01', status: 'closed' }]);
    });

    it('should return "available" when at least one span ≥ standardSlotMin exists', async () => {
        const details: DayDetail[] = [
            {
                date: '2025-08-02',
                isHoliday: false,
                status: 'open',
                appliedRuleType: null,
                appliedRuleId: null,
                layoutSpans: [],
                seatSpans: [],
            },
        ];
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue(details);

        const seatFirst: SeatFirstSpan[] = [
            { seatId: 1, spans: [{ start: '10:00', end: '11:00' }] },
        ];
        jest.spyOn(service, 'getSeatFirst').mockResolvedValue(seatFirst);

        const result = await service.getCalendar(
            BigInt(1),
            2025,
            7,
            15,
            60,
            1,
        );

        expect(result).toEqual([{ date: '2025-08-02', status: 'available' }]);
    });

    it('should return "full" when no spans ≥ standardSlotMin exist', async () => {
        const details: DayDetail[] = [
            {
                date: '2025-08-03',
                isHoliday: false,
                status: 'open',
                appliedRuleType: null,
                appliedRuleId: null,
                layoutSpans: [],
                seatSpans: [],
            },
        ];
        (mockMonth.getMonthDetail as jest.Mock).mockResolvedValue(details);

        const seatFirst: SeatFirstSpan[] = [
            { seatId: 1, spans: [{ start: '10:00', end: '10:30' }] },
            { seatId: 2, spans: [] },
        ];
        jest.spyOn(service, 'getSeatFirst').mockResolvedValue(seatFirst);

        const result = await service.getCalendar(
            BigInt(1),
            2025,
            7,
            15,
            60,
            1,
        );

        expect(result).toEqual([{ date: '2025-08-03', status: 'full' }]);
    });
});
