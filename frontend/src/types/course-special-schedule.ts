import { CourseStatus } from '@/types/course';

/**
 * 特別コーススケジュールの種別 (Prisma の SpecialScheduleType と一致)
 */
export type SpecialCourseScheduleType = 'OPEN' | 'CLOSED';

/**
 * 特別コーススケジュール詳細（時間帯）
 */
export interface SpecialCourseScheduleItem {
  /** 開始時刻 (HH:mm:ss) */
  startTime: string;
  /** 終了時刻 (HH:mm:ss) */
  endTime: string;
  /** 説明 (任意) */
  description?: string;
}

/**
 * 特別コーススケジュールグループ作成／更新用パラメータ
 */
export interface CreateSpecialCourseScheduleGroupParams {
  /** 対象日付 (YYYY-MM-DD) */
  date: string;
  /** 種別 ('OPEN'=特別営業, 'CLOSED'=特別休業) */
  type: SpecialCourseScheduleType;
  /** 理由 (任意) */
  reason?: string;
  /** 営業時間帯リスト (type='OPEN' 時のみ必須) */
  schedules?: SpecialCourseScheduleItem[];
}

/**
 * 特別コーススケジュールグループレスポンス
 */
export interface SpecialCourseScheduleGroupDto {
  /** グループID */
  id: number;
  /** 対象日付 (YYYY-MM-DD) */
  date: string;
  /** 種別 */
  type: SpecialCourseScheduleType;
  /** 理由 */
  reason?: string;
  /** ステータス */
  status: CourseStatus;
  /** 登録時間帯 */
  schedules?: SpecialCourseScheduleItem[];
}
