// frontend/lib/auth-api.ts

import api from './api';
import type { User } from '@/types/user';

/**
 * ログイン API を呼び出します
 * @param userId ユーザー ID
 * @param password パスワード
 * @returns accessToken とユーザー情報
 */
export const loginUser = (userId: string, password: string) =>
    api.post<{
        accessToken: string;
        user: User;
    }>('/auth/login', { userId, password });

/**
 * ログイン中ユーザーのプロフィール情報を取得します
 * @returns User オブジェクト
 */
export const fetchProfile = () =>
    api.get<User>('/auth/profile');
