// src/components/ui/timeline/TimelineGrid.tsx
'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

export interface BackgroundSpan {
    rowId: string;
    start: number; // inclusive cell index (0–48)
    end: number;   // exclusive cell index
    colorClass: string;
}

export interface TimelineItem {
    rowId: string;
    start: number; // inclusive (0–48)
    end: number;   // exclusive
    content: React.ReactNode;
}

export interface TimelineGridProps {
    rows: Array<{ id: string; label: string }>;
    /** 分割数：24時間×2で48セル */
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

    // 完了検出
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
            {/* Header: only hourly labels, left-aligned */}
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

            {/* Rows */}
            {rows.map(row => (
                <div key={row.id} className="mb-2">
                    {/* Row label */}
                    <div className="mb-1 text-sm">{row.label}</div>

                    {/* Grid */}
                    <div className="relative flex" style={{ height: rowHeight }}>
                        {/* base cells */}
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
                                    {/* selection highlight */}
                                    {isSelecting &&
                                        activeRow === row.id &&
                                        startCol !== null &&
                                        endCol !== null && (() => {
                                            const s = Math.min(startCol, endCol);
                                            const e = Math.max(startCol, endCol);
                                            return col >= s && col <= e ? (
                                                <div className="absolute inset-0 bg-blue-200 opacity-50" />
                                            ) : null;
                                        })()}
                                </div>
                            ))}
                        </div>

                        {/* Background spans */}
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
                                    className="absolute top-0 bottom-0 px-1 overflow-hidden cursor-pointer"
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
