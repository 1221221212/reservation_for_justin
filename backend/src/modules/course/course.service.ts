// backend/src/modules/course/course.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CourseService {
    constructor(private readonly prisma: PrismaService) { }

    /** 全コース取得 */
    async findAll(storeId: number): Promise<CourseResponseDto[]> {
        const courses = await this.prisma.course.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
        return courses.map(c => this.toDto(c));
    }

    /** 単一コース取得（定期スケジュールのみ） */
    async findOne(storeId: number, courseId: number): Promise<CourseResponseDto> {
        const course = await this.prisma.course.findFirst({
            where: { storeId, id: courseId },
            include: {
                scheduleGroup: { include: { schedules: true } },
                images: true,
            },
        });
        if (!course) throw new NotFoundException(`Course ${courseId} not found`);

        const dto = this.toDto(course);

        // 定期スケジュール
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

        // 画像一覧
        dto.images = course.images.map(img => img.url);

        return dto;
    }

    /** コース作成＋定期スケジュール登録のみ */
    async create(storeId: number, dto: CreateCourseDto): Promise<CourseResponseDto> {
        const course = await this.prisma.$transaction(async tx => {
            // 1) コース本体
            const created = await tx.course.create({
                data: {
                    storeId,
                    name: dto.name,
                    price: dto.price,
                    minPeople: dto.minPeople,
                    maxPeople: dto.maxPeople,
                    durationMinutes: dto.durationMinutes,
                    description: dto.description,
                    status: dto.status ?? CourseStatus.ACTIVE,
                },
            });

            // 2) 定期スケジュールグループ
            if (dto.scheduleItems?.length) {
                await tx.courseScheduleGroup.create({
                    data: {
                        courseId: created.id,
                        applyOnHoliday: dto.applyOnHoliday ?? false,
                        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
                        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                        schedules: {
                            create: dto.scheduleItems.map(si => {
                                const start = new Date(`1970-01-01T${si.startTime}`);
                                const end = new Date(`1970-01-01T${(si.endTime ?? si.startTime)}`);
                                return { dayOfWeek: si.dayOfWeek, startTime: start, endTime: end };
                            }),
                        },
                    },
                });
            }

            return created;
        });

        return this.toDto(course);
    }

    /** コース更新＋定期スケジュール upsert のみ */
    async update(storeId: number, courseId: number, dto: UpdateCourseDto): Promise<CourseResponseDto> {
        await this.findOne(storeId, courseId);

        const course = await this.prisma.$transaction(async tx => {
            // 1) 本体更新
            const updated = await tx.course.update({
                where: { id: courseId },
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

            // 2) 定期スケジュール upsert
            if (dto.scheduleItems) {
                await tx.courseScheduleGroup.upsert({
                    where: { courseId },
                    create: {
                        courseId: courseId,
                        applyOnHoliday: dto.applyOnHoliday ?? false,
                        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
                        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                        schedules: {
                            create: dto.scheduleItems.map(si => {
                                const start = new Date(`1970-01-01T${si.startTime}`);
                                const end = new Date(`1970-01-01T${(si.endTime ?? si.startTime)}`);
                                return { dayOfWeek: si.dayOfWeek, startTime: start, endTime: end };
                            }),
                        },
                    },
                    update: {
                        applyOnHoliday: dto.applyOnHoliday,
                        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
                        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
                        schedules: {
                            deleteMany: {},
                            create: dto.scheduleItems.map(si => {
                                const start = new Date(`1970-01-01T${si.startTime}`);
                                const end = new Date(`1970-01-01T${(si.endTime ?? si.startTime)}`);
                                return { dayOfWeek: si.dayOfWeek, startTime: start, endTime: end };
                            }),
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
            where: { id: courseId },
            data: { status: CourseStatus.INACTIVE },
        });
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
