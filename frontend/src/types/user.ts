// frontend/src/types/user.ts

export interface User {
    id: number;
    userId: string;
    username: string;
    role: string;
    status: string;
    // 管理画面用に許可ストア情報を含む場合
    allowedStoreIds?: number[];
    store?: {
        id: number;
        name: string;
    } | null;
}

export interface CreateUserParams {
    userId: string;
    username: string;
    password: string;
    role: 'OWNER' | 'MANAGER' | 'STAFF';
    storeId?: number; // owner の場合は不要
}