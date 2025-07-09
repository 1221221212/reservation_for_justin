// backend/src/modules/layout/layout.controller.ts
import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { LayoutService } from './layout.service';
import { CreateLayoutDto } from './dto/create-layout.dto';

@Controller('store/:storeId/layouts')
export class LayoutController {
    constructor(private readonly layoutService: LayoutService) { }

    @Get()
    @Auth({ roles: ['owner', 'manager', 'staff'] })
    @RequireStore()
    async findAll(
        @Param('storeId', ParseIntPipe) storeId: number,
    ) {
        return this.layoutService.findAll(storeId);
    }

    @Post()
    @Auth({ roles: ['owner', 'manager'] })
    @RequireStore()
    async create(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() createDto: CreateLayoutDto,
    ) {
        return this.layoutService.create(storeId, createDto);
    }
}
