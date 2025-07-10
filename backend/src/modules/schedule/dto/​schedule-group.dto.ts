export class ScheduleDto {
    layoutId!: number;
    dayOfWeek!: number;
    startTime!: string;
    endTime?: string;
}

export class ScheduleGroupDto {
    id!: number;
    name!: string;
    effectiveFrom!: string;
    applyOnHoliday!: boolean;
    schedules!: ScheduleDto[];
}