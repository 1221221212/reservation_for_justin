import { ClosedDayRuleDto } from './closed-day-rule.dto';

/** API から返すグループ＋ルール詳細 */
export class ClosedDayGroupDto {
    id!: number;
    effectiveFrom!: string;
    rules!: ClosedDayRuleDto[];
}
