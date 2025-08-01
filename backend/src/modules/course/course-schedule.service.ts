import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import {
    Prisma,
    CourseStatus,
    SpecialScheduleType,
    CourseSchedule,
    SpecialCourseSchedule,
} from '@prisma/client';
import {
    DailyAvailabilityDto,
    AvailabilityIntervalDto,
} from './dto/course-monthly-availability.dto';

@Injectable()
export class CourseScheduleService {
    constructor(private readonly prisma: PrismaService) {}

    /** 指定年月の月末日を返す */
    getDaysInMonth(year: number, month: number): number {
        return new Date(year, month, 0).getDate();
    }

    /**
     * Course とスケジュールグループの有効性をチェック
     * @throws NotFoundException / BadRequestException
     */
    async validateCourseAndGroup(
        storeId: number,
        courseId: number,
    ): Promise<
        Prisma.CourseScheduleGroupGetPayload<{
            include: { schedules: true };
        }>
    > {
        const storeIdBig = BigInt(storeId);
        const courseIdBig = BigInt(courseId);

        // コースチェック
        const course = await this.prisma.course.findFirst({
            where: { storeId: storeIdBig, id: courseIdBig },
        });
        if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }
        if (course.status !== CourseStatus.ACTIVE) {
            throw new BadRequestException(
                `Course ${courseId} is not active`,
            );
        }

        // グループチェック
        const group = await this.prisma.courseScheduleGroup.findFirst({
            where: { courseId: courseIdBig },
            include: { schedules: true },
        });
        if (!group || group.status !== CourseStatus.ACTIVE) {
            throw new BadRequestException(
                `Regular schedule not set or inactive for course ${courseId}`,
            );
        }

        return group;
    }

    /**
     * １日分の可用性を計算する
     */
    async computeDailyAvailability(
        courseId: number,
        date: string, // "YYYY-MM-DD"
    ): Promise<{
        available: boolean;
        intervals: AvailabilityIntervalDto[];
    }> {
        const courseIdBig = BigInt(courseId);

        // 1) 特別スケジュール
        const special =
            await this.prisma.specialCourseScheduleGroup.findFirst({
                where: { courseId: courseIdBig, date: new Date(date) },
                include: { specialItems: true },
            });
        if (special && special.status === CourseStatus.ACTIVE) {
            if (special.type === SpecialScheduleType.CLOSED) {
                return { available: false, intervals: [] };
            }
            return {
                available: true,
                intervals: special.specialItems.map(
                    (i: SpecialCourseSchedule) => ({
                        startTime: i.startTime.toTimeString().slice(0, 8),
                        endTime: i.endTime.toTimeString().slice(0, 8),
                    }),
                ),
            };
        }

        // 2) 定期スケジュールグループ取得・有効性チェック
        const group = await this.prisma.courseScheduleGroup.findFirst({
            where: { courseId: courseIdBig },
            include: { schedules: true },
        });
        if (!group || group.status !== CourseStatus.ACTIVE) {
            return { available: false, intervals: [] };
        }

        // 3) 提供範囲チェック
        const targetDate = new Date(date);
        if (
            (group.effectiveFrom && targetDate < group.effectiveFrom) ||
            (group.effectiveTo && targetDate > group.effectiveTo)
        ) {
            return { available: false, intervals: [] };
        }

        // 4) 祝日フラグ取得（applyOnHoliday=true の場合のみ）
        let isHoliday = false;
        if (group.applyOnHoliday) {
            const holidayRecord = await this.prisma.holiday.findFirst({
                where: { date: new Date(date) },
                select: { date: true },
            });
            isHoliday = !!holidayRecord;
        }

        // 5) 適用する曜日キー決定
        const scheduleDayOfWeek =
            isHoliday ? 7 : targetDate.getUTCDay();

        // 6) 定期スケジュール抽出
        const items = group.schedules.filter(
            (s: CourseSchedule) => s.dayOfWeek === scheduleDayOfWeek,
        );

        // 7) 可用性判定・返却
        if (items.length === 0) {
            return { available: false, intervals: [] };
        }
        const intervals = items.map((s: CourseSchedule) => ({
            startTime: s.startTime.toTimeString().slice(0, 8),
            endTime: s.endTime.toTimeString().slice(0, 8),
        }));
        return { available: true, intervals };
    }
}