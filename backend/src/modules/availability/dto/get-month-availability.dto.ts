// backend/src/modules/availability/dto/get-month-availability.dto.ts

import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMonthAvailabilityDto {
    @ApiProperty({ description: '店舗ID', example: 1 })
    @IsInt()
    @Min(1)
    storeId!: number;  // ← 確定代入アサーション

    @ApiProperty({ description: '西暦年', example: 2025 })
    @IsInt()
    year!: number;     // ← ここも!

    @ApiProperty({ description: '月（1～12）', example: 7 })
    @IsInt()
    @Min(1)
    month!: number;    // ← ここも!
}
