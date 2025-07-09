// src/lib/api.ts
import axios from 'axios';
import { useError } from '@/context/ErrorContext'; // 先に ErrorContext を用意しておいてください

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエスト時のトークン付与
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// レスポンス・インターセプターでエラーを共通処理
api.interceptors.response.use(
    response => response,
    error => {
        const data = error.response?.data;
        if (data?.statusCode && data?.message) {
            // 状態管理ライブラリ（Zustand／Context API 等）の pushError を呼び出し
            useError.getState().pushError({
                code: data.code,
                message: data.message,
                details: data.errors,
            });
        } else {
            useError.getState().pushError({
                message: '予期せぬエラーが発生しました',
            });
        }
        return Promise.reject(error);
    }
);

export default api;
