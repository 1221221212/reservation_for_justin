import {
    IsString,
    IsDateString,
    IsBoolean,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsInt,
    IsOptional,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleItemDto {
    @IsInt()
    @Type(() => Number)
    layoutId!: number;

    @IsInt()
    dayOfWeek!: number;

    @IsString()
    @Matches(/^\d{2}:\d{2}:\d{2}$/)
    startTime!: string;

    @IsOptional()
    @Matches(/^\d{2}:\d{2}:\d{2}$/)
    endTime?: string;
}

export class CreateScheduleGroupDto {
    @IsString()
    name!: string;

    @IsDateString()
    effectiveFrom!: string;

    @IsBoolean()
    applyOnHoliday!: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ScheduleItemDto)
    schedules!: ScheduleItemDto[];
}
