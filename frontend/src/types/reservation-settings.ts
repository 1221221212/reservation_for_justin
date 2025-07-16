// 予約設定の型定義
export type RollingOpen = {
    mode: 'rolling';
    daysBefore: number;
    releaseTime?: string;
};
export type BulkOpen = {
    mode: 'bulk';
    releaseDayOfMonth: number;
    monthsAhead?: number;
    releaseTime?: string;
};
export type RollingClose = {
    mode: 'rolling';
    hoursBeforeStart?: number;
    minutesBeforeStart?: number;
};
export type AbsoluteClose = {
    mode: 'absolute';
    daysBefore: number;
};

export type BookingWindow = {
    open: RollingOpen | BulkOpen;
    close: RollingClose | AbsoluteClose;
};

export type CancellationPolicy = {
    enabled: boolean;
    deadlineBefore?: {
        days?: number;
        hours?: number;
        minutes?: number;
    };
};

export type ModificationPolicy = CancellationPolicy;

export interface ReservationSettings {
    id: number;
    storeId: number;
    gridUnit: number;
    standardReservationMinutes: number;
    bookingWindow: BookingWindow;
    bufferTime: number;
    allowCourseSelection: boolean;
    allowSeatSelection: boolean;
    allowSeatCombination: boolean;
    minCombinationPartySize?: number;
    maxCombinationSeats?: number;
    cancellationPolicy: CancellationPolicy;
    modificationPolicy: ModificationPolicy;
    createdAt: string;
    updatedAt: string;
}
