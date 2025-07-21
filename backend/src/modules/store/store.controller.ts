import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { Auth } from '@/common/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    /**
     * 全店舗一覧を取得（パブリックアクセス）
     */
    @Get()
    async findAll() {
        return this.storeService.findAll();
    }

    /**
     * 新規店舗を作成（オーナーのみ）
     */
    @Post()
    @Auth({ roles: [Role.OWNER] })
    async create(@Body() createStoreDto: CreateStoreDto) {
        return this.storeService.create(createStoreDto);
    }

    /**
     * 個別店舗を取得
     */
    @Get(':storeId')
    async findOne(@Param('storeId', ParseIntPipe) storeId: number) {
        return this.storeService.findOne(storeId);
    }
}