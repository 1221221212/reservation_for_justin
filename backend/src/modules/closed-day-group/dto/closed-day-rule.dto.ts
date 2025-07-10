import { ClosedDayType } from '@prisma/client';
import { IsEnum, IsOptional, IsInt } from 'class-validator';

/** 単一の定期休業ルール */
export class ClosedDayRuleDto {
    @IsEnum(ClosedDayType)
    type!: ClosedDayType;

    @IsOptional()
    @IsInt()
    dayOfWeek?: number;

    @IsOptional()
    @IsInt()
    dayOfMonth?: number;

    @IsOptional()
    @IsInt()
    weekOfMonth?: number;
}
