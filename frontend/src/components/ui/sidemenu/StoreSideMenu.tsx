// frontend/src/components/ui/sidemenu/StoreSideMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { STORE_MENU, StoreMenuItem } from '@/components/ui/sidemenu/storeMenu';

export default function StoreSideMenu() {
    // 認証コンテキストからユーザー情報を取得
    const { user } = useAuth();
    if (!user) {
        // 未ログイン時やコンテキスト未初期化時は表示しない
        return null;
    }
    const userRole = user.role;

    // URL から storeId を取得
    const params = useParams();
    const storeId = Array.isArray(params.storeId)
        ? params.storeId[0]
        : params.storeId || '';

    const pathname = usePathname();
    const [activeKey, setActiveKey] = useState<string>('');

    // パス名からアクティブメニューを判定
    useEffect(() => {
        const found = STORE_MENU.find((item) => {
            const href = item.href?.replace('[storeId]', storeId);
            return href ? pathname.startsWith(href) : false;
        });
        setActiveKey(found?.key || '');
    }, [pathname, storeId]);

    return (
        <nav className="w-64 bg-gray-800 text-white">
            <ul>
                {STORE_MENU.map((item: StoreMenuItem) => {
                    // 第一階層の権限制御
                    if (item.roles && !item.roles.includes(userRole)) return null;

                    const topHref = item.href?.replace('[storeId]', storeId) || '#';
                    const isActive = item.key === activeKey;

                    return (
                        <li key={item.key}>
                            <Link href={topHref}>
                                {item.label}
                            </Link>

                            {/* 第二階層：アクティブ時のみ表示 */}
                            {isActive && item.children && (
                                <ul className="bg-gray-700">
                                    {item.children.map((child) => {
                                        // 第二階層の権限制御
                                        if (child.roles && !child.roles.includes(userRole)) return null;

                                        const childHref = child.href
                                            ?.replace('[storeId]', storeId) || '#';
                                        const isChildActive = pathname.startsWith(childHref);

                                        return (
                                            <li key={child.key}>
                                                <Link href={childHref}>
                                                    {child.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* オーナーの場合のみリンク表示 */}
            {userRole === 'owner' && (
                <div className="mt-4 px-4">
                    <Link href="/admin/owner" className="text-sm text-blue-400 hover:underline">
                        オーナー管理画面へ戻る
                    </Link>
                </div>
            )}
        </nav>
    );
}
