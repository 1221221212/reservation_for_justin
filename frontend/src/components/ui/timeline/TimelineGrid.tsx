// frontend/src/components/ui/timeline/TimelineGrid.tsx
'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

export interface TimelineItem {
    rowId: string;
    start: number;      // inclusive
    end: number;        // exclusive
    content: React.ReactNode;
    colorClass?: string; // ← 追加: アイテム固有の色クラス
}

export interface BackgroundSpan {
    rowId: string;
    start: number;
    end: number;
    colorClass: string;
}

export interface TimelineGridProps {
    rows: Array<{ id: string; label: string }>;
    subdivisions?: number;
    rowHeight: number;
    backgroundSpans?: BackgroundSpan[];
    items?: TimelineItem[];
    mode?: 'view' | 'edit';
    onSpanChange?: (spans: BackgroundSpan[]) => void;
    onItemClick?: (item: TimelineItem) => void;
}

export default function TimelineGrid({
    rows,
    subdivisions = 48,
    rowHeight,
    backgroundSpans = [],
    items = [],
    mode = 'view',
    onSpanChange,
    onItemClick,
}: TimelineGridProps) {
    const [isSelecting, setIsSelecting] = useState(false);
    const [startCol, setStartCol] = useState<number | null>(null);
    const [endCol, setEndCol] = useState<number | null>(null);
    const [activeRow, setActiveRow] = useState<string | null>(null);

    const cellWidth = 100 / subdivisions;

    useEffect(() => {
        const onMouseUp = () => {
            if (isSelecting && startCol !== null && endCol !== null && activeRow) {
                const start = Math.min(startCol, endCol);
                const end = Math.max(startCol, endCol) + 1;
                const newSpan: BackgroundSpan = { rowId: activeRow, start, end, colorClass: '' };
                onSpanChange?.([...backgroundSpans, newSpan]);
            }
            setIsSelecting(false);
            setStartCol(null);
            setEndCol(null);
            setActiveRow(null);
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isSelecting, startCol, endCol, activeRow, backgroundSpans, onSpanChange]);

    return (
        <div className="overflow-auto">
            {/* ヘッダー */}
            <div className="flex sticky top-0 bg-white z-10">
                {Array.from({ length: subdivisions }).map((_, i) => (
                    <div
                        key={i}
                        className={clsx(
                            'flex-shrink-0 text-xs border-l',
                            i % 2 === 0 ? 'border-gray-400' : 'border-gray-200'
                        )}
                        style={{ width: `${cellWidth}%`, textAlign: 'left', paddingLeft: '2px' }}
                    >
                        {i % 2 === 0 ? `${i / 2}:00` : ''}
                    </div>
                ))}
            </div>

            {/* 各行 */}
            {rows.map(row => (
                <div key={row.id} className="mb-2">
                    <div className="mb-1 text-sm">{row.label}</div>
                    <div className="relative flex" style={{ height: rowHeight }}>
                        {/* ベースセル */}
                        <div className="flex flex-1">
                            {Array.from({ length: subdivisions }).map((_, col) => (
                                <div
                                    key={col}
                                    className={clsx(
                                        'relative',
                                        col % 2 === 0
                                            ? 'border-t border-l border-gray-300'
                                            : 'border-t border-l border-gray-200'
                                    )}
                                    style={{ width: `${cellWidth}%` }}
                                    onMouseDown={() => {
                                        if (mode === 'edit') {
                                            setIsSelecting(true);
                                            setStartCol(col);
                                            setEndCol(col);
                                            setActiveRow(row.id);
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        if (isSelecting && activeRow === row.id) {
                                            setEndCol(col);
                                        }
                                    }}
                                >
                                    {/* ドラッグ選択ハイライト */}
                                    {isSelecting &&
                                        activeRow === row.id &&
                                        startCol !== null &&
                                        endCol !== null &&
                                        (() => {
                                            const s = Math.min(startCol, endCol);
                                            const e = Math.max(startCol, endCol);
                                            return col >= s && col <= e ? (
                                                <div className="absolute inset-0 bg-blue-200 opacity-50" />
                                            ) : null;
                                        })()}
                                </div>
                            ))}
                        </div>

                        {/* BackgroundSpan（任意） */}
                        {backgroundSpans
                            .filter(span => span.rowId === row.id)
                            .map((span, idx) => (
                                <div
                                    key={idx}
                                    className={clsx('absolute top-0 bottom-0', span.colorClass)}
                                    style={{
                                        left: `${span.start * cellWidth}%`,
                                        width: `${(span.end - span.start) * cellWidth}%`,
                                    }}
                                />
                            ))}

                        {/* Items */}
                        {items
                            .filter(it => it.rowId === row.id)
                            .map((it, idx) => (
                                <div
                                    key={idx}
                                    className={clsx(
                                        'absolute top-0 bottom-0 px-1 overflow-hidden cursor-pointer',
                                        it.colorClass
                                    )}
                                    style={{
                                        left: `${it.start * cellWidth}%`,
                                        width: `${(it.end - it.start) * cellWidth}%`,
                                    }}
                                    onClick={() => onItemClick?.(it)}
                                >
                                    {it.content}
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
