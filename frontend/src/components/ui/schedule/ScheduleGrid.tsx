// src/components/ui/schedule/ScheduleGrid.tsx

import React, { Fragment } from 'react';
import { ScheduleGridProps } from '@/types/schedule';
import { timeToRow } from '@/lib/schedule-utils';
import { FiX } from 'react-icons/fi';

/**
 * 時間軸・曜日ヘッダー＋スケジュールセル／アイテム表示を行うグリッドコンポーネント
 */
export default function ScheduleGrid({
    schedules,
    layouts,
    applyOnHoliday,
    mode,
    rowHeight = 24,
    onCellMouseDown,
    onCellMouseEnter,
    isCellSelected,
    onItemRemove,
}: ScheduleGridProps) {
    // 曜日ラベル（日〜土）、祝日オプション
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const columns = applyOnHoliday ? [...weekdays, '祝'] : weekdays;
    const actualRowHeight = rowHeight > 0 ? rowHeight : 24;

    return (
        <div className="relative overflow-auto">
            <div
                className="relative border grid auto-rows-[1.5rem]"
                style={{
                    gridTemplateColumns: `80px repeat(${columns.length}, minmax(0,1fr))`,
                    ...(actualRowHeight && { gridAutoRows: `${actualRowHeight}px` }),
                }}
            >
                {/* ヘッダー左上セル */}
                <div
                    className="border-r border-gray-300 bg-gray-100"
                    style={{ height: `${actualRowHeight}px` }}
                />
                {/* 曜日ヘッダー */}
                {columns.map((d, i) => (
                    <div
                        key={i}
                        className="border-r border-gray-300 bg-gray-100 flex items-center justify-center text-sm"
                    >
                        {d}
                    </div>
                ))}

                {/* 時間ラベルとグリッドセル */}
                {Array.from({ length: 48 }).map((_, r) => (
                    <Fragment key={r}>
                        {/* 時間ラベル */}
                        <div
                            className={`border-r border-gray-300 border-t ${r % 2 === 0 ? 'border-t-gray-300' : 'border-t-gray-200'
                                } time-cell flex items-center justify-end pr-1 text-xs`}
                            style={{ height: `${actualRowHeight}px` }}
                        >
                            {r % 2 === 0
                                ? `${String(Math.floor(r / 2)).padStart(2, '0')}:00`
                                : ''}
                        </div>
                        {/* 各曜日セル */}
                        {columns.map((_, c) => (
                            <div
                                key={`cell-${r}-${c}`}
                                className={`relative h-full border-r border-gray-300 border-t ${r % 2 === 0 ? 'border-t-gray-300' : 'border-t-gray-100'
                                    }`}
                                onMouseDown={
                                    mode === 'edit'
                                        ? () => onCellMouseDown?.(r, c)
                                        : undefined
                                }
                                onMouseEnter={
                                    mode === 'edit'
                                        ? () => onCellMouseEnter?.(r, c)
                                        : undefined
                                }
                            >
                                {mode === 'edit' && isCellSelected?.(r, c) && (
                                    <div className="absolute inset-0 bg-blue-200 opacity-50 pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </Fragment>
                ))}

                {/* スケジュールアイテム */}
                {schedules.map((it, idx) => {
                    const layout = layouts.find((l) => l.id === it.layoutId);
                    if (!layout) return null;
                    const start = timeToRow(it.startTime);
                    const end = timeToRow(it.endTime ?? it.startTime);
                    const top = start * actualRowHeight + actualRowHeight;
                    const height = (end - start) * actualRowHeight;
                    const left = `calc(80px + ${it.dayOfWeek} * ((100% - 80px) / ${columns.length}))`;
                    const width = `calc((100% - 80px) / ${columns.length})`;
                    // 秒を除去した時刻表示
                    const startLabel = it.startTime.slice(0, 5);
                    const endLabel = it.endTime ? it.endTime.slice(0, 5) : '';

                    return (
                        <div
                            key={idx}
                            className={`absolute ${layout.colorClass} opacity-75 rounded text-xs text-white px-1 overflow-hidden`}
                            style={{ top: `${top}px`, height: `${height}px`, left, width }}
                            title={`${layout.name} ${startLabel}-${endLabel}`}
                        >
                            {mode === 'edit' && onItemRemove && (
                                <FiX
                                    className="absolute top-0 right-0 m-1 w-4 h-4 cursor-pointer"
                                    onClick={() => onItemRemove(idx)}
                                />
                            )}
                            <div className="truncate">{`${startLabel}–${endLabel}`}</div>
                            <div className="truncate">{layout.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}