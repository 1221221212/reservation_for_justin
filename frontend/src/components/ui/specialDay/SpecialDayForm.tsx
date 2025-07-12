// src/components/ui/specialDay/SpecialDayForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import TimelineGrid, { TimelineItem, BackgroundSpan } from '@/components/ui/timeline/TimelineGrid';
import ScheduleModal from '@/components/ui/specialDay/ScheduleModal';
import { fetchLayouts } from '@/lib/layout-api';
import { createSpecialDay } from '@/lib/special-day-api';
import { CreateSpecialDayParams } from '@/types/special-day';

// SchedulePage と同じ色パターン
const colorClasses = [
    'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400',
    'bg-purple-400', 'bg-indigo-400', 'bg-red-400', 'bg-teal-400',
    'bg-orange-400', 'bg-cyan-400',
];

interface SpecialDayFormProps {
    storeId: number;
    date: string;
}

export default function SpecialDayForm({ storeId, date }: SpecialDayFormProps) {
    const router = useRouter();
    const [type, setType] = useState<'BUSINESS' | 'CLOSED'>('BUSINESS');
    const [reason, setReason] = useState('');
    const [layouts, setLayouts] = useState<{ id: number; name: string; colorClass: string }[]>([]);
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [activeSpan, setActiveSpan] = useState<BackgroundSpan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLayouts(storeId).then(res =>
            setLayouts(
                res.data.map((l, i) => ({ ...l, colorClass: colorClasses[i % colorClasses.length] }))
            )
        );
    }, [storeId]);

    // ドラッグ選択で新規 span 作成
    const handleSpanChange = (spans: BackgroundSpan[]) => {
        if (type !== 'BUSINESS') return;
        const newSpan = spans.find(s =>
            !items.some(it => it.rowId === s.rowId && it.start === s.start && it.end === s.end)
        );
        if (newSpan) {
            setActiveSpan(newSpan);
            setIsModalOpen(true);
        }
    };

    // モーダル「追加」
    const handleConfirm = (layoutId: number, spanTimes: { startTime: string; endTime: string }) => {
        if (!activeSpan) return;
        const span = activeSpan;
        const layout = layouts.find(l => l.id === layoutId)!;
        const toIndex = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 2 + m / 30;
        };
        const start = toIndex(spanTimes.startTime);
        const end = toIndex(spanTimes.endTime);
        const newItem: TimelineItem = {
            rowId: span.rowId,
            start,
            end,
            colorClass: layout.colorClass,
            content: (
                <div className="flex flex-col text-xs text-white overflow-hidden">
                    <span>{`${spanTimes.startTime}–${spanTimes.endTime}`}</span>
                    <span className="truncate font-medium">{layout.name}</span>
                </div>
            ),
        };
        setItems(prev => [...prev, newItem]);
        setActiveSpan(null);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setActiveSpan(null);
        setIsModalOpen(false);
    };

    // 保存
    const doSave = async (override = false) => {
        const payload: CreateSpecialDayParams = {
            date,
            type,
            reason,
            schedules:
                type === 'BUSINESS'
                    ? items.map(it => ({
                        layoutId: layouts.find(l => l.colorClass === it.colorClass)!.id,
                        startTime: format(new Date(0, 0, 0, Math.floor(it.start / 2), (it.start % 2) * 30), 'HH:mm'),
                        endTime: format(new Date(0, 0, 0, Math.floor(it.end / 2), (it.end % 2) * 30), 'HH:mm'),
                    }))
                    : [],
            override,
        };
        try {
            await createSpecialDay(storeId, payload);
            router.push(`/admin/store/${storeId}/schedule/special-day`);
        } catch (err: any) {
            if (err.response?.status === 409 && !override) {
                if (window.confirm('この日付はすでに特別日として登録されています。上書きしますか？')) {
                    return doSave(true);
                }
            } else {
                alert('保存に失敗しました');
            }
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
                特別日のスケジュール作成：{format(new Date(date), 'yyyy/MM/dd (EEE)')}
            </h2>
            <div className="mb-4 flex space-x-6">
                <label className="inline-flex items-center space-x-1">
                    <input
                        type="radio"
                        className="form-radio"
                        checked={type === 'BUSINESS'}
                        onChange={() => setType('BUSINESS')}
                    />
                    <span>特別営業日</span>
                </label>
                <label className="inline-flex items-center space-x-1">
                    <input
                        type="radio"
                        className="form-radio"
                        checked={type === 'CLOSED'}
                        onChange={() => setType('CLOSED')}
                    />
                    <span>臨時休業日</span>
                </label>
            </div>
            <div className="mb-4">
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="理由"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />
            </div>
            {type === 'BUSINESS' ? (
                <TimelineGrid
                    rows={[{ id: 'row-1', label: '営業時間帯' }]}
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
            {type === 'BUSINESS' && activeSpan && (
                <ScheduleModal
                    isOpen={isModalOpen}
                    span={activeSpan}
                    layouts={layouts.map(l => ({ id: l.id, name: l.name }))}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => doSave()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    保存
                </button>
            </div>
        </div>
    );
}
