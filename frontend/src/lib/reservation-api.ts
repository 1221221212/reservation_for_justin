import api from './api';
import type { DaySummary, SeatFirstSpan, AvailabilityDayResponse } from '@/types/reservation';

/**
 * 月別可用性取得
 */
export const fetchAvailabilityMonth = (
    storeId: number,
    year: number,
    month1to12: number,
) =>
    api.get<DaySummary[]>(
        `/availability/month?storeId=${storeId}&year=${year}&month=${month1to12}`
    );

/**
 * 日別可用性取得
 */
export const fetchAvailabilityDay = (
    storeId: number,
    date: string,
    partySize: number,
) =>
    api.get<AvailabilityDayResponse>(
        `/availability/day?storeId=${storeId}&date=${date}&partySize=${partySize}`
    );

/**
* 次の画面遷移先取得
*/
export const fetchNextStep = (storeId: number) =>
    api.get<{ nextStep: 'course' | 'seat' | 'info' }>(
        `/store/${storeId}/settings/reservation/next-step`
    );