// frontend/lib/seat-api.ts

import api from './api';
import {
    SeatWithAttributes,
    CreateSeatParams,
} from '@/types/seat';

/**
 * 指定店舗の座席一覧を取得する
 */
export const fetchSeats = (storeId: number) =>
    api.get<SeatWithAttributes[]>(`/store/${storeId}/seats`);

/**
 * 新しい座席を作成する
 */
export const createSeat = (
    storeId: number,
    params: CreateSeatParams,
) => api.post<SeatWithAttributes>(`/store/${storeId}/seats`, params);

/**
 * 座席を suspended 状態に更新する
 */
export const suspendSeat = (
    storeId: number,
    seatId: number,
) =>
    api.patch<{ id: number; status: 'suspended'; updatedAt: string }>(
        `/store/${storeId}/seats/${seatId}/suspend`,
    );
