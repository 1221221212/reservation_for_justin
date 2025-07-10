import { IsDateString, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ClosedDayRuleDto } from './closed-day-rule.dto';

/** 新規作成用 DTO */
export class CreateClosedDayGroupDto {
    @IsDateString()
    effectiveFrom!: string;

    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ClosedDayRuleDto)
    rules!: ClosedDayRuleDto[];
}
