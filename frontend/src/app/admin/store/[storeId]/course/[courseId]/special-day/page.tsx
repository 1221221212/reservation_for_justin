'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import CourseSpecialDayForm from '@/components/ui/courseSpecialDay/CourseSpecialDayForm';

export default function SpecialDayPage() {
    const params = useParams() as { storeId: string; courseId: string };
    const searchParams = useSearchParams();
    const storeId = Number(params.storeId);
    const courseId = Number(params.courseId);
    const date = searchParams.get('date') || '';

    // If date is missing, you might redirect or show an error
    if (!date) {
        return <div className="p-4 text-center text-red-600">日付が指定されていません</div>;
    }

    return (
        <div className="p-8">
            <CourseSpecialDayForm storeId={storeId} courseId={courseId} date={date} />
        </div>
    );
}
