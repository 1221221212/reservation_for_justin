// backend/src/modules/availability/types.ts

/**
 * 日毎カレンダー用のステータス
 * - 'closed': 非営業日
 * - 'full':   営業日だが空きなし
 * - 'available': 営業日かつ空きあり
 */
export type DayStatus = 'closed' | 'full' | 'available';

/**
 * 月間サマリとして返却する日付とステータスの組
 */
export interface DaySummary {
  date: string;       // YYYY-MM-DD
  status: DayStatus;
}

/**
 * 席ファーストの詳細可用性スパン
 */
export interface SeatFirstSpan {
  seatId: number;
  spans: Array<{ start: string; end: string }>;
}
