// backend/src/modules/layout/layout.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateLayoutDto } from './dto/create-layout.dto';

const prisma = new PrismaClient();

export interface LayoutWithSeats {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    seats: { id: number; name: string }[];
}

@Injectable()
export class LayoutService {
    /** レイアウト一覧取得 */
    async findAll(storeId: number): Promise<LayoutWithSeats[]> {
        const layouts = await prisma.layout.findMany({
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
        const layout = await prisma.layout.create({
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