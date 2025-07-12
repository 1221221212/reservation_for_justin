// src/app/admin/store/[storeId]/special-day/new/page.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import SpecialDayForm from '@/components/ui/specialDay/SpecialDayForm';

export default function NewSpecialDayPage() {
    const router = useRouter();
    const params = useParams();            // { storeId: string }
    const searchParams = useSearchParams(); // URL の ?date=YYYY-MM-DD
    const storeId = Number(params.storeId);
    const date = searchParams.get('date') || '';

    return (
        <div className="p-6">
            {date ? (
                <SpecialDayForm storeId={storeId} date={date} />
            ) : (
                <div className="text-center text-red-600">
                    日付が選択されていません。URL に `?date=YYYY-MM-DD` を付与してください。
                </div>
            )}
        </div>
    );
}
