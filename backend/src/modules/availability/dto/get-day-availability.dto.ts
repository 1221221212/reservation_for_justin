// backend/src/modules/availability/dto/get-day-availability.dto.ts

import { IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDayAvailabilityDto {
    @ApiProperty({ description: '店舗ID', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    storeId!: number;

    @ApiProperty({ description: '日付 (YYYY-MM-DD)', example: '2025-08-12' })
    @IsDateString()
    date!: string;

    @ApiProperty({ description: '人数', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    partySize!: number;
}
