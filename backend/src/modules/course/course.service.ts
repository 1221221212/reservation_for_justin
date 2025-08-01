import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma, CourseStatus, SpecialScheduleType } from '@prisma/client';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import {
    CourseMonthlyAvailabilityResponseDto,
    DailyAvailabilityDto,
} from './dto/course-monthly-availability.dto';
import {
    AvailableCoursesResponseDto,
    AvailableCourseDto,
} from './dto/available-courses-response.dto';
import { CourseScheduleService } from './course-schedule.service';
import { CreateSpecialCourseScheduleGroupDto } from './dto/create-special-course-schedule-group.dto';

@Injectable()
export class CourseService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scheduleService: CourseScheduleService,
    ) {}

    /** 全コース取得 */
    async findAll(storeId: number): Promise<CourseResponseDto[]> {
        const courses = await this.prisma.course.findMany({
            where: { storeId: BigInt(storeId) },
            orderBy: { createdAt: 'desc' },
        });
        return courses.map(c => this.toDto(c));
    }

    /** 単一コース取得（定期＋特別スケジュールと画像を含む） */
    async findOne(
        storeId: number,
        courseId: number,
    ): Promise<CourseResponseDto> {
        const course = await this.prisma.course.findFirst({
            where: { storeId: BigInt(storeId), id: BigInt(courseId) },
            include: {
                scheduleGroup: { include: { schedules: true } },
                specialGroups: { include: { specialItems: true } },
                images: true,
            },
        });
        if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }

        const dto = this.toDto(course);
        if (course.scheduleGroup) {
            const g = course.scheduleGroup;
            dto.effectiveFrom = g.effectiveFrom?.toISOString().slice(0, 10);
            dto.effectiveTo = g.effectiveTo?.toISOString().slice(0, 10);
            dto.applyOnHoliday = g.applyOnHoliday;
            dto.scheduleItems = g.schedules.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime.toTimeString().slice(0, 8),
                endTime: s.endTime.toTimeString().slice(0, 8),
            }));
        } else {
            dto.applyOnHoliday = false;
        }
        dto.images = course.images.map(img => img.url);
        return dto;
    }

    /** 新規コース作成＋定期スケジュール登録 */
    async create(
        storeId: number,
        dto: CreateCourseDto,
    ): Promise<CourseResponseDto> {
        try {
            const course = await this.prisma.$transaction(async tx => {
                const created = await tx.course.create({
                    data: {
                        storeId: BigInt(storeId),
                        name: dto.name,
                        price: dto.price,
                        minPeople: dto.minPeople,
                        maxPeople: dto.maxPeople,
                        durationMinutes: dto.durationMinutes,
                        description: dto.description,
                        status: dto.status ?? CourseStatus.ACTIVE,
                    },
                });
                if (dto.scheduleItems?.length) {
                    await tx.courseScheduleGroup.create({
                        data: {
                            courseId: created.id,
                            applyOnHoliday: dto.applyOnHoliday ?? false,
                            effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
                            effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                            schedules: {
                                create: dto.scheduleItems.map(si => ({
                                    dayOfWeek: si.dayOfWeek,
                                    startTime: new Date(`1970-01-01T${si.startTime}`),
                                    endTime: new Date(`1970-01-01T${si.endTime ?? si.startTime}`),
                                })),
                            },
                        },
                    });
                }
                return created;
            });
            return this.toDto(course);
        } catch (e: any) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                throw new ConflictException('同じ名前のコースが既に存在します');
            }
            throw e;
        }
    }

    /** コース更新＋定期スケジュール upsert */
    async update(
        storeId: number,
        courseId: number,
        dto: UpdateCourseDto,
    ): Promise<CourseResponseDto> {
        await this.findOne(storeId, courseId);
        const course = await this.prisma.$transaction(async tx => {
            const updated = await tx.course.update({
                where: { id: BigInt(courseId) },
                data: {
                    name: dto.name,
                    price: dto.price,
                    minPeople: dto.minPeople,
                    maxPeople: dto.maxPeople,
                    durationMinutes: dto.durationMinutes,
                    description: dto.description,
                    status: dto.status,
                },
            });
            if (dto.scheduleItems) {
                await tx.courseScheduleGroup.upsert({
                    where: { courseId: BigInt(courseId) },
                    create: {
                        courseId: BigInt(courseId),
                        applyOnHoliday: dto.applyOnHoliday ?? false,
                        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
                        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                        schedules: {
                            create: dto.scheduleItems.map(si => ({
                                dayOfWeek: si.dayOfWeek,
                                startTime: new Date(`1970-01-01T${si.startTime}`),
                                endTime: new Date(`1970-01-01T${si.endTime ?? si.startTime}`),
                            })),
                        },
                    },
                    update: {
                        applyOnHoliday: dto.applyOnHoliday,
                        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
                        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
                        schedules: {
                            deleteMany: {},
                            create: dto.scheduleItems.map(si => ({
                                dayOfWeek: si.dayOfWeek,
                                startTime: new Date(`1970-01-01T${si.startTime}`),
                                endTime: new Date(`1970-01-01T${si.endTime ?? si.startTime}`),
                            })),
                        },
                    },
                });
            }
            return updated;
        });
        return this.toDto(course);
    }

    /** 論理削除 */
    async remove(storeId: number, courseId: number): Promise<void> {
        await this.findOne(storeId, courseId);
        await this.prisma.course.update({
            where: { id: BigInt(courseId) },
            data: { status: CourseStatus.INACTIVE },
        });
    }

    /** 特別コーススケジュールグループの作成 */
    async createSpecialCourseScheduleGroup(
        storeId: number,
        courseId: number,
        dto: CreateSpecialCourseScheduleGroupDto,
    ): Promise<void> {
        await this.findOne(storeId, courseId);
        try {
            await this.prisma.$transaction(async tx => {
                const group = await tx.specialCourseScheduleGroup.create({
                    data: {
                        courseId: BigInt(courseId),
                        date: new Date(dto.date),
                        type: dto.type,
                        reason: dto.reason,
                        status: CourseStatus.ACTIVE,
                    },
                });
                if (dto.type === SpecialScheduleType.OPEN && dto.schedules?.length) {
                    await tx.specialCourseSchedule.createMany({
                        data: dto.schedules.map(s => ({
                            groupId: group.id,
                            startTime: new Date(`1970-01-01T${s.startTime}`),
                            endTime: new Date(`1970-01-01T${s.endTime}`),
                            description: s.description,
                        })),
                    });
                }
            });
        } catch (e: any) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                throw new ConflictException('同じ日付の特別日が既に存在します');
            }
            throw e;
        }
    }

    /** 月次可用性取得 */
    async getMonthlyAvailability(
        storeId: number,
        courseId: number,
        year: number,
        month: number,
    ): Promise<CourseMonthlyAvailabilityResponseDto> {
        await this.scheduleService.validateCourseAndGroup(
            storeId,
            courseId,
        );
        const daysCount = this.scheduleService.getDaysInMonth(year, month);
        const days: DailyAvailabilityDto[] = [];
        for (let d = 1; d <= daysCount; d++) {
            const date = new Date(year, month - 1, d)
                .toISOString()
                .slice(0, 10);
            const { available, intervals } =
                await this.scheduleService.computeDailyAvailability(
                    courseId,
                    date,
                );
            days.push({ date, available, intervals });
        }
        return {
            courseId,
            year: String(year).padStart(4, '0'),
            month: String(month).padStart(2, '0'),
            days,
        };
    }

    /** 指定日時＋人数で利用可能なコース一覧取得 */
    async findAvailableCourses(
        storeId: number,
        date: string,
        time: string,
        count?: number,
    ): Promise<AvailableCoursesResponseDto> {
        const courses = await this.prisma.course.findMany({
            where: { storeId: BigInt(storeId), status: CourseStatus.ACTIVE },
            include: {
                scheduleGroup: true,
                specialGroups: true,
            },
        });
        const result: AvailableCourseDto[] = [];
        for (const c of courses) {
            // 人数制限チェック
            if (count != null) {
                if (c.minPeople != null && count < c.minPeople) continue;
                if (c.maxPeople != null && count > c.maxPeople) continue;
            }
            // 可用性判定
            const { available, intervals } =
                await this.scheduleService.computeDailyAvailability(
                    Number(c.id),
                    date,
                );
            if (!available) continue;
            const timestamp = `${time}:00`;
            const target = intervals.find(
                iv => iv.startTime <= timestamp && timestamp < iv.endTime,
            );
            if (!target) continue;
            // レスポンス組立
            result.push({
                courseId: Number(c.id),
                name: c.name,
                durationMinutes: c.durationMinutes,
                price: c.price != null ? Number(c.price) : undefined,
                minPeople: c.minPeople ?? undefined,
                maxPeople: c.maxPeople ?? undefined,
                startable: true,
                endTime: target.endTime,
            });
        }
        return { date, time, courses: result };
    }

    /** Course → DTO 変換 */
    private toDto(course: any): CourseResponseDto {
        const dto = new CourseResponseDto();
        dto.id = course.id;
        dto.storeId = course.storeId;
        dto.name = course.name;
        dto.price = course.price ?? undefined;
        dto.minPeople = course.minPeople ?? undefined;
        dto.maxPeople = course.maxPeople ?? undefined;
        dto.durationMinutes = course.durationMinutes;
        dto.description = course.description ?? undefined;
        dto.status = course.status;
        dto.createdAt = course.createdAt;
        dto.updatedAt = course.updatedAt;
        return dto;
    }
}
