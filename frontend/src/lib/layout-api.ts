// frontend/lib/layout-api.ts

import api from './api';
import type { LayoutWithSeats, CreateLayoutParams } from '@/types/layout';

/**
 * 指定店舗のレイアウト一覧を取得
 */
export const fetchLayouts = (storeId: number) =>
    api.get<LayoutWithSeats[]>(`/store/${storeId}/layouts`);

/**
 * 新しいレイアウトを作成
 */
export const createLayout = (
    storeId: number,
    params: CreateLayoutParams,
) =>
    api.post<LayoutWithSeats>(`/store/${storeId}/layouts`, params);
