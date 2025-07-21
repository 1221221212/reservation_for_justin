// frontend/src/app/admin/store/[storeId]/courses/[courseId]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchCourse } from '@/lib/course-api';
import { CourseResponseDto } from '@/types/course';
import { CreateScheduleItem } from '@/types/schedule';
import ScheduleGrid from '@/components/ui/schedule/ScheduleGrid';
import ScheduleLegend from '@/components/ui/schedule/ScheduleLegend';
import { rowToTime, timeToRow } from '@/lib/schedule-utils';

export default function CourseDetailPage() {
    const { storeId, courseId } = useParams() as {
        storeId: string;
        courseId: string;
    };
    const router = useRouter();
    const sId = Number(storeId);
    const cId = Number(courseId);

    const [course, setCourse] = useState<CourseResponseDto & {
        scheduleItems?: { dayOfWeek: number; startTime: string; endTime?: string }[];
        applyOnHoliday?: boolean;
        effectiveFrom?: string;
        effectiveTo?: string;
        images?: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // グリッド高さ取得
    const gridRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(24);
    useEffect(() => {
        const update = () => {
            const cell = gridRef.current?.querySelector('.time-cell') as HTMLElement;
            if (cell) setRowHeight(cell.offsetHeight);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // コース詳細フェッチ
    useEffect(() => {
        setLoading(true);
        fetchCourse(sId, cId)
            .then(data => {
                setCourse(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'コース詳細の取得に失敗しました');
                setLoading(false);
            });
    }, [sId, cId]);

    if (loading) {
        return <div className="p-4">読み込み中…</div>;
    }
    if (error) {
        return (
            <div className="p-4 text-red-600">
                エラー: {error}
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 border rounded"
                >
                    戻る
                </button>
            </div>
        );
    }
    if (!course) {
        return <div className="p-4">コースが見つかりませんでした</div>;
    }

    // scheduleItems を ScheduleGrid 用にマッピング
    const gridItems: CreateScheduleItem[] = (course.scheduleItems || []).map(it => ({
        layoutId: 0,
        dayOfWeek: it.dayOfWeek,
        startTime: it.startTime.slice(0, 5),
        endTime: it.endTime?.slice(0, 5),
    }));

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <button
                    onClick={() => router.push(`/admin/store/${sId}/courses/${cId}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    編集
                </button>
            </div>

            {/* 画像ギャラリー */}
            {course.images?.length ? (
                <div className="flex space-x-2 overflow-x-auto">
                    {course.images.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`${course.name} ${idx + 1}`}
                            className="h-32 w-32 object-cover rounded"
                        />
                    ))}
                </div>
            ) : null}

            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p>
                        <span className="font-medium">価格：</span>
                        {course.price != null ? `${course.price} 円` : '―'}
                    </p>
                    <p>
                        <span className="font-medium">人数：</span>
                        {course.minPeople ?? 1} 〜 {course.maxPeople ?? 1} 名
                    </p>
                    <p>
                        <span className="font-medium">所要時間：</span>
                        {course.durationMinutes} 分
                    </p>
                </div>
                <div>
                    <p>
                        <span className="font-medium">有効期間：</span>
                        {course.effectiveFrom ?? '―'} 〜 {course.effectiveTo ?? '―'}
                    </p>
                    <p>
                        <span className="font-medium">祝日適用：</span>
                        {course.applyOnHoliday ? 'はい' : 'いいえ'}
                    </p>
                    <p>
                        <span className="font-medium">ステータス：</span>
                        {course.status}
                    </p>
                </div>
            </div>

            {/* 説明 */}
            {course.description && (
                <div>
                    <p className="font-medium mb-1">説明：</p>
                    <p className="whitespace-pre-wrap">{course.description}</p>
                </div>
            )}

            {/* 週次スケジュール */}
            <div className="space-y-2">
                <p className="font-medium">週次スケジュール</p>
                <ScheduleLegend
                    items={[{ id: 0, name: '提供時間', colorClass: 'bg-blue-400' }]}
                />
                <div ref={gridRef}>
                    <ScheduleGrid
                        schedules={gridItems}
                        layouts={[{ id: 0, name: '提供時間', colorClass: 'bg-blue-400' }]}
                        applyOnHoliday={course.applyOnHoliday ?? false}
                        mode="view"
                        rowHeight={rowHeight}
                    />
                </div>
            </div>

            {/* 戻るボタン */}
            <button
                onClick={() => router.back()}
                className="px-4 py-2 border rounded"
            >
                一覧に戻る
            </button>
        </div>
    );
}
