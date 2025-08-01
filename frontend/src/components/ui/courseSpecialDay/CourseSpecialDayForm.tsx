'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineGrid, { TimelineItem, BackgroundSpan } from '@/components/ui/timeline/TimelineGrid';
import { timeOptions } from '@/lib/schedule-utils';
import {
    createSpecialCourseScheduleGroup,
    deleteSpecialCourseScheduleGroup,
} from '@/lib/course-api';
import {
    CreateSpecialCourseScheduleGroupParams,
    SpecialCourseScheduleType,
} from '@/types/course-special-schedule';

interface CourseSpecialDayFormProps {
    storeId: number;
    courseId: number;
    date: string; // YYYY-MM-DD
}

export default function CourseSpecialDayForm({ storeId, courseId, date }: CourseSpecialDayFormProps) {
    const router = useRouter();
    const [type, setType] = useState<SpecialCourseScheduleType>('CLOSED');
    const [reason, setReason] = useState<string>('');
    const [items, setItems] = useState<TimelineItem[]>([]);

    // Modal state
    const [activeSpan, setActiveSpan] = useState<BackgroundSpan | null>(null);
    const [modalStartTime, setModalStartTime] = useState<string>('00:00');
    const [modalEndTime, setModalEndTime] = useState<string>('00:30');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Handle grid selection and open modal with initial times */
    const handleSpanChange = (spans: BackgroundSpan[]) => {
        if (type !== 'OPEN') return;
        const span = spans.find(s => !items.some(it => it.rowId === s.rowId && it.start === s.start && it.end === s.end));
        if (!span) return;
        const toTime = (idx: number) => {
            const total = idx * 30;
            const h = Math.floor(total / 60);
            const m = total % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };
        // Set active span and initial modal times
        setActiveSpan(span);
        setModalStartTime(toTime(span.start));
        setModalEndTime(toTime(span.end));
        setIsModalOpen(true);
    };

    /** Confirm modal and add item */
    const confirmModal = () => {
        if (!activeSpan) return;
        const toIndex = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 2 + m / 30;
        };
        const start = toIndex(modalStartTime);
        const end = toIndex(modalEndTime);
        const newItem: TimelineItem = {
            rowId: 'holiday',
            start,
            end,
            colorClass: 'bg-blue-400',
            content: (
                <div className="text-xs text-white truncate">
                    {`${modalStartTime}–${modalEndTime}`}
                </div>
            ),
        };
        setItems(prev => [...prev, newItem]);
        setIsModalOpen(false);
        setActiveSpan(null);
    };

    /** Cancel modal */
    const cancelModal = () => {
        setIsModalOpen(false);
        setActiveSpan(null);
    };

    /** Save handler with conflict override */
    const handleSave = async (override = false) => {
        setSaving(true);
        setError(null);
        const payload: CreateSpecialCourseScheduleGroupParams = {
            date,
            type,
            reason: reason || undefined,
            schedules: type === 'OPEN'
                ? items.map(it => ({
                    startTime: `${String(Math.floor((it.start * 30) / 60)).padStart(2, '0')}:${String((it.start * 30) % 60).padStart(2, '0')}:00`,
                    endTime: `${String(Math.floor((it.end * 30) / 60)).padStart(2, '0')}:${String((it.end * 30) % 60).padStart(2, '0')}:00`,
                }))
                : undefined,
        };
        try {
            await createSpecialCourseScheduleGroup(storeId, courseId, payload);
            router.back();
        } catch (err: any) {
            if (err.response?.status === 409 && !override) {
                if (window.confirm('既存の特別日があります。上書きしますか？')) {
                    await deleteSpecialCourseScheduleGroup(storeId, courseId, date);
                    return handleSave(true);
                }
            } else {
                setError('保存に失敗しました');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">特別日設定: {date}</h2>

            {/* Type Selection */}
            <div className="mb-4 flex space-x-6">
                <label className="inline-flex items-center">
                    <input type="radio" checked={type === 'OPEN'} onChange={() => setType('OPEN')} />
                    <span className="ml-2">特別営業</span>
                </label>
                <label className="inline-flex items-center">
                    <input type="radio" checked={type === 'CLOSED'} onChange={() => setType('CLOSED')} />
                    <span className="ml-2">臨時休業</span>
                </label>
            </div>

            {/* Reason */}
            <textarea
                className="w-full p-2 border rounded mb-4"
                placeholder="理由 (任意)"
                value={reason}
                onChange={e => setReason(e.target.value)}
            />

            {/* Schedule Grid or Closed Message */}
            {type === 'OPEN' ? (
                <TimelineGrid
                    rows={[{ id: 'holiday', label: '祝日スケジュール' }]}
                    subdivisions={48}
                    rowHeight={32}
                    backgroundSpans={[]}
                    items={items}
                    mode="edit"
                    onSpanChange={handleSpanChange}
                />
            ) : (
                <div className="p-8 text-center text-gray-500 border rounded">臨時休業日です</div>
            )}

            {/* Modal for time adjustment */}
            {isModalOpen && activeSpan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-4 w-80">
                        <h3 className="mb-2 font-medium">時間を微調整</h3>
                        <div className="flex space-x-2 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm mb-1">開始</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={modalStartTime}
                                    onChange={e => setModalStartTime(e.target.value)}
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm mb-1">終了</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={modalEndTime}
                                    onChange={e => setModalEndTime(e.target.value)}
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={cancelModal} className="px-3 py-1 bg-gray-300 rounded">キャンセル</button>
                            <button onClick={confirmModal} className="px-3 py-1 bg-blue-600 text-white rounded">追加</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {saving ? '保存中…' : '保存'}
                </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
    );
}
