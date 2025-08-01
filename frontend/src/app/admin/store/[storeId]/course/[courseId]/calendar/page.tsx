'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import TimelineGrid, { TimelineItem } from '@/components/ui/timeline/TimelineGrid';
import {
    fetchCourseMonthlyAvailability,
    fetchCourse,
} from '@/lib/course-api';
import {
    CourseMonthlyAvailabilityResponseDto,
    DailyAvailabilityDto,
    AvailabilityIntervalDto,
} from '@/types/course';

/** Date をローカル日付文字列 "YYYY-MM-DD" に変換 */
function formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** "HH:mm:ss" → グリッドインデックスに変換 */
function timeToIndex(time: string, unit = 30): number {
    const [h, m] = time.split(':').map(Number);
    return h * (60 / unit) + m / unit;
}

export default function CourseCalendarPage() {
    const { storeId, courseId } = useParams() as { storeId: string; courseId: string };
    const router = useRouter();
    const [courseName, setCourseName] = useState<string>('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedDate, setSelectedDate] = useState<string>(
        () => formatDateLocal(new Date())
    );
    const [monthData, setMonthData] =
        useState<CourseMonthlyAvailabilityResponseDto | null>(null);
    const [dayData, setDayData] = useState<DailyAvailabilityDto | null>(null);

    // コース名取得
    useEffect(() => {
        if (!storeId || !courseId) return;
        fetchCourse(Number(storeId), Number(courseId)).then(course => {
            setCourseName(course.name);
        });
    }, [storeId, courseId]);

    // 月次可用性取得
    useEffect(() => {
        if (!storeId || !courseId) return;
        fetchCourseMonthlyAvailability(
            Number(storeId),
            Number(courseId),
            year,
            month + 1
        ).then(setMonthData);
    }, [storeId, courseId, year, month]);

    // 日次データ更新
    useEffect(() => {
        if (!monthData) return;
        const d = monthData.days.find(d => d.date === selectedDate) || null;
        setDayData(d);
    }, [monthData, selectedDate]);

    // カレンダーのセル装飾マップ
    const cellDataMap = useMemo(() => {
        const m: Record<string, { badgeContent?: string; colorClassName?: string }> = {};
        monthData?.days.forEach(d => {
            m[d.date] = {
                colorClassName: d.available ? 'bg-green-50' : 'bg-gray-200',
                badgeContent: d.available ? '' : '休',
            };
        });
        return m;
    }, [monthData]);

    // TimelineGrid 用アイテム
    const items = useMemo<TimelineItem[]>(() => {
        if (!dayData) return [];
        return dayData.intervals.map((iv: AvailabilityIntervalDto) => ({
            rowId: 'course',
            start: timeToIndex(iv.startTime),
            end: timeToIndex(iv.endTime),
            colorClass: 'bg-blue-400',
            content: (
                <div className="text-xs text-white truncate">
                    {`${iv.startTime.slice(0, 5)}–${iv.endTime.slice(0, 5)}`}
                </div>
            ),
        }));
    }, [dayData]);

    // selectedDate を Date オブジェクトに変換
    const selectedDateObj = useMemo(() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        return new Date(y, m - 1, d);
    }, [selectedDate]);

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    className="px-3 py-1 border rounded"
                    onClick={() => router.back()}
                >
                    ← 戻る
                </button>
                <h1 className="text-2xl font-bold">{courseName}</h1>
                <div />
            </div>

            <Calendar
                year={year}
                month={month}
                selectedDate={selectedDateObj}
                onMonthChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                }}
                onDateSelect={d => setSelectedDate(formatDateLocal(d))}
                cellDataMap={cellDataMap}
            />

            {/* 特別日設定ボタン */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() =>
                        router.push(
                            `/admin/store/${storeId}/course/${courseId}/special-day?date=${selectedDate}`
                        )
                    }
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    特別日設定
                </button>
            </div>

            {dayData && (
                <div className="mt-6">
                    <TimelineGrid
                        rows={[{ id: 'course', label: '利用可能時間' }]}
                        subdivisions={48}
                        rowHeight={40}
                        backgroundSpans={[]}
                        items={items}
                        mode="view"
                    />
                </div>
            )}
        </div>
    );
}
