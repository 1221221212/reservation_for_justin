// backend/src/modules/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    /** アクティブユーザー一覧取得（店舗名含む） */
    async findAll() {
        return this.prisma.userAccount.findMany({
            where: { status: UserStatus.ACTIVE },
            include: {
                store: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** 新規ユーザー作成 */
    async create(dto: CreateUserDto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        return this.prisma.userAccount.create({
            data: {
                userId: dto.userId,
                username: dto.username,
                passwordHash: hashed,
                role: dto.role,
                storeId: dto.storeId ? BigInt(dto.storeId) : undefined,
                status: UserStatus.ACTIVE,
                isLocked: false,
            },
        });
    }

    /** ユーザー更新 */
    async update(id: string, dto: UpdateUserDto) {
        const userId = BigInt(id);
        const existing = await this.prisma.userAccount.findUnique({
            where: { id: userId },
        });
        if (!existing) {
            throw new NotFoundException('ユーザーが見つかりません');
        }

        const data: Partial<Parameters<typeof this.prisma.userAccount.update>[0]['data']> = {};
        if (dto.username !== undefined) data.username = dto.username;
        if (dto.password !== undefined) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        if (dto.role !== undefined) data.role = dto.role;
        if (dto.status !== undefined) data.status = dto.status;
        if (dto.isLocked !== undefined) data.isLocked = dto.isLocked;
        if (dto.storeId !== undefined) data.storeId = BigInt(dto.storeId);

        return this.prisma.userAccount.update({
            where: { id: userId },
            data,
        });
    }

    /** ユーザーを非アクティブ化（論理削除） */
    async remove(id: string) {
        const userId = BigInt(id);
        const user = await this.prisma.userAccount.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('ユーザーが見つかりません');
        }
        return this.prisma.userAccount.update({
            where: { id: userId },
            data: { status: UserStatus.INACTIVE },
        });
    }
}
