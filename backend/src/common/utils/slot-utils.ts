// backend/src/common/utils/slot-utils.ts

/**
 * Convert a time string ("HH:mm") to a slot index based on gridUnit.
 * @param time - time string in "HH:mm" format
 * @param gridUnit - slot duration in minutes (e.g., 15, 30, 60)
 * @returns slot index (0-based) for the given time
 */
export function timeToSlot(time: string, gridUnit: number): number {
    const [hourStr, minuteStr] = time.split(':');
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    const totalMinutes = hours * 60 + minutes;
    return Math.floor(totalMinutes / gridUnit);
}

/**
 * Convert a slot index to a time string ("HH:mm") based on gridUnit.
 * @param slot - slot index (0-based)
 * @param gridUnit - slot duration in minutes
 * @returns time string in "HH:mm" for the start of the slot
 */
export function slotToTime(slot: number, gridUnit: number): string {
    const totalMinutes = slot * gridUnit;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
}

/**
 * Calculate the number of slots per day based on gridUnit.
 * @param gridUnit - slot duration in minutes
 * @returns number of slots in 24 hours
 */
export function slotsPerDay(gridUnit: number): number {
    return Math.ceil((24 * 60) / gridUnit);
}
