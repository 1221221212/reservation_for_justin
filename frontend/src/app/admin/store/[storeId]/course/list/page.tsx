'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchCourses } from '@/lib/course-api';
import { CourseResponseDto } from '@/types/course';

export default function CourseListPage() {
    const params = useParams() as { storeId: string };
    const storeId = Number(params.storeId);
    const router = useRouter();

    const [courses, setCourses] = useState<CourseResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API 呼び出し
    useEffect(() => {
        (async () => {
            try {
                const data = await fetchCourses(storeId);
                setCourses(data);
            } catch (err: any) {
                setError(err.message || 'コース一覧の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        })();
    }, [storeId]);

    // ローディング表示
    if (loading) {
        return <div className="p-4">読み込み中…</div>;
    }

    // エラー表示
    if (error) {
        return <div className="p-4 text-red-600">エラー: {error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">コース一覧</h1>

            {/* 新規追加ボタン */}
            <button
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => router.push(`/admin/store/${storeId}/course/new`)}
            >
                + 新しいコースを追加
            </button>

            {/* コースがなければメッセージ */}
            {courses.length === 0 ? (
                <p>登録済みのコースがありません。</p>
            ) : (
                <ul className="space-y-2">
                    {courses.map((course) => (
                        <li
                            key={course.id}
                            className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                                router.push(
                                    `/admin/store/${storeId}/course/${course.id}`
                                )
                            }
                        >
                            <div>
                                <p className="text-lg font-medium">{course.name}</p>
                                <p className="text-sm text-gray-500">
                                    {course.durationMinutes}分 ／{' '}
                                    {course.price != null
                                        ? `${course.price.toLocaleString()}円`
                                        : '価格未設定'}
                                </p>
                            </div>
                            <span className="text-sm text-gray-400">▶</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
