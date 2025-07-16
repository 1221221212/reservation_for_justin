// frontend/src/lib/reservation-settings-api.ts
import api from './api';
import type { ReservationSettings } from '@/types/reservation-settings';

/**
 * 指定店舗の予約設定を取得
 * GET /v1/store/:storeId/settings/reservation
 */
export const fetchReservationSettings = (
    storeId: number,
): Promise<ReservationSettings> =>
    api
        .get<ReservationSettings>(`/store/${storeId}/settings/reservation`)
        .then(res => res.data);

/**
 * 指定店舗の予約設定を更新
 * PUT /v1/store/:storeId/settings/reservation
 */
export const updateReservationSettings = (
    storeId: number,
    settings: ReservationSettings,
): Promise<ReservationSettings> =>
    api
        .put<ReservationSettings>(`/store/${storeId}/settings/reservation`, settings)
        .then(res => res.data);
