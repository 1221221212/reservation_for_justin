// backend/src/common/utils/date-utils.ts

/**
 * normalizeDate
 * @param date - Date object or YYYY-MM-DD string
 * @returns Date object at local time with hours/minutes/seconds set to 0
 */
export function normalizeDate(date: string | Date): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * isCacheableDate
 * @param targetDate - Date object or YYYY-MM-DD string
 * @param maxEndDays - number of days from today to cache (inclusive)
 * @returns true if targetDate is between today (inclusive) and today+maxEndDays (inclusive)
 */
export function isCacheableDate(
    targetDate: string | Date,
    maxEndDays: number,
): boolean {
    const today = normalizeDate(new Date());
    const date = normalizeDate(targetDate);
    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= maxEndDays;
}
