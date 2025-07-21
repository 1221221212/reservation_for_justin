// src/modules/course/dto/create-course.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsInt,
    Min,
    IsEnum,
    ValidateNested,
    IsArray,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';

export class CreateScheduleItemDto {
    @ApiProperty({ description: '曜日 0(日)〜6(土)、7=祝日' })
    @IsInt()
    dayOfWeek!: number;

    @ApiProperty({ description: '開始時刻 (HH:mm:ss)' })
    @IsString()
    startTime!: string;

    @ApiProperty({ description: '終了時刻 (HH:mm:ss)', required: false })
    @IsOptional()
    @IsString()
    endTime?: string;
}

export class CreateCourseDto {
    @ApiProperty({ description: 'コース名', example: 'ディナーコース' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ description: '価格', example: 5000, required: false })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ description: '最小人数', example: 1, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    minPeople?: number;

    @ApiProperty({ description: '最大人数', example: 4, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxPeople?: number;

    @ApiProperty({ description: '所要時間（分）', example: 120 })
    @IsInt()
    @Min(1)
    durationMinutes!: number;

    @ApiProperty({
        description: 'コース説明',
        example: '前菜・メイン・デザート付き',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    // ───────────────────────────────────────────────────────────
    @ApiProperty({
        description: '定期スケジュールアイテム一覧（任意）',
        type: [CreateScheduleItemDto],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateScheduleItemDto)
    scheduleItems?: CreateScheduleItemDto[];

    @ApiProperty({
        description: '祝日を定期スケジュールに含めるか',
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    applyOnHoliday?: boolean;

    @ApiProperty({
        description: '定期スケジュール有効開始日 (YYYY-MM-DD)',
        required: false,
    })
    @IsOptional()
    @IsString()
    effectiveFrom?: string;

    @ApiProperty({
        description: '定期スケジュール有効終了日 (YYYY-MM-DD)',
        required: false,
    })
    @IsOptional()
    @IsString()
    effectiveTo?: string;
    // ───────────────────────────────────────────────────────────

    @ApiProperty({
        description: 'ステータス',
        enum: CourseStatus,
        example: CourseStatus.ACTIVE,
        required: false,
    })
    @IsOptional()
    @IsEnum(CourseStatus)
    status?: CourseStatus;
}
