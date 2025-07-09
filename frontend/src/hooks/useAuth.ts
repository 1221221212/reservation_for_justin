// frontend/src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * 認証コンテキストを利用するカスタムフック
 * - isAuthenticated: ログイン状態
 * - user: ペイロードに含まれるユーザー情報（id, role, username など）
 * - login: ログイン処理
 * - logout: ログアウト処理
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within <AuthProvider>');
    }
    return context;
}
