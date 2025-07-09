// frontend/src/types/layout.ts

/** レイアウトのステータス */
export type LayoutStatus = 'active' | 'inactive';

/** レイアウトに紐づく座席情報 */
export interface LayoutSeatInfo {
    id: number;
    name: string;
}

/** レイアウト一覧取得時のレスポンス */
export interface LayoutWithSeats {
    id: number;
    name: string;
    status: LayoutStatus;
    seats: LayoutSeatInfo[];
}

/** レイアウト作成時のリクエストパラメータ */
export interface CreateLayoutParams {
    /** レイアウト名 */
    name: string;
    /** 紐付ける座席ID配列（1件以上必須） */
    seatIds: number[];
}
