// src/app/admin/store/[storeId]/schedule/[groupId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchScheduleGroup } from '@/lib/schedule-api';
import { fetchLayouts } from '@/lib/layout-api';
import type { ScheduleGroupDto } from '@/types/schedule';
import type { LayoutWithSeats } from '@/types/layout';
import ScheduleLegend from '@/components/ui/schedule/ScheduleLegend';
import ScheduleGrid from '@/components/ui/schedule/ScheduleGrid';

// 色クラスサンプル（New ページと同じ配列を使用）
const colorClasses = [
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-pink-400',
    'bg-purple-400',
    'bg-indigo-400',
    'bg-red-400',
    'bg-teal-400',
    'bg-orange-400',
    'bg-cyan-400',
];

export default function ScheduleDetailPage() {
    const { storeId, groupId } = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<ScheduleGroupDto | null>(null);
    const [layouts, setLayouts] = useState<(LayoutWithSeats & { colorClass: string })[]>([]);

    // スケジュールグループ詳細を取得
    useEffect(() => {
        if (!storeId || !groupId) return;
        fetchScheduleGroup(Number(storeId), Number(groupId)).then(setGroup);
    }, [storeId, groupId]);

    // レイアウト一覧を取得し色を割り当て
    useEffect(() => {
        if (!storeId) return;
        fetchLayouts(Number(storeId)).then(res => {
            const mapped = res.data.map((l: LayoutWithSeats, i: number) => ({
                ...l,
                colorClass: colorClasses[i % colorClasses.length],
            }));
            setLayouts(mapped);
        });
    }, [storeId]);

    if (!group) {
        return <p className="p-4">読み込み中…</p>;
    }

    // group.schedules に紐づくレイアウトのみ抽出
    const uniqueLayouts = layouts.filter(l =>
        group.schedules.some(s => s.layoutId === l.id),
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">
                    {group.name}（{new Date(group.effectiveFrom).toLocaleDateString()}〜）
                </h1>
                <button
                    className="px-3 py-1 text-sm text-blue-500 hover:underline"
                    onClick={() => router.back()}
                >
                    一覧に戻る
                </button>
            </div>

            <ScheduleLegend items={uniqueLayouts.map(l => ({ id: l.id, name: l.name, colorClass: l.colorClass }))} />

            <ScheduleGrid
                schedules={group.schedules}
                layouts={uniqueLayouts.map(l => ({ id: l.id, name: l.name, colorClass: l.colorClass }))}
                applyOnHoliday={group.applyOnHoliday}
                mode="view"
                rowHeight={24}
            />
        </div>
    );
}
