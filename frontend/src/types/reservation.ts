/**
 * /v1/availability/month で返ってくる
 */
export interface DaySummary {
    /** YYYY-MM-DD */
    date: string;
    /** 'closed': 非営業日, 'full': 営業日だけど満席, 'available': 営業＆空きあり */
    status: 'closed' | 'full' | 'available';
}

/**
 * /v1/availability/day で返ってくる
 */
export interface SeatFirstSpan {
    seatId: number;
    spans: Array<{
        /** "HH:mm" */
        start: string;
        /** "HH:mm" */
        end: string;
    }>;
}

/**
 * 日別可用性取得 API のレスポンス全体
 */
export interface AvailabilityDayResponse {
    settings: {
        /** 予約刻み（分） */
        gridUnit: number;
        /** 標準予約時間（分） */
        standardReservationMinutes: number;
        /** バッファスロット数 */
        bufferSlots: number;
    };
    /** 営業時間帯スパンの配列 */
    businessHours: Array<{
        /** "HH:mm" */
        start: string;
        /** "HH:mm" */
        end: string;
    }>;
    /** 各座席のフィルタ前スパン一覧 */
    data: SeatFirstSpan[];
}
