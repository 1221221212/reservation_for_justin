// backend/src/modules/course/dto/course-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';

export class ScheduleItemResponseDto {
    @ApiProperty({ description: '曜日 0(日)〜6(土)、7=祝日' })
    dayOfWeek!: number;

    @ApiProperty({ description: '開始時刻 (HH:mm:ss)', example: '18:00:00' })
    startTime!: string;

    @ApiProperty({ description: '終了時刻 (HH:mm:ss)', required: false, example: '20:00:00' })
    endTime?: string;
}

export class CourseResponseDto {
    @ApiProperty({ description: 'コースID', example: 1 })
    id!: number;

    @ApiProperty({ description: '店舗ID', example: 1 })
    storeId!: number;

    @ApiProperty({ description: 'コース名', example: 'ディナーコース' })
    name!: string;

    @ApiProperty({ description: '価格', example: 5000, required: false })
    price?: number;

    @ApiProperty({ description: '最小人数', example: 1, required: false })
    minPeople?: number;

    @ApiProperty({ description: '最大人数', example: 4, required: false })
    maxPeople?: number;

    @ApiProperty({ description: '所要時間（分）', example: 120 })
    durationMinutes!: number;

    @ApiProperty({
        description: 'コース説明',
        example: '前菜・メイン・デザート付き',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'コース画像URL一覧',
        type: [String],
        required: false,
        example: ['https://…/img1.jpg', 'https://…/img2.jpg'],
    })
    images?: string[];

    @ApiProperty({
        description: '定期スケジュール有効開始日 (YYYY-MM-DD)',
        required: false,
        example: '2025-08-01',
    })
    effectiveFrom?: string;

    @ApiProperty({
        description: '定期スケジュール有効終了日 (YYYY-MM-DD)',
        required: false,
        example: '2025-12-31',
    })
    effectiveTo?: string;

    @ApiProperty({
        description: '祝日を週次スケジュールに含めるか',
        required: false,
        default: false,
    })
    applyOnHoliday?: boolean;

    @ApiProperty({
        description: '週次スケジュール一覧',
        type: [ScheduleItemResponseDto],
        required: false,
    })
    scheduleItems?: ScheduleItemResponseDto[];

    @ApiProperty({ description: 'ステータス', enum: CourseStatus })
    status!: CourseStatus;

    @ApiProperty({
        description: '作成日時',
        example: '2025-07-19T00:00:00Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: '更新日時',
        example: '2025-07-19T00:00:00Z',
    })
    updatedAt!: Date;
}
