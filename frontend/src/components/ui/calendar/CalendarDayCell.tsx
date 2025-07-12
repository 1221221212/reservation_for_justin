/* CalendarDayCell.tsx */
import React from 'react';
import clsx from 'clsx';
import { formatDateKey } from './CalendarUtils';
import type { CalendarCellInfo } from './types';

interface CellProps {
    date: Date;
    info?: CalendarCellInfo;
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
}

export const CalendarDayCell: React.FC<CellProps> = ({ date, info = {}, selectedDate, onDateSelect }) => {
    const key = formatDateKey(date);
    const isSelected = selectedDate ? formatDateKey(selectedDate) === key : false;

    return (
        <div
            className={clsx(
                'relative p-2 border',
                info.colorClassName,
                isSelected && 'ring-2 ring-blue-500',
                info.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !info.disabled && onDateSelect(date)}
        >
            <div className="absolute top-1 left-1 text-xs">{date.getDate()}</div>
            {info.badgeContent && (
                <div className="absolute bottom-1 right-1 text-sm">{info.badgeContent}</div>
            )}
        </div>
    );
};
