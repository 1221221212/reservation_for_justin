// src/types/schedule.ts

/**
 * ベースのスケジュールアイテム
 */
export interface BaseScheduleItem {
    /** 適用するレイアウトの ID */
    layoutId: number;
    /** 曜日（0=日〜6=土、7=祝日） */
    dayOfWeek: number;
    /** 開始時刻（"HH:mm:ss"形式） */
    startTime: string;
    /** 終了時刻（"HH:mm:ss"形式、未指定可） */
    endTime?: string;
}

/**
 * 既存レコード用スケジュールアイテムの型
 */
export interface ScheduleDto extends BaseScheduleItem {
    /** Schedule の一意ID */
    id: number;
    /** 状態（LayoutStatus） */
    status?: string;
}

/**
 * 新規作成用のスケジュールアイテム
 */
export interface CreateScheduleItem extends BaseScheduleItem { }

/**
 * 新規スケジュールグループ作成用 DTO
 */
export interface CreateScheduleGroupDto {
    /** グループ名 */
    name: string;
    /** 適用開始日 ("YYYY-MM-DD") */
    effectiveFrom: string;
    /** 祝日適用フラグ */
    applyOnHoliday: boolean;
    /** 各スケジュールアイテム */
    schedules: CreateScheduleItem[];
}

/**
 * API から受け取るスケジュールグループ（詳細・一覧用 DTO）
 */
export interface ScheduleGroupDto {
    /** グループ ID */
    id: number;
    /** グループ名 */
    name: string;
    /** 適用開始日 ("YYYY-MM-DD") */
    effectiveFrom: string;
    /** 祝日適用フラグ */
    applyOnHoliday: boolean;
    /** 各スケジュールアイテム */
    schedules: ScheduleDto[];
}

/**
 * レジェンド表示用アイテム
 */
export type LegendItem = {
    /** 識別子 (layoutId など) */
    id: number;
    /** 表示名 */
    name: string;
    /** Tailwind などで使用する色クラス */
    colorClass: string;
};

/**
 * ScheduleLegend コンポーネントの Props
 */
export interface ScheduleLegendProps {
    items: LegendItem[];
}

/**
 * ScheduleGrid コンポーネントの Props
 */
export interface ScheduleGridProps {
    /** 表示するスケジュールリスト */
    schedules: BaseScheduleItem[];
    /** レイアウト情報（レジェンド・色指定用） */
    layouts: LegendItem[];
    /** 祝日カラムを表示するか */
    applyOnHoliday: boolean;
    /** 表示モード: 編集(edit) or 閲覧(view) */
    mode: 'edit' | 'view';
    /** 1行あたりの高さ(px)（省略時はデフォルト値を使用） */
    rowHeight?: number;
    /** セルを押下したときのコールバック (edit モード) */
    onCellMouseDown?: (row: number, col: number) => void;
    /** セルにマウスが入ったときのコールバック (edit モード) */
    onCellMouseEnter?: (row: number, col: number) => void;
    /** セルが選択済みかどうかを判定するコールバック (edit モード) */
    isCellSelected?: (row: number, col: number) => boolean;
    /** アイテム削除時のコールバック (edit モード) */
    onItemRemove?: (index: number) => void;
}

export interface LayoutSpan {
    start: string;
    end: string;
    layoutId: number;
}

export interface SeatSpan {
    seatId: number;
    start: string;
    end: string;
}

/**
 * カレンダー＋タイムライン用の月間詳細アイテム
 */
export interface MonthDetail {
    date: string;
    isHoliday: boolean;
    status: 'open' | 'closed';
    appliedRuleType: 'specialDay' | 'closedDay' | 'weeklySchedule' | null;
    appliedRuleId: number | null;
    layoutSpans: LayoutSpan[];
    seatSpans: SeatSpan[];
}