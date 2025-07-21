'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * /admin/store へのアクセス時に役割別リダイレクトを行う
 * - owner        → /admin/owner
 * - manager/Staff→ /admin/store/[storeId]
 */
export default function StoreRedirectPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // 未認証ならログインページへ
        if (!isAuthenticated) {
            router.replace('/admin/login');
            return;
        }

        // owner はオーナー画面へ
        if (user?.role === 'OWNER') {
            router.replace('/admin/owner/store');
            return;
        }

        // manager/staff は許可された最初の店舗へ
        if (user?.role === 'MANAGER' || user?.role === 'STAFF') {
            const ids = user.allowedStoreIds ?? [];
            if (ids.length > 0) {
                router.replace(`/admin/store/${ids[0]}`);
            } else {
                router.replace('/admin/unauthorized');
            }
            return;
        }

        // それ以外は権限なし
        router.replace('/admin/unauthorized');
    }, [isAuthenticated, isLoading, user, router]);

    return <p>リダイレクト中…</p>;
}
