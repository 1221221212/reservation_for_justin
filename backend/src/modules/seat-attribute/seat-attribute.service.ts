// backend/src/modules/seat-attribute/seat-attribute.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, AttributeStatus } from '@prisma/client';
import { CreateSeatAttributeDto } from './dto/create-seat-attribute.dto';

const prisma = new PrismaClient();

@Injectable()
export class SeatAttributeService {
    /** 既存グループに属性を追加 */
    async create(
        storeId: number,
        groupId: number,
        dto: CreateSeatAttributeDto,
    ) {
        const id = BigInt(groupId);
        // グループの存在確認
        const group = await prisma.seatAttributeGroup.findUnique({ where: { id } });
        if (!group || group.storeId !== BigInt(storeId) || group.status === AttributeStatus.inactive) {
            throw new NotFoundException(`SeatAttributeGroup not found, id: ${groupId}`);
        }
        return prisma.seatAttribute.create({
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
        const attribute = await prisma.seatAttribute.findUnique({ where: { id } });
        if (
            !attribute ||
            attribute.storeId !== BigInt(storeId) ||
            attribute.groupId !== BigInt(groupId) ||
            attribute.status === AttributeStatus.inactive
        ) {
            throw new NotFoundException(`SeatAttribute not found, id: ${attributeId}`);
        }
        return prisma.seatAttribute.update({
            where: { id },
            data: { status: AttributeStatus.inactive },
        });
    }
}
