// backend/src/modules/schedule/schedule.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateScheduleGroupDto } from './dto/​create-schedule-group.dto';
import { ScheduleGroupDto, ScheduleDto } from './dto/​schedule-group.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    /** 指定店舗の全スケジュールグループ＋アイテムを取得 */
    async findAll(storeId: number): Promise<ScheduleGroupDto[]> {
        const store = await this.prisma.store.findUnique({
            where: { id: BigInt(storeId) },
        });
        if (!store) {
            throw new NotFoundException(`Store ${storeId} not found`);
        }

        const groups = await this.prisma.layoutScheduleGroup.findMany({
            where: { storeId: BigInt(storeId) },
            include: { schedules: true },
            orderBy: { effectiveFrom: 'desc' },
        });

        return groups.map(g => {
            const groupDto = new ScheduleGroupDto();
            groupDto.id = Number(g.id);
            groupDto.name = g.name;
            groupDto.effectiveFrom = g.effectiveFrom.toISOString().split('T')[0];
            groupDto.applyOnHoliday = g.applyOnHoliday;
            groupDto.schedules = g.schedules.map(s => {
                const dto = new ScheduleDto();
                dto.layoutId = Number(s.layoutId);
                dto.dayOfWeek = s.dayOfWeek;
                dto.startTime = s.startTime instanceof Date
                    ? s.startTime.toISOString().substr(11, 8)
                    : s.startTime;
                dto.endTime = s.endTime
                    ? (s.endTime instanceof Date
                        ? s.endTime.toISOString().substr(11, 8)
                        : s.endTime)
                    : undefined;
                return dto;
            });
            return groupDto;
        });
    }

    /** 単一グループ取得 */
    async findOne(storeId: number, groupId: number): Promise<ScheduleGroupDto> {
        const group = await this.prisma.layoutScheduleGroup.findUnique({
            where: { id: BigInt(groupId) },
            include: { schedules: true },
        });
        if (!group || group.storeId !== BigInt(storeId)) {
            throw new NotFoundException(`Schedule group ${groupId} not found`);
        }
        // DTO へマッピング
        return {
            id: Number(group.id),
            name: group.name,
            effectiveFrom: group.effectiveFrom.toISOString().split('T')[0],
            applyOnHoliday: group.applyOnHoliday,
            schedules: group.schedules.map(s => ({
                id: Number(s.id),
                layoutId: Number(s.layoutId),
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime.toISOString().substr(11, 8),
                endTime: s.endTime?.toISOString().substr(11, 8),
                status: s.status,
            })),
        };
    }

    /** 新しいスケジュールグループ＋アイテムを一括作成 */
    async create(storeId: number, dto: CreateScheduleGroupDto): Promise<void> {
        const store = await this.prisma.store.findUnique({
            where: { id: BigInt(storeId) },
        });
        if (!store) {
            throw new NotFoundException(`Store ${storeId} not found`);
        }

        // "HH:mm:ss" → Date オブジェクトに変換 (日付部分はダミー)
        const toTimeDate = (t: string): Date => new Date(`1970-01-01T${t}Z`);

        await this.prisma.layoutScheduleGroup.create({
            data: {
                storeId: BigInt(storeId),
                name: dto.name,
                effectiveFrom: new Date(dto.effectiveFrom),
                applyOnHoliday: dto.applyOnHoliday,
                schedules: {
                    create: dto.schedules.map(s => ({
                        layoutId: BigInt(s.layoutId),
                        dayOfWeek: s.dayOfWeek,
                        startTime: toTimeDate(s.startTime),
                        endTime: s.endTime ? toTimeDate(s.endTime) : undefined,
                    })),
                },
            },
        });
    }
}
