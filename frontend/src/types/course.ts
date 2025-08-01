/** Prisma Client から生成される enum と同じ値で定義 */
export enum CourseStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

/** 定期スケジュールアイテム */
export interface ScheduleItem {
    /** 0(日)〜6(土)、7=祝日 */
    dayOfWeek: number;
    /** 開始時刻 (HH:mm) */
    startTime: string;
    /** 終了時刻 (HH:mm) （省略時は startTime と同値） */
    endTime?: string;
}

/** API レスポンス用 DTO */
export interface CourseResponseDto {
    id: number;
    storeId: number;
    name: string;
    price?: number;
    minPeople?: number;
    maxPeople?: number;
    durationMinutes: number;
    description?: string;
    /** 定期スケジュール有効開始日 (YYYY-MM-DD) */
    effectiveFrom?: string;
    /** 定期スケジュール有効終了日 (YYYY-MM-DD) */
    effectiveTo?: string;
    /** 祝日を定期スケジュールに含めるか */
    applyOnHoliday?: boolean;
    /** 定期スケジュール一覧 */
    scheduleItems?: ScheduleItem[];
    status: CourseStatus;
    createdAt: string;
    updatedAt: string;
}

/** 新規作成リクエスト用 DTO */
export interface CreateCourseDto {
    name: string;
    price?: number;
    minPeople?: number;
    maxPeople?: number;
    durationMinutes: number;
    description?: string;
    /** 定期スケジュール有効開始日 (YYYY-MM-DD) */
    effectiveFrom?: string;
    /** 定期スケジュール有効終了日 (YYYY-MM-DD) */
    effectiveTo?: string;
    /** 祝日を定期スケジュールに含めるか */
    applyOnHoliday?: boolean;
    /** 定期スケジュール一覧（任意） */
    scheduleItems?: ScheduleItem[];
    status?: CourseStatus;
}

/** 更新リクエスト用 DTO（すべてオプショナル） */
export interface UpdateCourseDto extends Partial<CreateCourseDto> { }

/** 利用可能時間帯 */
export interface AvailabilityIntervalDto {
    /** 開始時刻 (HH:mm:ss) */
    startTime: string;
    /** 終了時刻 (HH:mm:ss) */
    endTime: string;
}

/** 日毎の可用性 */
export interface DailyAvailabilityDto {
    /** 日付 (YYYY-MM-DD) */
    date: string;
    /** 当該日まるごと利用不可の場合 false */
    available: boolean;
    /** 利用可能時間帯リスト */
    intervals: AvailabilityIntervalDto[];
}

/** 月次のコース可用性レスポンス DTO */
export interface CourseMonthlyAvailabilityResponseDto {
    /** コースID */
    courseId: number;
    /** 対象年 (YYYY) */
    year: string;
    /** 対象月 (MM) */
    month: string;
    /** 日単位の可用性リスト */
    days: DailyAvailabilityDto[];
}

/** 単一利用可能コース */
export interface AvailableCourseDto {
    /** コースID */
    courseId: number;
    /** コース名 */
    name: string;
    /** 所要時間（分） */
    durationMinutes: number;
    /** 価格 */
    price?: number;
    /** 当該日時から開始可能か */
    startable: boolean;
    /** 当該日時を含む利用可能終了時刻 (HH:mm:ss) */
    endTime: string;
}

/** 指定日時で利用可能なコース一覧レスポンス DTO */
export interface AvailableCoursesResponseDto {
    /** 対象日 (YYYY-MM-DD) */
    date: string;
    /** 対象時刻 (HH:mm) */
    time: string;
    /** 利用可能コース一覧 */
    courses: AvailableCourseDto[];
}
