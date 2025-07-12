/* CalendarHeader.tsx */
import React from 'react';
import type { CalendarProps } from './types';

interface HeaderProps {
    year: number;
    month: number;
    onMonthChange: (year: number, month: number) => void;
}

export const CalendarHeader: React.FC<HeaderProps> = ({ year, month, onMonthChange }) => {
    const prev = () => onMonthChange(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
    const next = () => onMonthChange(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);

    return (
        <div className="flex items-center justify-between mb-2">
            <button onClick={prev}>‹</button>
            <span>{year}年 {month + 1}月</span>
            <button onClick={next}>›</button>
        </div>
    );
};
