'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StoreLayout from '@/components/layout/StoreLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function StoreDetailLayout({ children }: { children: ReactNode }) {
    const { storeId } = useParams();
    const router = useRouter();
    const { isLoading, isAuthenticated, user } = useAuth();

    // 店舗名とエラー状態を管理
    const [storeName, setStoreName] = useState('店舗情報取得中...');
    const [notFound, setNotFound] = useState(false);

    // 1) 認証・権限チェック
    useEffect(() => {
        if (isLoading) return;

        // 未ログインならログイン画面へ
        if (!isAuthenticated) {
            router.replace('/admin/login');
            return;
        }

        // Owner 以外は allowedStoreIds に含まれないと unauthorized
        if (
            user &&
            user.role !== 'owner' &&
            !user.allowedStoreIds.includes(Number(storeId))
        ) {
            router.replace('/admin/unauthorized');
            return;
        }
    }, [isLoading, isAuthenticated, user, storeId, router]);

    // 2) 店舗名フェッチ
    useEffect(() => {
        if (!storeId) return;

        api
            .get<{ name: string }>(`/store/${storeId}`)
            .then(res => {
                setStoreName(res.data.name);
                setNotFound(false);
            })
            .catch(err => {
                // 404＝店舗が存在しない
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setStoreName('店舗名取得エラー');
                }
            });
    }, [storeId]);

    // フォールバック表示
    if (isLoading || !isAuthenticated) {
        return <p>アクセスを確認しています…</p>;
    }

    // storeId が存在しない場合はエラー表示
    if (notFound) {
        return <p className="text-red-600">指定された店舗は存在しません。</p>;
    }

    // 権限がない場合
    if (
        user &&
        user.role !== 'owner' &&
        !user.allowedStoreIds.includes(Number(storeId))
    ) {
        return <p>この店舗へのアクセス権限がありません。</p>;
    }

    // 3) 通常レンダー
    return (
        <StoreLayout
            storeName={storeName}
            userName={user?.username || ''}
        >
            {children}
        </StoreLayout>
    );
}
