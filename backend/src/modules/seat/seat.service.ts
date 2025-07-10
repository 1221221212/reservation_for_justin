// backend/src/modules/seat/seat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { SuspendSeatDto } from './dto/suspend-seat.dto';

type SeatWithAttributes = {
    id: number;
    name: string;
    minCapacity: number;
    maxCapacity: number;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
    attributes: {
        groupId: number;
        groupName: string;
        attributeId: number;
        attributeName: string;
    }[];
};

@Injectable()
export class SeatService {
    constructor(private readonly prisma: PrismaService) {}

    /** 指定店舗の全座席＋属性一覧を取得 */
    async findAll(storeId: number): Promise<SeatWithAttributes[]> {
        const seats = await this.prisma.seat.findMany({
            where: { storeId: BigInt(storeId) },
            include: {
                attributes: {
                    include: {
                        attribute: {
                            include: { group: true },
                        },
                    },
                },
            },
            orderBy: { id: 'asc' },
        });

        return seats.map(seat => ({
            id: Number(seat.id),
            name: seat.name,
            minCapacity: seat.minCapacity,
            maxCapacity: seat.maxCapacity,
            status: seat.status,
            createdAt: seat.createdAt,
            updatedAt: seat.updatedAt,
            attributes: seat.attributes.map(a => ({
                groupId: Number(a.attribute.groupId),
                groupName: a.attribute.group.name,
                attributeId: Number(a.attributeId),
                attributeName: a.attribute.name,
            })),
        }));
    }

    /** 新しい座席を作成。属性の紐付けも同時に行う */
    async create(
        storeId: number,
        dto: CreateSeatDto
    ): Promise<SeatWithAttributes> {
        const { name, minCapacity, maxCapacity, attributeIds } = dto;

        const seat = await this.prisma.seat.create({
            data: {
                storeId: BigInt(storeId),
                name,
                minCapacity,
                maxCapacity,
                attributes:
                    attributeIds && attributeIds.length
                        ? {
                            create: attributeIds.map(id => ({
                                attributeId: BigInt(id),
                            })),
                        }
                        : undefined,
            },
            include: {
                attributes: {
                    include: {
                        attribute: {
                            include: { group: true },
                        },
                    },
                },
            },
        });

        return {
            id: Number(seat.id),
            name: seat.name,
            minCapacity: seat.minCapacity,
            maxCapacity: seat.maxCapacity,
            status: seat.status,
            createdAt: seat.createdAt,
            updatedAt: seat.updatedAt,
            attributes: seat.attributes.map(a => ({
                groupId: Number(a.attribute.groupId),
                groupName: a.attribute.group.name,
                attributeId: Number(a.attributeId),
                attributeName: a.attribute.name,
            })),
        };
    }

    /** 座席を suspended に更新 (論理停止) */
    async suspendSeat(
        storeId: number,
        seatId: number,
        _dto: SuspendSeatDto
    ): Promise<{ id: number; status: 'suspended'; updatedAt: Date }> {
        const existing = await this.prisma.seat.findFirst({
            where: { id: BigInt(seatId), storeId: BigInt(storeId) },
        });
        if (!existing) {
            throw new NotFoundException(
                `Seat ${seatId} not found in store ${storeId}`
            );
        }

        const updated = await this.prisma.seat.update({
            where: { id: BigInt(seatId) },
            data: { status: 'suspended' },
        });

        return {
            id: Number(updated.id),
            status: 'suspended',
            updatedAt: updated.updatedAt,
        };
    }
}
