'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { fetchAvailableCourses } from '@/lib/course-api';
import { fetchNextStepFlags } from '@/lib/reservation-api';
import type {
    AvailableCourseDto,
    AvailableCoursesResponseDto,
} from '@/types/course';
import type { NextStepFlags } from '@/types/reservation';

export default function CourseSelectionPage() {
    const { storeId, date } = useParams<{ storeId: string; date: string }>();
    const searchParams = useSearchParams();
    const time = searchParams.get('time')!;
    const partySize = Number(searchParams.get('partySize'));
    const router = useRouter();

    // ──────────────────────────────────────────────────
    // 0) コース選択許可チェック用
    const [guardLoading, setGuardLoading] = useState(true);

    useEffect(() => {
        const sid = Number(storeId);
        fetchNextStepFlags(sid)
            .then(({ data }) => {
                const { allowCourseSelection, allowSeatSelection } = data as NextStepFlags;
                if (!allowCourseSelection) {
                    // コース選択不可なら次ステップへリダイレクト
                    const base = `/store/${storeId}/reserve/${date}`;
                    const qs = `?time=${time}&partySize=${partySize}`;
                    if (allowSeatSelection) {
                        router.replace(`${base}/select${qs}`);
                    } else {
                        router.replace(`${base}/info${qs}`);
                    }
                } else {
                    setGuardLoading(false);
                }
            })
            .catch((e) => {
                console.error('コース選択ガード取得失敗:', e);
                setGuardLoading(false);
            });
    }, [storeId, date, time, partySize, router]);

    // ──────────────────────────────────────────────────
    // 1) コース一覧取得
    const [courses, setCourses] = useState<AvailableCourseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (guardLoading) return;
        setIsLoading(true);
        fetchAvailableCourses(
            Number(storeId),
            date!,
            time!,
            partySize,
        )
            .then((res) => {
                setCourses(res.data.courses);
                setError(null);
            })
            .catch((e) => {
                setError(e.message || 'コース一覧取得に失敗しました');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [guardLoading, storeId, date, time, partySize]);

    // コース選択時
    const handleSelect = (courseId: number) => {
        const base = `/store/${storeId}/reserve/${date}/select`;
        const qs = `?time=${time}&partySize=${partySize}&courseId=${courseId}`;
        router.push(`${base}${qs}`);
    };

    // ガード中は何も表示せず
    if (guardLoading) {
        return <p className="p-4">チェック中...</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                店舗 {storeId} / {date} のコース選択
            </h1>

            {isLoading && <p>読み込み中...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!isLoading && !error && (
                <ul className="space-y-3">
                    {courses.length === 0 && <p>利用可能なコースがありません。</p>}
                    {courses.map((course) => (
                        <li
                            key={course.courseId}
                            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelect(course.courseId)}
                        >
                            <h2 className="font-medium text-lg">{course.name}</h2>
                            <p className="text-sm text-gray-600">
                                所要時間: {course.durationMinutes}分
                            </p>
                            {course.price != null && (
                                <p className="text-right font-semibold">
                                    {course.price.toLocaleString()}円
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
