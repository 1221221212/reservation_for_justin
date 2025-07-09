// frontend/lib/user-api.ts

import api from './api';
import type { User, CreateUserParams } from '@/types/user';

/**
 * 全ユーザー一覧を取得します
 */
export const fetchUsers = () =>
    api.get<User[]>('/user');

/**
 * 新規ユーザーを作成します
 * @param params - ユーザー作成時のパラメータ
 */
export const createUser = (params: CreateUserParams) =>
    api.post<User>('/user', params);
