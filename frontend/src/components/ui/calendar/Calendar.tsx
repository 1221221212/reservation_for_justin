/* Calendar.tsx */
import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import type { CalendarProps } from './types';

const Calendar: React.FC<CalendarProps> = ({
    year,
    month,
    selectedDate,
    onMonthChange,
    onDateSelect,
    cellDataMap,
}) => (
    <div>
        <CalendarHeader year={year} month={month} onMonthChange={onMonthChange} />
        <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            cellDataMap={cellDataMap}
        />
    </div>
);

export default Calendar;