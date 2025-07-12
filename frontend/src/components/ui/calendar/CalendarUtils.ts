/* CalendarUtils.ts */
/**
 * 指定年月のカレンダーマトリクスを返す。前後月の埋めセルを含む
 */
export function getCalendarMatrix(year: number, month: number): Date[][] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));
    const matrix: Date[][] = [];
    let cursor = new Date(start);
    while (cursor <= end) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        matrix.push(week);
    }
    return matrix;
}

/**
 * Date -> YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}