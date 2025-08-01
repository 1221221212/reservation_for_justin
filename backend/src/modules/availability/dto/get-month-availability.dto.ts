// backend/src/modules/availability/dto/get-month-availability.dto.ts

import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMonthAvailabilityDto {
    @ApiProperty({ description: '店舗ID', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    storeId!: number;

    @ApiProperty({ description: '西暦年', example: 2025 })
    @Type(() => Number)
    @IsInt()
    year!: number;

    @ApiProperty({ description: '月（1～12）', example: 7 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    month!: number;
}
