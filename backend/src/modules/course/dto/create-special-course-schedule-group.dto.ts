import { IsDateString, IsEnum, IsOptional, IsString, ValidateNested, IsArray, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SpecialScheduleType } from '@prisma/client';

/**
 * 特別コーススケジュール詳細 (時間帯)
 */
export class CreateSpecialCourseScheduleDto {
    @ApiProperty({ description: '開始時刻 (HH:mm:ss)', example: '10:00:00' })
    @Matches(/^[0-2]\d:[0-5]\d:[0-5]\d$/)
    startTime!: string;

    @ApiProperty({ description: '終了時刻 (HH:mm:ss)', example: '12:30:00' })
    @Matches(/^[0-2]\d:[0-5]\d:[0-5]\d$/)
    endTime!: string;

    @ApiProperty({ description: '説明', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

/**
 * 特別コーススケジュールグループ作成 DTO
 */
export class CreateSpecialCourseScheduleGroupDto {
    @ApiProperty({ description: '日付 (YYYY-MM-DD)', example: '2025-08-15' })
    @IsDateString()
    date!: string;

    @ApiProperty({ description: '種別', enum: SpecialScheduleType })
    @IsEnum(SpecialScheduleType)
    type!: SpecialScheduleType;

    @ApiProperty({ description: '理由', required: false })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        description: '時間帯リスト (BUSINESS 時のみ必須)',
        type: [CreateSpecialCourseScheduleDto],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSpecialCourseScheduleDto)
    schedules?: CreateSpecialCourseScheduleDto[];
}
