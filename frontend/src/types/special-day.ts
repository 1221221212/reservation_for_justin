// frontend/src/types/special-day.ts

/** 特別日タイプ */
export type SpecialDayType = 'BUSINESS' | 'CLOSED';

/** 特別営業日の時間帯割当 */
export interface SpecialDaySchedule {
    /** スケジュールID */
    id: number;
    /** 適用レイアウトID */
    layoutId: number;
    /** 開始時刻 (HH:mm) */
    startTime: string;
    /** 終了時刻 (HH:mm) */
    endTime: string;
}

/** 特別日の型定義 */
export interface SpecialDay {
    /** 特別日ID */
    id: number;
    /** 対象日付 (YYYY-MM-DD) */
    date: string;
    /** タイプ (BUSINESS=特別営業日, CLOSED=特別休業日) */
    type: SpecialDayType;
    /** 理由（任意） */
    reason?: string;
    /** BUSINESS の場合のみスケジュール配列を保持 */
    schedules?: SpecialDaySchedule[];
}

/** 新規／更新用特別日作成パラメータ */
export interface CreateSpecialDayParams {
    /** 対象日付 (YYYY-MM-DD) */
    date: string;
    /** タイプ */
    type: SpecialDayType;
    /** 理由（任意） */
    reason?: string;
    /** BUSINESS の場合に設定するスケジュール配列 */
    schedules?: {
        layoutId: number;
        startTime: string;
        endTime: string;
    }[];
    /** 既存レコードを上書きするかどうか */
    override?: boolean;
}
