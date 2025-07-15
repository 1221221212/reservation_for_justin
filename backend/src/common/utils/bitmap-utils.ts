// backend/src/common/utils/bitmap-utils.ts

/**
 * buildInitialBitmap
 * Initialize a bitmap array for one seat/day, marking operating slots as true.
 * @param openSlotStart - start slot index (inclusive)
 * @param openSlotEnd - end slot index (exclusive)
 * @param totalSlots - total slots in the day
 * @returns boolean[] where true indicates an initially available slot
 */
export function buildInitialBitmap(
    openSlotStart: number,
    openSlotEnd: number,
    totalSlots: number,
): boolean[] {
    const bitmap = Array<boolean>(totalSlots).fill(false);
    for (let i = openSlotStart; i < openSlotEnd && i < totalSlots; i++) {
        bitmap[i] = true;
    }
    return bitmap;
}

/**
 * applyReservation
 * Apply a reservation (and buffer) to a bitmap, marking reserved slots as false.
 * @param bitmap - boolean[] representing availability
 * @param startSlot - reservation start slot index (inclusive)
 * @param endSlot - reservation end slot index (exclusive)
 * @param bufferSlots - number of slots to buffer on both sides
 */
export function applyReservation(
    bitmap: boolean[],
    startSlot: number,
    endSlot: number,
    bufferSlots: number,
): void {
    const from = Math.max(0, startSlot - bufferSlots);
    const to = Math.min(bitmap.length, endSlot + bufferSlots);
    for (let i = from; i < to; i++) {
        bitmap[i] = false;
    }
}

/**
 * bitmapToSpans
 * Convert a bitmap array to a list of continuous available spans.
 * @param bitmap - boolean[] representing availability
 * @returns array of spans with startSlot (inclusive) and endSlot (exclusive)
 */
export function bitmapToSpans(
    bitmap: boolean[],
): Array<{ startSlot: number; endSlot: number }> {
    const spans: Array<{ startSlot: number; endSlot: number }> = [];
    let spanStart: number | null = null;

    for (let i = 0; i <= bitmap.length; i++) {
        if (i < bitmap.length && bitmap[i]) {
            if (spanStart === null) {
                spanStart = i;
            }
        } else {
            if (spanStart !== null) {
                spans.push({ startSlot: spanStart, endSlot: i });
                spanStart = null;
            }
        }
    }

    return spans;
}
