// frontend/lib/store-api.ts

import api from './api';
import type { Store } from '@/types/store';

/**
 * すべての店舗一覧を取得します
 */
export const fetchStores = () =>
    api.get<Store[]>('/store');

/**
 * 新規店舗を作成します
 * @param name - 作成する店舗名
 */
export const createStore = (name: string) =>
    api.post<Store>('/store', { name });
