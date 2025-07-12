// frontend/src/app/admin/store/[storeId]/schedule/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import TimelineGrid, { TimelineItem } from '@/components/ui/timeline/TimelineGrid';
import { fetchMonthDetail } from '@/lib/schedule-api';
import { fetchLayouts } from '@/lib/layout-api';
import { MonthDetail } from '@/types/schedule';

/** "HH:mm" → グリッドインデックスに変換 */
function timeToIndex(time: string, unit = 30): number {
    const [h, m] = time.split(':').map(Number);
    return h * (60 / unit) + m / unit;
}

export default function SchedulePage() {
    const { storeId } = useParams();
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [month, setMonth] = useState(() => new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [monthDetail, setMonthDetail] = useState<MonthDetail[]>([]);
    const [layouts, setLayouts] = useState<{ id: number; name: string; colorClass: string }[]>([]);

    useEffect(() => {
        if (!storeId) return;
        fetchLayouts(Number(storeId)).then(res =>
            setLayouts(res.data.map((l, i) => ({
                ...l,
                colorClass: ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400'][i % 4],
            })))
        );
        fetchMonthDetail(Number(storeId), year, month + 1).then(setMonthDetail);
    }, [storeId, year, month]);

    // Calendar 用
    const cellDataMap = useMemo(() => {
        const m: Record<string, any> = {};
        monthDetail.forEach(d => {
            const badge = d.appliedRuleType === 'specialDay'
                ? '特' : d.appliedRuleType === 'closedDay'
                    ? '休' : d.status === 'open' ? '通' : '';
            m[d.date] = {
                colorClassName: d.status === 'open' ? 'bg-green-50' : 'bg-gray-200',
                badgeContent: badge,
                disabled: d.status === 'closed',
            };
        });
        return m;
    }, [monthDetail]);

    const todayDetail = useMemo(
        () => monthDetail.find(d => d.date === selectedDate),
        [monthDetail, selectedDate]
    );

    // rows: layout + seat rows
    const rows = useMemo(() => {
        if (!todayDetail) return [];
        const seatIds = Array.from(new Set(todayDetail.seatSpans.map(s => s.seatId)));
        return [
            { id: 'layout', label: 'レイアウト' },
            ...seatIds.map(id => ({ id: `seat-${id}`, label: `座席${id}` })),
        ];
    }, [todayDetail]);

    // items: layout と seat を両方集約
    const items = useMemo<TimelineItem[]>(() => {
        if (!todayDetail) return [];
        const list: TimelineItem[] = [];

        // レイアウト帯を item 化
        todayDetail.layoutSpans.forEach(s => {
            const layout = layouts.find(l => l.id === s.layoutId);
            list.push({
                rowId: 'layout',
                start: timeToIndex(s.start),
                end: timeToIndex(s.end),
                colorClass: layout?.colorClass,
                content: (
                    <div className="text-xs text-white truncate">
                        {`${s.start}–${s.end}`}<br />
                        <span className="font-medium">{layout?.name}</span>
                    </div>
                ),
            });
        });

        // 座席帯を item 化
        todayDetail.seatSpans.forEach(s => {
            // 対応する layout の色を取得
            const span = todayDetail.layoutSpans.find(ls => ls.start === s.start && ls.end === s.end);
            const layout = layouts.find(l => l.id === span?.layoutId);
            list.push({
                rowId: `seat-${s.seatId}`,
                start: timeToIndex(s.start),
                end: timeToIndex(s.end),
                colorClass: layout?.colorClass,
                content: (
                    <div className="text-xs text-white truncate">
                        {`${s.start}–${s.end}`}
                    </div>
                ),
            });
        });

        return list;
    }, [todayDetail, layouts]);

    return (
        <div className="p-4">
            <Calendar
                year={year} month={month}
                selectedDate={new Date(selectedDate)}
                onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
                onDateSelect={d => {
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    setSelectedDate(key);
                }}
                cellDataMap={cellDataMap}
            />

            {todayDetail && (
                <div className="mt-6">
                    <TimelineGrid
                        rows={rows}
                        subdivisions={48}  // 30分刻み
                        rowHeight={40}
                        backgroundSpans={[]}  // 使わない
                        items={items}
                        mode="view"
                    />
                </div>
            )}
        </div>
    );
}
