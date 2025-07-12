/* CalendarGrid.tsx */
import React from 'react';
import { getCalendarMatrix, formatDateKey } from './CalendarUtils';
import { CalendarDayCell } from './CalendarDayCell';
import type { CalendarCellInfo } from './types';
import type { CalendarProps } from './types';

interface GridProps extends Pick<CalendarProps, 'year' | 'month' | 'selectedDate' | 'onDateSelect'> {
    cellDataMap?: Record<string, CalendarCellInfo>;
}

export const CalendarGrid: React.FC<GridProps> = ({ year, month, selectedDate, onDateSelect, cellDataMap }) => {
    const matrix = getCalendarMatrix(year, month);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <>
            <div className="grid grid-cols-7 text-center font-medium">
                {weekdays.map(w => <div key={w}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {matrix.flat().map(date => {
                    const key = formatDateKey(date);
                    return (
                        <CalendarDayCell
                            key={key}
                            date={date}
                            info={cellDataMap?.[key]}
                            selectedDate={selectedDate}
                            onDateSelect={onDateSelect}
                        />
                    );
                })}
            </div>
        </>
    );
};