// backend/src/modules/availability/dto/get-day-availability.dto.ts

import { IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDayAvailabilityDto {
    @ApiProperty({ description: '店舗ID', example: 1 })
    @IsInt()
    @Min(1)
    storeId!: number;   // ← 確定代入アサーション

    @ApiProperty({ description: '日付（YYYY-MM-DD）', example: '2025-07-21' })
    @IsDateString()
    date!: string;      // ← ここも!

    @ApiProperty({ description: 'パーティーサイズ', example: 2 })
    @IsInt()
    @Min(1)
    partySize!: number; // ← ここも!
}
