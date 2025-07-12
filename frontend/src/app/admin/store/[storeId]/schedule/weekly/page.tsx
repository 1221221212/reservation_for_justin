// src/app/admin/store/[storeId]/schedule/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchScheduleGroups } from '@/lib/schedule-api';
import type { ScheduleGroupDto } from '@/types/schedule';
import { useState, useEffect } from 'react';

export default function ScheduleIndexPage() {
    const params = useParams();
    const storeId = params.storeId!;
    const [groups, setGroups] = useState<ScheduleGroupDto[]>([]);

    useEffect(() => {
        fetchScheduleGroups(Number(storeId)).then(data => {
            // 有効開始日 (effectiveFrom) の昇順でソート
            const sorted = data.sort((a, b) =>
                new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime()
            );
            setGroups(sorted);
        });
    }, [storeId]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">スケジュール一覧</h1>

            {groups.length === 0 ? (
                <p className="text-gray-500">スケジュールグループがありません</p>
            ) : (
                groups.map((g, idx) => {
                    // 有効期間を計算
                    const startDate = new Date(g.effectiveFrom);
                    const nextGroup = groups[idx + 1];
                    let period: string;
                    if (nextGroup) {
                        const endDate = new Date(nextGroup.effectiveFrom);
                        endDate.setDate(endDate.getDate() - 1);
                        period = `${startDate.toLocaleDateString()}〜${endDate.toLocaleDateString()}`;
                    } else {
                        period = `${startDate.toLocaleDateString()}〜`;
                    }

                    return (
                        <Link
                            key={g.id}
                            href={`/admin/store/${storeId}/schedule/weekly/${g.id}`}
                            className="block mb-4 hover:no-underline"
                        >
                            <div className="border p-4 rounded hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{g.name}</span>
                                        <span className="ml-2 text-sm text-gray-500">({period})</span>
                                    </div>
                                    <span className="text-blue-500 text-sm">詳細へ →</span>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}

            <Link href={`/admin/store/${storeId}/schedule/weekly/new`}>
                <button className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    新規作成
                </button>
            </Link>
        </div>
    );
}
