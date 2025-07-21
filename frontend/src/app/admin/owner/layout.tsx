'use client';

import { ReactNode } from 'react';
import OwnerLayout from '@/components/layout/OwnerLayout';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';

export default function OwnerWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute roles={['OWNER']}>
      {/* OwnerLayout 内部で useAuth() からユーザー名を取得 */}
      <OwnerLayout>
        {children}
      </OwnerLayout>
    </ProtectedRoute>
  );
}
