// frontend/src/app/store/[storeId]/reserve/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Calendar from '@/components/ui/calendar/Calendar';
import type { CalendarCellInfo } from '@/components/ui/calendar/types';
import { formatDateKey } from '@/components/ui/calendar/CalendarUtils';
import { fetchAvailabilityMonth } from '@/lib/reservation-api';
import type { DaySummary } from '@/types/reservation';

export default function ReserveCalendarPage() {
    const { storeId } = useParams();
    const router = useRouter();
    const sid = Number(storeId);

    // 今日を基準に表示する年月
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());  // 0–11

    // カレンダーのセルごとの情報マップ
    const [cellDataMap, setCellDataMap] = useState<Record<string, CalendarCellInfo>>({});

    // 月が変わるたびにバックエンドから取得
    useEffect(() => {
        if (isNaN(sid)) return;

        fetchAvailabilityMonth(sid, year, month + 1)
            .then((res) => {
                const map: Record<string, CalendarCellInfo> = {};
                res.data.forEach(({ date, status }: DaySummary) => {
                    if (status === 'closed') {
                        map[date] = {
                            disabled: true,
                            colorClassName: 'bg-gray-200',
                            badgeContent: 'ー',
                        };
                    } else if (status === 'available') {
                        map[date] = {
                            disabled: false,
                            colorClassName: 'bg-green-100',
                            badgeContent: '◯',
                        };
                    } else if (status === 'full') {
                        map[date] = {
                            disabled: false,
                            colorClassName: 'bg-red-100',
                            badgeContent: '✕',
                        };
                    }
                });
                setCellDataMap(map);
            })
            .catch((e) => {
                console.error('カレンダー取得失敗', e);
            });
    }, [sid, year, month]);

    if (isNaN(sid)) {
        return <p className="p-4 text-red-600">無効な店舗IDです。</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">店舗 {sid} の予約カレンダー</h1>
            <Calendar
                year={year}
                month={month}
                selectedDate={undefined}
                cellDataMap={cellDataMap}
                onMonthChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                }}
                onDateSelect={(date) => {
                    const key = formatDateKey(date); // "YYYY-MM-DD"
                    router.push(`/store/${sid}/reserve/${key}`);
                }}
            />
        </div>
    );
}
