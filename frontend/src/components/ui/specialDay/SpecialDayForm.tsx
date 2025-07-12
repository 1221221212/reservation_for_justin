// src/components/ui/specialDay/SpecialDayForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import TimelineGrid, {
    BackgroundSpan,
    TimelineItem,
} from '@/components/ui/timeline/TimelineGrid';
import ScheduleModal from '@/components/ui/specialDay/ScheduleModal';
import { fetchLayouts } from '@/lib/layout-api';
import { createSpecialDay } from '@/lib/special-day-api';
import { CreateSpecialDayParams } from '@/types/special-day';

// SchedulePage と同じ色パターンを流用
const colorClasses = [
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-pink-400',
    'bg-purple-400',
    'bg-indigo-400',
    'bg-red-400',
    'bg-teal-400',
    'bg-orange-400',
    'bg-cyan-400',
];

interface SpecialDayFormProps {
    storeId: number;
    date: string; // 'YYYY-MM-DD'
}

export default function SpecialDayForm({
    storeId,
    date,
}: SpecialDayFormProps) {
     const router = useRouter();

    // ── 選択タイプ ──
    const [type, setType] = useState<'BUSINESS' | 'CLOSED'>('BUSINESS');

    // ── 理由入力用 state ──
    const [reason, setReason] = useState<string>('');

    // ── レイアウト一覧の取得 ──
    const [layouts, setLayouts] = useState<
        { id: number; name: string; colorClass: string }[]
    >([]);
    useEffect(() => {
        fetchLayouts(storeId).then((res) => {
            setLayouts(
                res.data.map((l, i) => ({
                    ...l,
                    colorClass: colorClasses[i % colorClasses.length],
                }))
            );
        });
    }, [storeId]);

    // ── スパン & アイテム状態 ──
    const [backgroundSpans, setBackgroundSpans] = useState<BackgroundSpan[]>(
        []
    );
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [activeSpan, setActiveSpan] = useState<BackgroundSpan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── グリッドでドラッグ選択されたとき ──
    const handleSpanChange = (spans: BackgroundSpan[]) => {
        if (type !== 'BUSINESS') return;
        const added = spans.filter(
            (s) =>
                !backgroundSpans.some(
                    (bs) => bs.rowId === s.rowId && bs.start === s.start && bs.end === s.end
                )
        );
        if (added.length > 0) {
            setActiveSpan(added[0]);
            setIsModalOpen(true);
        }
        setBackgroundSpans(spans);
    };

    // ── モーダル「追加」 ──
    const handleConfirm = (
        layoutId: number,
        span: BackgroundSpan & { startTime: string; endTime: string }
    ) => {
        // 5分刻み時刻 → 分 → 30分セルインデックスに換算
        const [sh, sm] = span.startTime.split(':').map(Number);
        const [eh, em] = span.endTime.split(':').map(Number);
        const startIndex = (sh * 60 + sm) / 30;
        const endIndex = (eh * 60 + em) / 30;

        const newSpan: BackgroundSpan = {
            rowId: span.rowId,
            start: startIndex,
            end: endIndex,
            colorClass: layouts.find((l) => l.id === layoutId)!.colorClass,
        };

        // スパンを確定
        setBackgroundSpans((prev) => [
            ...prev.filter(
                (bs) =>
                    !(
                        bs.rowId === newSpan.rowId &&
                        bs.start === newSpan.start &&
                        bs.end === newSpan.end
                    )
            ),
            newSpan,
        ]);

        // アイテムを追加（時刻＋レイアウト名を表示）
        setItems((prev) => [
            ...prev.filter(
                (it) =>
                    !(
                        it.rowId === newSpan.rowId &&
                        it.start === newSpan.start &&
                        it.end === newSpan.end
                    )
            ),
            {
                rowId: newSpan.rowId,
                start: newSpan.start,
                end: newSpan.end,
                content: (
                    <div className="flex flex-col text-xs text-white overflow-hidden">
                        <span>{`${span.startTime}–${span.endTime}`}</span>
                        <span className="truncate">
                            {layouts.find((l) => l.id === layoutId)!.name}
                        </span>
                    </div>
                ),
            },
        ]);

        setActiveSpan(null);
        setIsModalOpen(false);
    };

    // ── モーダル「キャンセル」 ──
    const handleCancel = () => {
        setBackgroundSpans((prev) =>
            prev.filter(
                (bs) =>
                    !(
                        bs.rowId === activeSpan?.rowId &&
                        bs.start === activeSpan.start &&
                        bs.end === activeSpan.end
                    )
            )
        );
        setActiveSpan(null);
        setIsModalOpen(false);
    };

    // ── 保存ボタン ──
    // ① 実際にAPIを呼ぶヘルパー
    const doSave = async (override = false) => {
        const payload: CreateSpecialDayParams = {
            date,
            type,
            reason,
            schedules:
                type === 'BUSINESS'
                    ? backgroundSpans.map(bs => ({
                        layoutId: layouts.find(l => l.colorClass === bs.colorClass)!.id,
                        startTime: `${String(Math.floor((bs.start * 30) / 60)).padStart(2, '0')}:${(bs.start * 30) % 60 ? '30' : '00'
                            }`,
                        endTime: `${String(Math.floor((bs.end * 30) / 60)).padStart(2, '0')}:${(bs.end * 30) % 60 ? '30' : '00'
                            }`,
                    }))
                    : [],
            override,  // ← ここに override フラグをつける
        };

        try {
            await createSpecialDay(storeId, payload);
            // 成功時の挙動（一覧へ遷移）
            router.push(`/admin/store/${storeId}/schedule/special-day`);
        } catch (err: any) {
            // 409 が返ってきたら「上書きしてよいか」ダイアログを出す
            if (err.response?.status === 409 && !override) {
                const ok = window.confirm(
                    'この日付はすでに特別日として登録されています。\n上書きしてもよろしいですか？'
                );
                if (ok) {
                    return doSave(true);
                }
            } else {
                // それ以外のエラー
                alert('保存に失敗しました');
            }
        }
    };

    // ② ボタンに紐づけ
    const handleSave = () => {
        doSave();
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
                特別日のスケジュール作成：
                {format(new Date(date), 'yyyy/MM/dd (EEE)')}
            </h2>

            {/* ── 営業／休業タイプ切替 ── */}
            <div className="mb-4 flex space-x-6">
                <label className="inline-flex items-center space-x-1">
                    <input
                        type="radio"
                        value="BUSINESS"
                        checked={type === 'BUSINESS'}
                        onChange={() => setType('BUSINESS')}
                        className="form-radio"
                    />
                    <span>特別営業日</span>
                </label>
                <label className="inline-flex items-center space-x-1">
                    <input
                        type="radio"
                        value="CLOSED"
                        checked={type === 'CLOSED'}
                        onChange={() => setType('CLOSED')}
                        className="form-radio"
                    />
                    <span>臨時休業日</span>
                </label>
            </div>

            <div className="mb-4 flex space-x-6">
                <label className="block mb-1">
                    <span className="text-sm font-medium">理由</span>

                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="例：年末年始の特別営業のため"
                    />
                </label>
            </div>

            {/* ── 色凡例（営業日モードのみ） ── */}
            {type === 'BUSINESS' && (
                <div className="flex space-x-4 mb-4">
                    {layouts.map((l) => (
                        <div key={l.id} className="flex items-center space-x-1">
                            <span className={`w-4 h-4 rounded-full ${l.colorClass}`} />
                            <span className="text-sm">{l.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── グリッド or 休業表示 ── */}
            {type === 'BUSINESS' ? (
                <TimelineGrid
                    rows={[{ id: 'row-1', label: '営業時間帯' }]}
                    subdivisions={48}
                    rowHeight={32}
                    backgroundSpans={backgroundSpans}
                    items={items}
                    mode="edit"
                    onSpanChange={handleSpanChange}
                />
            ) : (
                <div className="p-8 text-center text-gray-500 border border-gray-200 rounded">
                    この日は <span className="font-semibold">臨時休業日</span> です
                </div>
            )}

            {/* ── 選択範囲確定用モーダル ── */}
            {type === 'BUSINESS' && (
                <ScheduleModal
                    isOpen={isModalOpen}
                    span={activeSpan}
                    layouts={layouts.map((l) => ({ id: l.id, name: l.name }))}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

            {/* ── 保存ボタン ── */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    保存
                </button>
            </div>
        </div>
    );
}
