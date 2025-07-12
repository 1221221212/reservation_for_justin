// src/components/ui/specialDay/ScheduleModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BackgroundSpan } from '@/components/ui/timeline/TimelineGrid';
import { timeOptions } from '@/lib/schedule-utils'; // 5分刻みオプション

interface ScheduleModalProps {
    isOpen: boolean;
    span: BackgroundSpan | null;
    layouts: { id: number; name: string }[];
    onConfirm: (layoutId: number, span: BackgroundSpan & { startTime: string; endTime: string }) => void;
    onCancel: () => void;
}

export default function ScheduleModal({
    isOpen,
    span,
    layouts,
    onConfirm,
    onCancel,
}: ScheduleModalProps) {
    const [layoutId, setLayoutId] = useState<number | ''>('');
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:30');

    useEffect(() => {
        if (isOpen && span) {
            // span.start/end は 30分刻みセルインデックス → 分数に換算
            const toTime = (idx: number) => {
                const totalMinutes = idx * 30;
                const h = Math.floor(totalMinutes / 60);
                const m = totalMinutes % 60;
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            };
            setStartTime(toTime(span.start));
            setEndTime(toTime(span.end));
        }
        setLayoutId('');
    }, [isOpen, span]);

    if (!isOpen || !span) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-4 w-80">
                <h2 className="text-lg font-semibold mb-2">時間帯を確定</h2>

                <div className="flex space-x-2 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm mb-1">開始</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
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
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        >
                            {timeOptions.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <label className="block mb-4">
                    <span className="text-sm font-medium">レイアウト</span>
                    <select
                        className="mt-1 w-full p-2 border rounded"
                        value={layoutId}
                        onChange={e => setLayoutId(Number(e.target.value) || '')}
                    >
                        <option value="">-- 選択 --</option>
                        {layouts.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </label>

                <div className="flex justify-end space-x-2">
                    <button className="px-3 py-1 bg-gray-300 rounded" onClick={onCancel}>
                        キャンセル
                    </button>
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                        disabled={layoutId === ''}
                        onClick={() => onConfirm(layoutId as number, {
                            ...span,
                            startTime,
                            endTime,
                        })}
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
}
