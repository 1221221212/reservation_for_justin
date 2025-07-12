// frontend/src/app/admin/store/[storeId]/schedule/special-day/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import TimelineGrid, { TimelineItem } from '@/components/ui/timeline/TimelineGrid';
import { fetchSpecialDays } from '@/lib/special-day-api';
import { fetchLayouts } from '@/lib/layout-api';
import type { SpecialDay, SpecialDaySchedule } from '@/types/special-day';

// SpecialDayForm と同じ色パターン
const colorClasses = [
    'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400',
    'bg-purple-400', 'bg-indigo-400', 'bg-red-400', 'bg-teal-400',
    'bg-orange-400', 'bg-cyan-400',
];

export default function SpecialDayListPage() {
    const { storeId } = useParams();
    const [days, setDays] = useState<SpecialDay[]>([]);
    const [layouts, setLayouts] = useState<{ id: number; name: string; colorClass: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storeId) return;
        // ① レイアウト取得＋色割り当て
        fetchLayouts(Number(storeId)).then((res) => {
            setLayouts(
                res.data.map((l, i) => ({
                    ...l,
                    colorClass: colorClasses[i % colorClasses.length],
                }))
            );
        });
        // ② 特別日一覧取得
        fetchSpecialDays(Number(storeId))
            .then((res) => {
                const sorted = (res.data as SpecialDay[]).sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setDays(sorted);
            })
            .finally(() => setLoading(false));
    }, [storeId]);

    if (loading) return <div className="p-4">読み込み中…</div>;

    return (
        <div className="p-4 space-y-8">
            <h1 className="text-2xl font-bold">特別日一覧</h1>
            {days.map((day) => {
                const title = format(new Date(day.date), 'yyyy/MM/dd (EEE)');

                // BUSINESS のときだけ items を用意
                const items: TimelineItem[] =
                    day.type === 'BUSINESS'
                        ? (day.schedules ?? []).map((sch: SpecialDaySchedule, idx) => {
                            // 時刻を分解
                            const [sh, sm] = sch.startTime.split(':').map(Number);
                            const [eh, em] = sch.endTime.split(':').map(Number);
                            const start = sh * 2 + sm / 30;
                            const end = eh * 2 + em / 30;
                            const layout = layouts.find((l) => l.id === sch.layoutId);
                            return {
                                rowId: 'row-1',
                                start,
                                end,
                                colorClass: layout?.colorClass ?? 'bg-gray-400',
                                content: (
                                    <div className="flex flex-col text-xs text-white overflow-hidden">
                                        <span>{`${sch.startTime}–${sch.endTime}`}</span>
                                        <span className="truncate font-medium">{layout?.name}</span>
                                    </div>
                                ),
                            };
                        })
                        : [];

                return (
                    <div key={day.id} className="border rounded-lg p-4 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">{title}</h2>
                        {day.reason && (
                            <p className="mb-2">
                                <span className="font-medium">理由:</span> {day.reason}
                            </p>
                        )}
                        {day.type === 'CLOSED' ? (
                            <div className="text-red-600 font-medium">臨時休業日</div>
                        ) : (
                            <TimelineGrid
                                rows={[{ id: 'row-1', label: '営業時間帯' }]}
                                subdivisions={48}
                                rowHeight={32}
                                backgroundSpans={[]}  // 不要になったので空配列
                                items={items}
                                mode="view"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
