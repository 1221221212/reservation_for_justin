/**
 * 定期休業ルールタイプ
 */
export enum ClosedDayType {
    WEEKLY = 'WEEKLY',           // 毎週 X 曜日
    MONTHLY_DATE = 'MONTHLY_DATE', // 毎月 X 日
    MONTHLY_NTH_WEEK = 'MONTHLY_NTH_WEEK', // 毎月第 N 週の X 曜日
}

/**
 * 単一の定期休業ルール
 */
export interface ClosedDayRule {
    /** ルールID (編集時のみ) */
    id?: number;
    /** ルール種別 */
    type: ClosedDayType;
    /** dayOfWeek: WEEKLY または MONTHLY_NTH_WEEK 用 (0=日,1=月,...,6=土,7=祝日) */
    dayOfWeek?: number;
    /** dayOfMonth: MONTHLY_DATE 用 (1〜31, 99=末日) */
    dayOfMonth?: number;
    /** weekOfMonth: MONTHLY_NTH_WEEK 用 (1〜5) */
    weekOfMonth?: number;
}

/**
 * 新規作成用 DTO
 */
export interface CreateClosedDayGroupDto {
    /** 適用開始日 (YYYY-MM-DD) */
    effectiveFrom: string;
    /** 定期休業ルール一覧 */
    rules: ClosedDayRule[];
}

/**
 * API から受け取る定期休業グループ
 */
export interface ClosedDayGroupDto {
    /** グループID */
    id: number;
    /** 適用開始日 (YYYY-MM-DD) */
    effectiveFrom: string;
    /** ルール一覧 */
    rules: ClosedDayRule[];
}
