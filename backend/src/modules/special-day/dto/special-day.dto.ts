// src/modules/special-day/dto/special-day.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/** 特別日タイプ */
export enum SpecialDayType {
    BUSINESS = 'BUSINESS',
    CLOSED = 'CLOSED',
}

export class SpecialDayScheduleDto {
    @ApiProperty({ description: 'スケジュールID', example: '1' })
    id!: string;

    @ApiProperty({ description: '適用レイアウトID', example: '1' })
    layoutId!: string;

    @ApiProperty({ description: '開始時刻 (HH:mm)', example: '10:00' })
    startTime!: string;

    @ApiProperty({ description: '終了時刻 (HH:mm)', example: '12:30' })
    endTime!: string;
}

export class SpecialDayDto {
    @ApiProperty({ description: '特別日ID', example: '1' })
    id!: string;

    @ApiProperty({ description: '対象日付 (YYYY-MM-DD)', example: '2025-07-15' })
    date!: string;

    @ApiProperty({ description: '特別日タイプ', enum: SpecialDayType })
    type!: SpecialDayType;

    @ApiProperty({
        description: 'BUSINESS の場合に返却されるスケジュール配列',
        type: [SpecialDayScheduleDto],
        required: false,
    })
    schedules?: SpecialDayScheduleDto[];
}
