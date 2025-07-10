// backend/src/modules/layout/layout.service.ts
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateLayoutDto } from './dto/create-layout.dto';

export interface LayoutWithSeats {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    seats: { id: number; name: string }[];
}

@Injectable()
export class LayoutService {
    constructor(private readonly prisma: PrismaService) { }

    /** レイアウト一覧取得 */
    async findAll(storeId: number): Promise<LayoutWithSeats[]> {
        // ストア存在チェックなどが必要であれば追加
        const layouts = await this.prisma.layout.findMany({
            where: { storeId: BigInt(storeId) },
            include: {
                seats: {
                    include: {
                        seat: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { id: 'asc' },
        });

        return layouts.map(l => ({
            id: Number(l.id),
            name: l.name,
            status: l.status,
            seats: l.seats.map(ls => ({ id: Number(ls.seat.id), name: ls.seat.name })),
        }));
    }

    /** 新規レイアウト作成 */
    async create(
        storeId: number,
        dto: CreateLayoutDto
    ): Promise<LayoutWithSeats> {
        // ストア存在チェックなどを追加可能
        const layout = await this.prisma.layout.create({
            data: {
                storeId: BigInt(storeId),
                name: dto.name,
                seats: {
                    create: dto.seatIds.map(id => ({ seatId: BigInt(id) })),
                },
            },
            include: {
                seats: {
                    include: { seat: { select: { id: true, name: true } } },
                },
            },
        });

        return {
            id: Number(layout.id),
            name: layout.name,
            status: layout.status,
            seats: layout.seats.map(ls => ({ id: Number(ls.seat.id), name: ls.seat.name })),
        };
    }
}
