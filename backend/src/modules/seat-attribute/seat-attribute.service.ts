// backend/src/modules/seat-attribute/seat-attribute.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateSeatAttributeDto } from './dto/create-seat-attribute.dto';
import { AttributeStatus } from '@prisma/client';

@Injectable()
export class SeatAttributeService {
    constructor(private readonly prisma: PrismaService) { }

    /** 既存グループに属性を追加 */
    async create(
        storeId: number,
        groupId: number,
        dto: CreateSeatAttributeDto,
    ) {
        const id = BigInt(groupId);
        const group = await this.prisma.seatAttributeGroup.findUnique({ where: { id } });
        if (
            !group ||
            group.storeId !== BigInt(storeId) ||
            group.status === AttributeStatus.INACTIVE
        ) {
            throw new NotFoundException(`SeatAttributeGroup not found, id: ${groupId}`);
        }
        return this.prisma.seatAttribute.create({
            data: {
                storeId: BigInt(storeId),
                groupId: id,
                name: dto.name,
            },
        });
    }

    /** グループ内の特定属性を論理削除 */
    async remove(
        storeId: number,
        groupId: number,
        attributeId: number,
    ) {
        const id = BigInt(attributeId);
        const attribute = await this.prisma.seatAttribute.findUnique({ where: { id } });
        if (
            !attribute ||
            attribute.storeId !== BigInt(storeId) ||
            attribute.groupId !== BigInt(groupId) ||
            attribute.status === AttributeStatus.INACTIVE
        ) {
            throw new NotFoundException(`SeatAttribute not found, id: ${attributeId}`);
        }
        return this.prisma.seatAttribute.update({
            where: { id },
            data: { status: AttributeStatus.INACTIVE },
        });
    }
}
