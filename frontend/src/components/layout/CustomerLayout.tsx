// frontend/src/components/layout/CustomerLayout.tsx
import { ReactNode } from 'react';
import CustomerHeader from '@/components/ui/header/CustomerHeader';

interface CustomerLayoutProps {
    children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <CustomerHeader />
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
}
