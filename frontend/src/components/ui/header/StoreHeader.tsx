// frontend/src/components/ui/header/StoreHeader.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface StoreHeaderProps {
    storeName: string;
    userName: string;
}

export default function StoreHeader({ storeName, userName }: StoreHeaderProps) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        // 必要に応じてリダイレクトを実装
        // router.push('/admin/login');
    };

    return (
        <header className="bg-white shadow p-4 flex items-center justify-between">
            {/* 左側：ロゴ＋店舗管理画面トップへのリンク */}
            <div className="flex items-center space-x-4">
                <Link href="/admin/store">
                    予約システム
                </Link>
                <span className="text-lg">{storeName} 管理画面</span>
            </div>

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
