// backend/src/modules/seat-attribute-group/seat-attribute-group.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { AttributeStatus } from '@prisma/client';
import { CreateSeatAttributeGroupDto } from './dto/create-seat-attribute-group.dto';

@Injectable()
export class SeatAttributeGroupService {
    constructor(private readonly prisma: PrismaService) { }

    /** 指定店舗のすべてのグループと属性を取得 */
    async findAll(storeId: number) {
        return this.prisma.seatAttributeGroup.findMany({
            where: { storeId: BigInt(storeId) },
            include: { attributes: true },
            orderBy: { id: 'asc' },
        });
    }

    /** グループと属性を一括作成 */
    async create(
        storeId: number,
        dto: CreateSeatAttributeGroupDto,
    ) {
        return this.prisma.seatAttributeGroup.create({
            data: {
                storeId: BigInt(storeId),
                name: dto.name,
                selectionType: dto.selectionType,
                attributes: {
                    create: dto.attributes.map(attr => ({
                        name: attr.name,
                        storeId: BigInt(storeId),
                    })),
                },
            },
            include: { attributes: true },
        });
    }

    /** グループとその属性を論理削除（statusをinactiveに更新） */
    async remove(
        storeId: number,
        groupId: number,
    ) {
        const id = BigInt(groupId);
        const storeIdBig = BigInt(storeId);
        const group = await this.prisma.seatAttributeGroup.findUnique({ where: { id } });
        if (!group || group.storeId !== storeIdBig) {
            throw new NotFoundException(`SeatAttributeGroup not found, id: ${groupId}`);
        }
        // 属性を論理削除
        await this.prisma.seatAttribute.updateMany({
            where: { groupId: id },
            data: { status: AttributeStatus.INACTIVE },
        });
        // グループ自体を論理削除
        return this.prisma.seatAttributeGroup.update({
            where: { id },
            data: { status: AttributeStatus.INACTIVE },
        });
    }
}
