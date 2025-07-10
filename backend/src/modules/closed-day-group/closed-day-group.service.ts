import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateClosedDayGroupDto } from './dto/create-closed-day-group.dto';
import { ClosedDayGroupDto } from './dto/closed-day-group.dto';

@Injectable()
export class ClosedDayGroupService {
    constructor(private readonly prisma: PrismaService) { }

    /** storeId に紐づく全グループ＋ルールを取得 */
    async findAll(storeId: number): Promise<ClosedDayGroupDto[]> {
        const groups = await this.prisma.closedDayGroup.findMany({
            where: { storeId: BigInt(storeId) },
            include: { rules: true },
            orderBy: { effectiveFrom: 'asc' },
        });
        return groups.map(g => ({
            id: Number(g.id),
            effectiveFrom: g.effectiveFrom.toISOString().split('T')[0],
            rules: g.rules.map(r => ({
                id: Number(r.id),
                type: r.type,
                dayOfWeek: r.dayOfWeek ?? undefined,
                dayOfMonth: r.dayOfMonth ?? undefined,
                weekOfMonth: r.weekOfMonth ?? undefined,
            })),
        }));
    }

    /** 新規グループ＋ルールをトランザクションで作成 */
    async create(
        storeId: number,
        dto: CreateClosedDayGroupDto,
    ): Promise<ClosedDayGroupDto> {
        const group = await this.prisma.$transaction(async tx => {
            const g = await tx.closedDayGroup.create({
                data: {
                    storeId: BigInt(storeId),
                    effectiveFrom: new Date(dto.effectiveFrom),
                    rules: {
                        create: dto.rules.map(r => ({
                            type: r.type,
                            dayOfWeek: r.dayOfWeek,
                            dayOfMonth: r.dayOfMonth,
                            weekOfMonth: r.weekOfMonth,
                        })),
                    },
                },
                include: { rules: true },
            });
            return g;
        });
        return {
            id: Number(group.id),
            effectiveFrom: group.effectiveFrom.toISOString().split('T')[0],
            rules: group.rules.map(r => ({
                id: Number(r.id),
                type: r.type,
                dayOfWeek: r.dayOfWeek ?? undefined,
                dayOfMonth: r.dayOfMonth ?? undefined,
                weekOfMonth: r.weekOfMonth ?? undefined,
            })),
        };
    }
}
