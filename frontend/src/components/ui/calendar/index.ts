/* index.ts */
export { default as Calendar } from './Calendar';
export * from './types';

/* types.ts */
import { ReactNode } from 'react';

export interface CalendarCellInfo {
    badgeContent?: ReactNode;
    colorClassName?: string;
    disabled?: boolean;
}

export interface CalendarProps {
    year: number;
    month: number;
    selectedDate?: Date;
    onMonthChange: (year: number, month: number) => void;
    onDateSelect: (date: Date) => void;
    cellDataMap?: Record<string, CalendarCellInfo>;
}