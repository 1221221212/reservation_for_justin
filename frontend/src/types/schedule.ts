// frontend/src/types/schedule.ts

/**
 * 週スケジュールのアイテム
 */
export interface ScheduleItem {
    /** レイアウトID */
    layoutId: number;
    /** 曜日番号 0(日)〜6(土)、7=祝日 */
    dayOfWeek: number;
    /** 開始時刻 (HH:mm) */
    startTime: string;
    /** 終了時刻 (HH:mm) */
    endTime: string;
}

/**
 * 特別日スケジュールのアイテム
 */
export interface SpecialDateItem {
    /** 日付 (YYYY-MM-DD) */
    date: string;
    /** レイアウトID */
    layoutId: number;
    /** 種別: closure=休業, opening=臨時営業 */
    eventType: 'closure' | 'opening';
    /** 開始時刻 (HH:mm) */
    startTime: string;
    /** 終了時刻 (HH:mm) */
    endTime: string;
    /** 任意の説明文 */
    description?: string;
}
