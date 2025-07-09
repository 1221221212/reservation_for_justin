// frontend/src/components/guards/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type ProtectedRouteProps = {
    children: ReactNode;
    /** このページにアクセス可能なロールを列挙。未指定なら権限チェックをスキップ */
    roles?: string[];
};

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }
        if (!isAuthenticated) {
            router.replace('/admin/login');
            return;
        }
        if (roles && user && !roles.includes(user.role)) {
            router.replace('/admin/unauthorized');
        }
    }, [isAuthenticated, isLoading, roles, user, router]);

    if (isLoading) {
        return <p>ログイン状態を確認しています…</p>;
    }
    if (!isAuthenticated) {
        return <p>ログイン状態を確認しています…</p>;
    }
    if (roles && user && !roles.includes(user.role)) {
        return <p>権限を確認しています…</p>;
    }

    return <>{children}</>;
}
