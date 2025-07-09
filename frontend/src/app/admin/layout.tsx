// frontend/src/app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname }  from 'next/navigation';
import { AuthProvider }  from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      {pathname === '/admin/login' ? (
        // ログインページだけはガードをスキップ
        children
      ) : (
        // それ以外は認証チェック
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
