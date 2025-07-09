'use client';

import { ReactNode } from 'react';
import OwnerHeader from '@/components/ui/header/OwnerHeader';
import OwnerSideMenu from '@/components/ui/sidemenu/OwnerSideMenu';
import { useAuth } from '@/hooks/useAuth';

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      {/* サイドメニュー */}
      <aside className="w-64 bg-white border-r">
        <OwnerSideMenu />
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダーにユーザー名を渡す */}
        {user && <OwnerHeader userName={user.username ?? ''} />}

        {/* ページコンテンツ */}
        <main className="p-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
