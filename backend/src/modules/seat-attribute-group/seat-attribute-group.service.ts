// backend/src/modules/seat-attribute-group/seat-attribute-group.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, AttributeStatus } from '@prisma/client';
import { CreateSeatAttributeGroupDto } from './dto/create-seat-attribute-group.dto';

const prisma = new PrismaClient();

@Injectable()
export class SeatAttributeGroupService {
    /** 指定店舗のすべてのグループと属性を取得 */
    async findAll(storeId: number) {
        return prisma.seatAttributeGroup.findMany({
            where: { storeId },
            include: { attributes: true },
        });
    }

    /** グループと属性を一括作成 */
    async create(storeId: number, dto: CreateSeatAttributeGroupDto) {
        return prisma.seatAttributeGroup.create({
            data: {
                storeId,
                name: dto.name,
                selectionType: dto.selectionType,
                attributes: {
                    create: dto.attributes.map(attr => ({ name: attr.name, storeId })),
                },
            },
            include: { attributes: true },
        });
    }

    /** グループとその属性を論理削除（statusをinactiveに更新） */
    async remove(storeId: number, groupId: number) {
        const id = BigInt(groupId);
        const storeIdBig = BigInt(storeId);
        const group = await prisma.seatAttributeGroup.findUnique({ where: { id } });
        if (!group || group.storeId !== storeIdBig) {
            throw new NotFoundException(`SeatAttributeGroup not found, id: ${groupId}`);
        }
        // 属性を論理削除
        await prisma.seatAttribute.updateMany({
            where: { groupId: id },
            data: { status: AttributeStatus.inactive },
        });
        // グループ自体を論理削除
        const updatedGroup = await prisma.seatAttributeGroup.update({
            where: { id },
            data: { status: AttributeStatus.inactive },
        });
        return updatedGroup;
    }
}
