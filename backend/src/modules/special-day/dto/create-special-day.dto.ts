// src/modules/special-day/dto/create-special-day.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsOptional,
    ValidateNested,
    IsArray,
    ArrayUnique,
    Matches,
    IsInt,
    IsEnum,
    IsBoolean,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/** 特別日タイプ */
export enum SpecialDayType {
    BUSINESS = 'BUSINESS',
    CLOSED = 'CLOSED',
}

export class CreateSpecialDayScheduleDto {
    @ApiProperty({ description: '適用するレイアウトID', example: 1 })
    @IsInt()
    @Type(() => Number)
    layoutId!: number;

    @ApiProperty({ description: '開始時刻 (HH:mm)', example: '10:00' })
    @IsString()
    @Matches(/^[0-2]\d:[0-5]\d$/)
    startTime!: string;

    @ApiProperty({ description: '終了時刻 (HH:mm)', example: '12:30' })
    @IsString()
    @Matches(/^[0-2]\d:[0-5]\d$/)
    endTime!: string;
}

export class CreateSpecialDayDto {
    @ApiProperty({ description: '対象日付 (YYYY-MM-DD)', example: '2025-07-15' })
    @IsDateString()
    date!: string;

    @ApiProperty({ description: '特別日タイプ', enum: SpecialDayType })
    @IsEnum(SpecialDayType)
    type!: SpecialDayType;

    @ApiProperty({
        description: 'BUSINESS の場合に設定するスケジュール配列',
        type: [CreateSpecialDayScheduleDto],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique((sch: CreateSpecialDayScheduleDto) =>
        `${sch.layoutId}-${sch.startTime}-${sch.endTime}`
    )
    @ValidateNested({ each: true })
    @Type(() => CreateSpecialDayScheduleDto)
    schedules?: CreateSpecialDayScheduleDto[];

    @ApiProperty({
        description: '特別日の理由',
        example: '年末年始の特別営業のため'
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string;

    @ApiProperty({
        description: '既存の特別日がある場合に上書きするフラグ',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    override?: boolean;
}
