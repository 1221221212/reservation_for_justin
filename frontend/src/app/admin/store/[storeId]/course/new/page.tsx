// frontend/src/app/admin/store/[storeId]/courses/new/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createCourse } from '@/lib/course-api';
import { CreateCourseDto, CourseStatus, ScheduleItem } from '@/types/course';
import ScheduleGrid from '@/components/ui/schedule/ScheduleGrid';
import { rowToTime, timeOptions } from '@/lib/schedule-utils';

type NewCourseForm = CreateCourseDto & {
    scheduleItems: ScheduleItem[];
    applyOnHoliday: boolean;
};

export default function NewCoursePage() {
    const { storeId } = useParams() as { storeId: string };
    const store = Number(storeId);
    const router = useRouter();

    const [form, setForm] = useState<NewCourseForm>({
        name: '',
        price: undefined,
        minPeople: undefined,
        maxPeople: undefined,
        durationMinutes: 60,
        description: '',
        effectiveFrom: undefined,
        effectiveTo: undefined,
        status: CourseStatus.ACTIVE,
        scheduleItems: [],
        applyOnHoliday: false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(24);
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState<{ row: number; col: number } | null>(null);
    const [endPos, setEndPos] = useState<{ row: number; col: number } | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [newStartTime, setNewStartTime] = useState('00:00');
    const [newEndTime, setNewEndTime] = useState('00:30');

    // 行高さ取得
    useEffect(() => {
        const update = () => {
            const cell = gridRef.current?.querySelector('.time-cell') as HTMLElement;
            if (cell) setRowHeight(cell.offsetHeight);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // セル選択
    const onCellMouseDown = (r: number, c: number) => {
        setStartPos({ row: r, col: c });
        setEndPos({ row: r, col: c });
        setIsSelecting(true);
    };
    const onCellMouseEnter = (r: number, c: number) => {
        if (isSelecting && startPos?.col === c) {
            setEndPos({ row: r, col: c });
        }
    };
    const isCellSelected = (r: number, c: number) => {
        if (!startPos || !endPos || c !== startPos.col) return false;
        const [s, e] = startPos.row <= endPos.row
            ? [startPos.row, endPos.row]
            : [endPos.row, startPos.row];
        return r >= s && r <= e;
    };

    // マウスアップでモーダル
    useEffect(() => {
        const onUp = () => {
            if (isSelecting && startPos && endPos) {
                setNewStartTime(rowToTime(startPos.row));
                setNewEndTime(rowToTime(endPos.row + 1));
                setShowModal(true);
            }
            setIsSelecting(false);
        };
        window.addEventListener('mouseup', onUp);
        return () => window.removeEventListener('mouseup', onUp);
    }, [isSelecting, startPos, endPos]);

    // モーダル確定
    const confirmSelection = () => {
        if (startPos) {
            setForm(f => ({
                ...f,
                scheduleItems: [
                    ...f.scheduleItems,
                    {
                        dayOfWeek: startPos.col,
                        startTime: newStartTime,
                        endTime: newEndTime, // always a string
                    },
                ],
            }));
        }
        setShowModal(false);
    };
    const cancelSelection = () => setShowModal(false);
    const removeItem = (idx: number) => {
        setForm(f => ({
            ...f,
            scheduleItems: f.scheduleItems.filter((_, i) => i !== idx),
        }));
    };

    // フォーム更新
    const updateForm = <K extends keyof NewCourseForm>(key: K, val: NewCourseForm[K]) => {
        setForm(f => ({ ...f, [key]: val }));
    };

    // 保存
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await createCourse(store, form);
            router.push(`/admin/store/${store}/course/list`);
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">新規コース＆時間帯設定</h1>
            {error && <div className="text-red-600">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-6">
                {/* コース情報入力 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* コース名 */}
                    <div className="col-span-2">
                        <label className="block mb-1 font-medium">
                            コース名<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* 価格 */}
                    <div>
                        <label className="block mb-1 font-medium">価格</label>
                        <input
                            type="number"
                            value={form.price ?? ''}
                            onChange={e =>
                                updateForm('price', e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* 人数 */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block mb-1 font-medium">最小人数</label>
                            <input
                                type="number"
                                min={1}
                                value={form.minPeople ?? ''}
                                onChange={e =>
                                    updateForm(
                                        'minPeople',
                                        e.target.value ? Number(e.target.value) : undefined
                                    )
                                }
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">最大人数</label>
                            <input
                                type="number"
                                min={1}
                                value={form.maxPeople ?? ''}
                                onChange={e =>
                                    updateForm(
                                        'maxPeople',
                                        e.target.value ? Number(e.target.value) : undefined
                                    )
                                }
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    {/* 所要時間 */}
                    <div>
                        <label className="block mb-1 font-medium">
                            所要時間（分）<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.durationMinutes}
                            onChange={e => updateForm('durationMinutes', Number(e.target.value))}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* 説明 */}
                    <div className="col-span-2">
                        <label className="block mb-1 font-medium">説明</label>
                        <textarea
                            value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>

                    {/* 提供期間 */}
                    <div>
                        <label className="block mb-1 font-medium">提供開始日</label>
                        <input
                            type="date"
                            value={form.effectiveFrom ?? ''}
                            onChange={e =>
                                updateForm('effectiveFrom', e.target.value || undefined)
                            }
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">提供終了日</label>
                        <input
                            type="date"
                            value={form.effectiveTo ?? ''}
                            onChange={e =>
                                updateForm('effectiveTo', e.target.value || undefined)
                            }
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* 祝日適用 */}
                    <div className="col-span-2 flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={form.applyOnHoliday}
                            onChange={e => updateForm('applyOnHoliday', e.target.checked)}
                            className="form-checkbox"
                        />
                        <span>祝日を含める</span>
                    </div>

                    {/* ステータス */}
                    <div className="col-span-2">
                        <label className="block mb-1 font-medium">ステータス</label>
                        <select
                            value={form.status}
                            onChange={e => updateForm('status', e.target.value as CourseStatus)}
                            className="w-full p-2 border rounded"
                        >
                            <option value={CourseStatus.ACTIVE}>公開中</option>
                            <option value={CourseStatus.INACTIVE}>非公開</option>
                            <option value={CourseStatus.SUSPENDED}>一時停止</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={form.applyOnHoliday}
                            onChange={e => updateForm('applyOnHoliday', e.target.checked)}
                            className="mt-1"
                        />
                        <span>祝日の時間帯も設定する</span>
                    </label>
                </div>

                {/* 時間帯設定 */}
                <div className="p-4 border rounded bg-gray-50">
                    <h2 className="font-medium mb-2">提供可能時間帯</h2>
                    <div ref={gridRef}>
                        <ScheduleGrid
                            schedules={form.scheduleItems.map(it => ({
                                layoutId: 0,
                                dayOfWeek: it.dayOfWeek,
                                startTime: it.startTime,
                                endTime: it.endTime!,
                            }))}
                            layouts={[{ id: 0, name: '', colorClass: 'bg-blue-400' }]}
                            applyOnHoliday={form.applyOnHoliday}
                            mode="edit"
                            rowHeight={rowHeight}
                            onCellMouseDown={onCellMouseDown}
                            onCellMouseEnter={onCellMouseEnter}
                            isCellSelected={isCellSelected}
                            onItemRemove={removeItem}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-6 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {saving ? '保存中…' : 'コース作成＆時間帯保存'}
                    </button>
                </div>
            </form>

            {/* 時間選択モーダル */}
            {showModal && startPos && endPos && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-80">
                        <h3 className="mb-2">
                            時間を選択（{['日', '月', '火', '水', '木', '金', '土', '祝'][startPos.col]}曜日）
                        </h3>
                        <div className="flex space-x-2 mb-4">
                            {[{ label: '開始', value: newStartTime, onChange: setNewStartTime },
                            { label: '終了', value: newEndTime, onChange: setNewEndTime }].map(({ label, value, onChange }) => (
                                <div key={label} className="flex-1">
                                    <label className="block text-sm mb-1">{label}</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={value}
                                        onChange={e => onChange(e.target.value)}
                                    >
                                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={cancelSelection} className="px-3 py-1 bg-gray-300 rounded">キャンセル</button>
                            <button onClick={confirmSelection} className="px-3 py-1 bg-blue-600 text-white rounded">追加</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
