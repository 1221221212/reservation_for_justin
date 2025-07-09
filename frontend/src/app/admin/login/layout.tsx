// frontend/src/app/admin/login/layout.tsx
'use client';

import { ReactNode } from 'react';
import AdminLoginLayout from '@/components/layout/AdminLoginLayout';

export default function AdminLoginLayoutWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
}
