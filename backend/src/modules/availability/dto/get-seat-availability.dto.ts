import {
    IsInt,
    IsOptional,
    IsString,
    IsDateString,
    Matches,
    Min,
    IsArray,
    ArrayNotEmpty,
    ArrayUnique,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetSeatAvailabilityDto {
    @ApiProperty({ description: '店舗ID', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    storeId!: number;

    @ApiProperty({ description: '日付 (YYYY-MM-DD)', example: '2025-08-20' })
    @IsDateString()
    date!: string;

    @ApiProperty({ description: '開始時刻 (HH:mm)', example: '18:00' })
    @IsString()
    @Matches(/^[0-2]\d:[0-5]\d$/)
    time!: string;

    @ApiProperty({ description: '人数', example: 2, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    partySize!: number;

    @ApiPropertyOptional({
        description: 'コースID（指定あればコース所要時間を使用）',
        example: 12,
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    courseId?: number;

    @ApiPropertyOptional({
        description: '所要時間（分）。courseId未指定時のみ使用／未指定なら標準所要時間を適用',
        example: 60,
        minimum: 1,
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;

    @ApiPropertyOptional({
        description:
            '席属性のID配列（AND 条件）。未指定または空配列なら属性フィルタなし',
        type: [Number],
        example: [1, 3],
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Transform(({ value }) => {
        // attributes=1&attributes=3 / attributes[]=1&attributes[]=3 / "1,3" を許容
        if (value == null || value === '') return [];
        if (Array.isArray(value)) return value.map((v) => Number(v));
        return String(value)
            .split(',')
            .map((v) => Number(v.trim()))
            .filter((n) => !Number.isNaN(n));
    })
    attributes?: number[];
}
