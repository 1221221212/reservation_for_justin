'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';

export default function AdminIndexPage() {
    const { isLoading, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated && user) {
            let redirectTo: string;

            if (user.role === 'owner') {
                // オーナーはオーナー管理画面へ
                redirectTo = '/admin/owner';
            } else {
                // manager/staff は最初の許可店舗へ
                const ids = user.allowedStoreIds ?? [];
                redirectTo = ids.length > 0
                    ? `/admin/store/${ids[0]}`
                    : '/admin/unauthorized'; // 許可店舗なしは非許可画面へ
            }

            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, user, router]);

    return (
        <ProtectedRoute>
            {/* リダイレクト中のフォールバック */}
            <p>リダイレクト中…</p>
        </ProtectedRoute>
    );
}
