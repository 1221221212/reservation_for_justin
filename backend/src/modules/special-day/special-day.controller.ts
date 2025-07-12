// src/modules/special-day.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { SpecialDayService } from './special-day.service';
import { CreateSpecialDayDto } from './dto/create-special-day.dto';

@ApiTags('special-days')
@Controller('store/:storeId/special-days')
export class SpecialDayController {
    constructor(private readonly specialDayService: SpecialDayService) { }

    @Get()
    @Auth({ roles: ['owner', 'manager', 'staff'] })
    @RequireStore()
    async findAll(
        @Param('storeId', ParseIntPipe) storeId: number,
    ) {
        return this.specialDayService.findAll(storeId);
    }

    @Get(':id')
    @Auth({ roles: ['owner', 'manager', 'staff'] })
    @RequireStore()
    async findOne(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.specialDayService.findOne(storeId, id);
    }

    @Post()
    @Auth({ roles: ['owner', 'manager'] })
    @RequireStore()
    async create(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: CreateSpecialDayDto,
    ) {
        return this.specialDayService.create(storeId, dto);
    }

    @Patch(':id')
    @Auth({ roles: ['owner', 'manager'] })
    @RequireStore()
    async update(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateSpecialDayDto,
    ) {
        return this.specialDayService.update(storeId, id, dto);
    }

    @Delete(':id')
    @Auth({ roles: ['owner', 'manager'] })
    @RequireStore()
    async remove(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.specialDayService.remove(storeId, id);
    }
}
