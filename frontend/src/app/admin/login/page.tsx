'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLoginPage() {
    const router = useRouter();
    const { isAuthenticated, login, user } = useAuth();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectTo =
                user.role === 'owner'
                    ? '/admin/owner'
                    : user.allowedStoreIds?.[0]
                        ? `/admin/store/${user.allowedStoreIds[0]}`
                        : '/admin';
            router.replace(redirectTo);
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ここは try…catch を書かずに login() だけ
        // エラーはグローバルインターセプターが拾ってくれます
        await login(userId, password);
    };

    if (isAuthenticated) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>ユーザーID</label>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label>パスワード</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                ログイン
            </button>
        </form>
    );
}
