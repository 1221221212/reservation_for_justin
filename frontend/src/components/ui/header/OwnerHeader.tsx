'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface OwnerHeaderProps {
    userName: string;
}

export default function OwnerHeader({ userName }: OwnerHeaderProps) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        // ログアウト後にログイン画面へリダイレクトする場合
        // router.push('/admin/login');
    };

    return (
        <header className="bg-white shadow p-4 flex items-center justify-between">
            {/* 左側：ロゴ＋管理画面トップへのリンク */}
            <Link href="/admin/owner" className="text-2xl font-bold">
                予約システム 管理画面
            </Link>

            {/* 右側：ユーザー名表示＋ログアウトボタン */}
            <div className="flex items-center space-x-4">
                <span>{userName}さん</span>
                <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    ログアウト
                </button>
            </div>
        </header>
    );
}
