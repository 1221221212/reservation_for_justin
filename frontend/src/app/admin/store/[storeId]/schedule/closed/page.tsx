// frontend/src/app/admin/store/[storeId]/schedule/closed/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchClosedDayGroups } from '@/lib/closed-day-api';
import { ClosedDayType } from '@/types/closed-day';
import type { ClosedDayGroupDto } from '@/types/closed-day';
import { useState, useEffect } from 'react';

export default function ClosedDaysPage() {
    const { storeId } = useParams();
    const [groups, setGroups] = useState<ClosedDayGroupDto[]>([]);

    useEffect(() => {
        fetchClosedDayGroups(Number(storeId)).then(data => {
            const sorted = data.sort(
                (a, b) => new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime()
            );
            setGroups(sorted);
        });
    }, [storeId]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">定期休業一覧</h1>

            {groups.length === 0 ? (
                <p className="text-gray-500">定期休業グループがありません</p>
            ) : (
                groups.map((g, idx) => {
                    // 有効開始日と期間計算
                    const startDate = new Date(g.effectiveFrom);
                    const nextGroup = groups[idx + 1];
                    let period: string;
                    if (nextGroup) {
                        const endDate = new Date(nextGroup.effectiveFrom);
                        endDate.setDate(endDate.getDate() - 1);
                        period = `${startDate.toLocaleDateString()} ～ ${endDate.toLocaleDateString()}`;
                    } else {
                        period = `${startDate.toLocaleDateString()} ～`;
                    }
                    // 休業ルール詳細ラベル
                    const weekdays = ['日', '月', '火', '水', '木', '金', '土', '祝'];
                    const weeklyLabels = g.rules
                        .filter(r => r.type === ClosedDayType.WEEKLY && r.dayOfWeek !== undefined)
                        .map(r => weekdays[r.dayOfWeek!]);
                    const monthlyDateLabels = g.rules
                        .filter(r => r.type === ClosedDayType.MONTHLY_DATE && r.dayOfMonth !== undefined)
                        .map(r => (r.dayOfMonth === 99 ? '末日' : String(r.dayOfMonth)));
                    const monthlyNthLabels = g.rules
                        .filter(
                            r =>
                                r.type === ClosedDayType.MONTHLY_NTH_WEEK &&
                                r.weekOfMonth !== undefined &&
                                r.dayOfWeek !== undefined
                        )
                        .map(r => `第${r.weekOfMonth}週 ${weekdays[r.dayOfWeek!]}`);

                    return (
                        <div key={g.id} className="mb-4 border p-4 rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{period}</div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-700 space-y-1">
                                {weeklyLabels.length > 0 && <div>毎週: {weeklyLabels.join('、')}</div>}
                                {monthlyDateLabels.length > 0 && (
                                    <div>毎月: {monthlyDateLabels.join('、')}</div>
                                )}
                                {monthlyNthLabels.length > 0 && (
                                    <div>第N週: {monthlyNthLabels.join('、')}曜日</div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            <Link href={`/admin/store/${storeId}/schedule/closed/new`}>
                <button className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    新規作成
                </button>
            </Link>
        </div>
    );
}
