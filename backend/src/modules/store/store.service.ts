import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';

const prisma = new PrismaClient();

@Injectable()
export class StoreService {
    async findAll() {
        return prisma.store.findMany();
    }

    async create(createStoreDto: CreateStoreDto) {
        return prisma.store.create({
            data: createStoreDto,
        });
    }

    async findOne(storeId: number) {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            throw new NotFoundException(`店舗が見つかりません（ID: ${storeId}）`);
        }

        return store;
    }
}
