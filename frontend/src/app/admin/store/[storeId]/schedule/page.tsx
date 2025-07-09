'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { fetchLayouts } from '@/lib/layout-api';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FiX } from 'react-icons/fi';
import type { LayoutWithSeats } from '@/types/layout';
import type { ScheduleItem } from '@/types/schedule';

// "HH:mm" → grid row index（0.5単位）
const timeToRow = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 2 + m / 30;
};

// row index → "HH:mm"
const rowToTime = (r: number) => {
    const h = Math.floor(r / 2);
    const m = r % 2 === 1 ? 30 : 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// 5分刻みの選択肢
const timeOptions = Array.from({ length: 24 * 12 }).map((_, idx) => {
    const h = Math.floor(idx / 12);
    const m = (idx % 12) * 5;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

// 色クラスサンプル
const colorClasses = [
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-pink-400',
    'bg-purple-400',
    'bg-indigo-400',
];

export default function SchedulePage() {
    const { storeId } = useParams();
    const id = storeId ? Number(storeId) : null;

    const gridRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(0);

    const [groupName, setGroupName] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [useHoliday, setUseHoliday] = useState(false);

    const [layouts, setLayouts] = useState<(LayoutWithSeats & { colorClass: string })[]>([]);
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState<{ row: number; col: number } | null>(null);
    const [endPos, setEndPos] = useState<{ row: number; col: number } | null>(null);

    const [showModal, setShowModal] = useState(false);
    // ← ここを number | '' から string に変更
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');
    const [newStartTime, setNewStartTime] = useState('00:00');
    const [newEndTime, setNewEndTime] = useState('00:00');

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const columns = useHoliday ? [...weekdays, '祝'] : weekdays;

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
    const updateRowHeight = () => {
        if (!gridRef.current) return;
        const firstCell = gridRef.current.querySelector('.time-cell');
        if (firstCell) {
            setRowHeight((firstCell as HTMLElement).offsetHeight);
        }
    };
    useEffect(() => {
        updateRowHeight();
        window.addEventListener('resize', updateRowHeight);
        return () => window.removeEventListener('resize', updateRowHeight);
    }, [columns]);

    // マウスアップで選択完了
    useEffect(() => {
        const onMouseUp = () => {
            if (isSelecting && startPos && endPos) {
                setNewStartTime(rowToTime(startPos.row));
                setNewEndTime(rowToTime(endPos.row));
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
                    layoutId: Number(selectedLayoutId),  // ここで文字列を数値に変換
                    dayOfWeek: startPos.col,
                    startTime: newStartTime,
                    endTime: newEndTime,
                },
            ]);
        }
        resetSelection();
    };
    const cancelSelection = () => resetSelection();
    const resetSelection = () => {
        setShowModal(false);
        setStartPos(null);
        setEndPos(null);
        setSelectedLayoutId('');
    };
    const removeItem = (idx: number) => {
        setScheduleItems(prev => prev.filter((_, i) => i !== idx));
    };
    const onSave = async () => {
        if (!id) return;
        const payload = {
            group: {
                name: groupName,
                effectiveFrom,
                applyOnHoliday: useHoliday,
                scheduleItems,
            },
            specialDates: [],
        };
        try {
            await api.post(`/v1/store/${id}/schedules`, payload);
            alert('スケジュールを保存しました');
            setGroupName('');
            setEffectiveFrom(new Date().toISOString().split('T')[0]);
            setUseHoliday(false);
            setScheduleItems([]);
        } catch {
            alert('保存に失敗しました');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">スケジュール設定</h1>

            {/* カラーレジェンド */}
            <div className="flex space-x-4 mb-4">
                {layouts.map(l => (
                    <div key={l.id} className="flex items-center space-x-1">
                        <span className={`w-4 h-4 rounded-full ${l.colorClass}`} />
                        <span className="text-sm">{l.name}</span>
                    </div>
                ))}
            </div>

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
            </div>

            {/* 祝日適用 */}
            <label className="inline-flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={useHoliday}
                    onChange={e => setUseHoliday(e.target.checked)}
                    className="mr-2"
                />
                <span>祝日スケジュールを適用する</span>
            </label>

            {/* スケジュールグリッド */}
            <div className="relative overflow-auto schedule-container">
                <div
                    ref={gridRef}
                    className="relative border grid auto-rows-[1.5rem]"
                    style={{ gridTemplateColumns: `80px repeat(${columns.length}, minmax(0,1fr))` }}
                >
                    {/* ヘッダー */}
                    <div className="p-2 border-r bg-gray-100" />
                    {columns.map((d, i) => (
                        <div key={i} className="border-r bg-gray-100 flex items-center justify-center p-2">
                            {d}
                        </div>
                    ))}

                    {/* ボディ：時間ラベル＋セル */}
                    {Array.from({ length: 48 }).map((_, r) => (
                        <Fragment key={r}>
                            <div
                                className={`${r % 2 ? 'border-gray-200' : 'border-gray-300 border-t'} time-cell p-1 border-r text-sm`}
                            >
                                {r % 2 === 0 && `${String(Math.floor(r / 2)).padStart(2, '0')}:00`}
                            </div>
                            {columns.map((_, c) => (
                                <div
                                    key={`cell-${r}-${c}`}
                                    className={`relative h-full border-t border-r ${r % 2 ? 'border-gray-200' : 'border-gray-300'}`}
                                    onMouseDown={() => handleMouseDown(r, c)}
                                    onMouseEnter={() => handleMouseEnter(r, c)}
                                >
                                    {isCellSelected(r, c) && (
                                        <div className="absolute inset-0 bg-blue-200 opacity-50 pointer-events-none" />
                                    )}
                                </div>
                            ))}
                        </Fragment>
                    ))}

                    {/* スケジュールアイテム */}
                    {scheduleItems.map((it, idx) => {
                        const layout = layouts.find(l => l.id === it.layoutId);
                        if (!layout || rowHeight === 0) return null;
                        const startPx = Math.round(timeToRow(it.startTime) * rowHeight);
                        const endPx = Math.round(timeToRow(it.endTime) * rowHeight);
                        return (
                            <div
                                key={idx}
                                className={`absolute ${layout.colorClass} opacity-75 rounded text-xs text-white px-1`}
                                style={{
                                    top: startPx + rowHeight,
                                    height: endPx - startPx,
                                    left:  `calc(80px + ${it.dayOfWeek} * ((100% - 80px) / ${columns.length}))`,
                                    width: `calc((100% - 80px) / ${columns.length})`,
                                }}
                                data-tooltip-id={`item-${idx}`}
                                data-tooltip-html={
                                    `<div>レイアウト：${layout.name}</div>` +
                                    `<div>開始：${it.startTime}</div>` +
                                    `<div>終了：${it.endTime}</div>`
                                }
                            >
                                <div className="flex justify-between items-center">
                                    <div className="truncate">{`${it.startTime}–${it.endTime}`}</div>
                                    <FiX
                                        className="w-3 h-3 cursor-pointer"
                                        onClick={() => removeItem(idx)}
                                    />
                                </div>
                                <div className="truncate">{layout.name}</div>
                            </div>
                        );
                    })}

                    {/* ツールチップ */}
                    <ReactTooltip />
                </div>
            </div>

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

            {/* 追加モーダル */}
            {showModal && startPos && endPos && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-80">
                        <h2 className="text-lg font-semibold mb-2">
                            スケジュールを追加（{columns[startPos.col]}曜日）
                        </h2>
                        <label className="block mb-2">
                            <span className="block text-sm mb-1">レイアウト</span>
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
                        </label>
                        <div className="flex space-x-2 mb-4">
                            <div className="flex-1">
                                <span className="text-sm">開始</span>
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
                                <span className="text-sm">終了</span>
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
                                disabled={selectedLayoutId === ''}
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
