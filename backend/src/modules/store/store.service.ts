// backend/src/modules/store/store.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
    constructor(private readonly prisma: PrismaService) { }

    /** 全店舗一覧取得 */
    async findAll() {
        return this.prisma.store.findMany();
    }

    /** 新規店舗作成 */
    async create(createStoreDto: CreateStoreDto) {
        return this.prisma.store.create({
            data: createStoreDto,
        });
    }

    /** 店舗詳細取得 */
    async findOne(storeId: number) {
        const store = await this.prisma.store.findUnique({
            where: { id: BigInt(storeId) },
        });

        if (!store) {
            throw new NotFoundException(`店舗が見つかりません（ID: ${storeId}）`);
        }

        return store;
    }
}
