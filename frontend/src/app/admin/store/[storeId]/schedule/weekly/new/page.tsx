'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchLayouts } from '@/lib/layout-api';
import { createScheduleGroup } from '@/lib/schedule-api';
import { CreateScheduleItem, CreateScheduleGroupDto } from '@/types/schedule';
import ScheduleLegend from '@/components/ui/schedule/ScheduleLegend';
import ScheduleGrid from '@/components/ui/schedule/ScheduleGrid';
import { timeToRow, timeOptions, rowToTime } from '@/lib/schedule-utils';
import type { LayoutWithSeats } from '@/types/layout';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// 色クラスサンプル
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

export default function SchedulePage() {
    const { storeId } = useParams();
    const id = storeId ? Number(storeId) : null;
    const router = useRouter();

    const gridRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(0);

    const [groupName, setGroupName] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [useHoliday, setUseHoliday] = useState(false);

    const [layouts, setLayouts] = useState<(LayoutWithSeats & { colorClass: string })[]>([]);
    const [scheduleItems, setScheduleItems] = useState<CreateScheduleItem[]>([]);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState<{ row: number; col: number } | null>(null);
    const [endPos, setEndPos] = useState<{ row: number; col: number } | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');
    const [newStartTime, setNewStartTime] = useState('00:00');
    const [newEndTime, setNewEndTime] = useState('00:05');

    // レイアウト取得＋色割当
    useEffect(() => {
        if (!id) return;
        fetchLayouts(id).then(res => {
            const mapped = res.data.map((l: LayoutWithSeats, i: number) => ({
                ...l,
                colorClass: colorClasses[i % colorClasses.length],
            }));
            setLayouts(mapped);
        });
    }, [id]);

    // 行高さ取得＆リサイズ対応
    useEffect(() => {
        const updateRowHeight = () => {
            if (!gridRef.current) return;
            const firstCell = gridRef.current.querySelector('.time-cell');
            if (firstCell) {
                setRowHeight((firstCell as HTMLElement).offsetHeight);
            }
        };
        updateRowHeight();
        window.addEventListener('resize', updateRowHeight);
        return () => window.removeEventListener('resize', updateRowHeight);
    }, [useHoliday]);

    // マウスアップで選択完了
    useEffect(() => {
        const onMouseUp = () => {
            if (isSelecting && startPos && endPos) {
                setNewStartTime(rowToTime(startPos.row));
                setNewEndTime(rowToTime(endPos.row + 1));
                setShowModal(true);
            }
            setIsSelecting(false);
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isSelecting, startPos, endPos]);

    const handleMouseDown = (row: number, col: number) => {
        setStartPos({ row, col });
        setEndPos({ row, col });
        setIsSelecting(true);
    };
    const handleMouseEnter = (row: number, col: number) => {
        if (isSelecting && startPos && col === startPos.col) {
            setEndPos({ row, col });
        }
    };
    const isCellSelected = (row: number, col: number) => {
        if (!startPos || !endPos || col !== startPos.col) return false;
        const [s, e] =
            startPos.row <= endPos.row
                ? [startPos.row, endPos.row]
                : [endPos.row, startPos.row];
        return row >= s && row <= e;
    };

    const confirmSelection = () => {
        if (startPos && endPos && selectedLayoutId !== '') {
            setScheduleItems(prev => [
                ...prev,
                {
                    layoutId: Number(selectedLayoutId),
                    dayOfWeek: startPos.col,
                    startTime: newStartTime,
                    endTime: newEndTime,
                },
            ]);
        }
        setShowModal(false);
        setStartPos(null);
        setEndPos(null);
        setSelectedLayoutId('');
    };

    const cancelSelection = () => {
        // モーダルを閉じつつ…
        setShowModal(false);
        // 選択開始／終了位置をクリア
        setStartPos(null);
        setEndPos(null);
        // 選択中フラグもリセット（念のため）
        setIsSelecting(false);
        // 選択レイアウトもリセット
        setSelectedLayoutId('');
    };

    const removeItem = (idx: number) => {
        setScheduleItems(prev => prev.filter((_, i) => i !== idx));
    };

    const onSave = async () => {
        if (!id) return;
        const payload: CreateScheduleGroupDto = {
            name: groupName,
            effectiveFrom,
            applyOnHoliday: useHoliday,
            schedules: scheduleItems.map(it => ({
                layoutId: it.layoutId,
                dayOfWeek: it.dayOfWeek,
                startTime: `${it.startTime}:00`,
                endTime: it.endTime ? `${it.endTime}:00` : undefined,
            })),
        };
        try {
            await createScheduleGroup(id, payload);
            router.push(`/admin/store/${storeId}/schedule`);
        } catch {
            alert('保存に失敗しました');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">スケジュール設定</h1>

            {/* カラーレジェンド */}
            <ScheduleLegend
                items={layouts.map(l => ({
                    id: l.id,
                    name: l.name,
                    colorClass: l.colorClass,
                }))}
            />

            {/* グループ情報 */}
            <div className="mb-4 p-4 border rounded bg-white">
                <label className="block mb-2">
                    <span className="text-sm font-medium">グループ名</span>
                    <input
                        type="text"
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">適用開始日</span>
                    <input
                        type="date"
                        value={effectiveFrom}
                        onChange={e => setEffectiveFrom(e.target.value)}
                        className="mt-1 p-2 border rounded"
                    />
                </label>
                <label className="inline-flex items-center mt-2">
                    <input
                        type="checkbox"
                        checked={useHoliday}
                        onChange={e => setUseHoliday(e.target.checked)}
                        className="mr-2"
                    />
                    <span>祝日スケジュールを適用する</span>
                </label>
            </div>

            {/* スケジュールグリッド */}
            <div ref={gridRef}>
                <ScheduleGrid
                    schedules={scheduleItems}
                    layouts={layouts.map(l => ({
                        id: l.id,
                        name: l.name,
                        colorClass: l.colorClass,
                    }))}
                    applyOnHoliday={useHoliday}
                    mode="edit"
                    rowHeight={rowHeight}
                    onCellMouseDown={handleMouseDown}
                    onCellMouseEnter={handleMouseEnter}
                    isCellSelected={isCellSelected}
                    onItemRemove={removeItem}
                />
            </div>

            {/* 追加モーダル */}
            {showModal && startPos && endPos && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-80">
                        <h2 className="text-lg font-semibold mb-2">
                            スケジュールを追加（{['日', '月', '火', '水', '木', '金', '土', '祝'][startPos.col]}曜日）
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">レイアウト</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedLayoutId}
                                onChange={e => setSelectedLayoutId(e.target.value)}
                            >
                                <option value="">-- 選択 --</option>
                                {layouts.map(l => (
                                    <option key={l.id} value={l.id.toString()}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-2 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm mb-1">開始</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newStartTime}
                                    onChange={e => setNewStartTime(e.target.value)}
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm mb-1">終了</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newEndTime}
                                    onChange={e => setNewEndTime(e.target.value)}
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-3 py-1 bg-gray-300 rounded"
                                onClick={cancelSelection}
                            >
                                キャンセル
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                                onClick={confirmSelection}
                                disabled={!selectedLayoutId}
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 保存ボタン */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={!groupName || scheduleItems.length === 0}
                    className={`px-4 py-2 rounded text-white ${groupName && scheduleItems.length > 0
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    保存
                </button>
            </div>

            <ReactTooltip />
        </div>
    );
}
