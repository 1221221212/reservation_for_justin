// frontend/src/components/layout/StoreLayout.tsx
import { ReactNode } from 'react';
import StoreHeader from '@/components/ui/header/StoreHeader';
import StoreSideMenu from '@/components/ui/sidemenu/StoreSideMenu';

interface StoreLayoutProps {
    children: ReactNode;
    storeName: string;
    userName: string;
}

export default function StoreLayout({
    children,
    storeName,
    userName,
}: StoreLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* サイドメニュー */}
            <StoreSideMenu />

            {/* メインエリア */}
            <div className="flex-1 flex flex-col">
                {/* ヘッダー */}
                <StoreHeader storeName={storeName} userName={userName} />
                {/* コンテンツ */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
