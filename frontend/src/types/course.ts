// frontend/src/types/course.ts

/** Prisma Client から生成される enum と同じ値で定義 */
export enum CourseStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

/** 定期スケジュールアイテム */
export interface ScheduleItem {
    dayOfWeek: number;   // 0(日)〜6(土)、7=祝日
    startTime: string;   // "HH:mm"
    endTime?: string;    // "HH:mm"
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
    createdAt: string;  // ISO文字列
    updatedAt: string;  // ISO文字列
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
