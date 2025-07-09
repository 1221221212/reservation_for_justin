// backend/src/modules/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, UserAccount, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserWithStore = UserAccount & {
    store: { id: bigint; name: string } | null;
};

@Injectable()
export class UserService {
    private prisma = new PrismaClient();

    /** アクティブユーザー一覧取得（店舗名含む） */
    async findAll(): Promise<UserWithStore[]> {
        return this.prisma.userAccount.findMany({
            where: { status: UserStatus.ACTIVE },
            include: {
                store: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** 新規ユーザー作成 */
    async create(dto: CreateUserDto): Promise<UserAccount> {
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
    async update(id: string, dto: UpdateUserDto): Promise<UserAccount> {
        const existing = await this.prisma.userAccount.findUnique({
            where: { id: BigInt(id) },
        });
        if (!existing) {
            throw new NotFoundException('ユーザーが見つかりません');
        }
        const data: Partial<UserAccount> = {};
        if (dto.username !== undefined) data.username = dto.username;
        if (dto.password !== undefined) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        if (dto.role !== undefined) data.role = dto.role;
        if (dto.status !== undefined) data.status = dto.status;
        if (dto.isLocked !== undefined) data.isLocked = dto.isLocked;
        if (dto.storeId !== undefined) data.storeId = BigInt(dto.storeId);

        return this.prisma.userAccount.update({
            where: { id: BigInt(id) },
            data,
        });
    }

    /** ユーザーを非アクティブ化（論理削除） */
    async remove(id: string): Promise<UserAccount> {
        const user = await this.prisma.userAccount.findUnique({
            where: { id: BigInt(id) },
        });
        if (!user) {
            throw new NotFoundException('ユーザーが見つかりません');
        }
        return this.prisma.userAccount.update({
            where: { id: BigInt(id) },
            data: { status: UserStatus.INACTIVE },
        });
    }
}
