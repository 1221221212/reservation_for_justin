// backend/src/modules/course/dto/course-monthly-availability.dto.ts

/**
 * 単一時間帯の可用性を表す DTO
 */
export class AvailabilityIntervalDto {
    /** 利用可能開始時刻 (HH:mm:ss) */
    startTime!: string;

    /** 利用可能終了時刻 (HH:mm:ss) */
    endTime!: string;
}

/**
 * 日毎の可用性を表す DTO
 */
export class DailyAvailabilityDto {
    /** 日付 (YYYY-MM-DD) */
    date!: string;

    /** 当該日まるごと休業などで完全に利用不可の場合 false */
    available!: boolean;

    /** 利用可能時間帯一覧（available が false の場合は空配列） */
    intervals!: AvailabilityIntervalDto[];
}

/**
 * 月次のコース可用性レスポンス DTO
 */
export class CourseMonthlyAvailabilityResponseDto {
    /** コースID */
    courseId!: number;

    /** 対象年 (YYYY) */
    year!: string;

    /** 対象月 (MM) */
    month!: string;

    /** １ヶ月分の日毎可用性 */
    days!: DailyAvailabilityDto[];
}
