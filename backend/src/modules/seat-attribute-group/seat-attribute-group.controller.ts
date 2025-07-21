// backend/src/modules/seat-attribute-group/seat-attribute-group.controller.ts

import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { Role } from '@prisma/client';
import { SeatAttributeGroupService } from './seat-attribute-group.service';
import { SeatAttributeService } from '../seat-attribute/seat-attribute.service';
import { CreateSeatAttributeGroupDto } from './dto/create-seat-attribute-group.dto';
import { CreateSeatAttributeDto } from '../seat-attribute/dto/create-seat-attribute.dto';

@Controller('store/:storeId/seat-attribute')
export class SeatAttributeGroupController {
    constructor(
        private readonly groupService: SeatAttributeGroupService,
        private readonly attributeService: SeatAttributeService,
    ) { }

    /** 全グループ＋属性一覧取得 */
    @Get()
    @Auth({ roles: [Role.OWNER, Role.MANAGER, Role.STAFF] })
    @RequireStore()
    async findAll(
        @Param('storeId', ParseIntPipe) storeId: number
    ) {
        return this.groupService.findAll(storeId);
    }

    /** グループ＋属性一括作成 */
    @Post()
    @Auth({ roles: [Role.OWNER, Role.MANAGER] })
    @RequireStore()
    async createGroup(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: CreateSeatAttributeGroupDto
    ) {
        return this.groupService.create(storeId, dto);
    }

    /** グループ＋属性論理削除 */
    @Delete(':groupId')
    @Auth({ roles: [Role.OWNER, Role.MANAGER] })
    @RequireStore()
    async removeGroup(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('groupId', ParseIntPipe) groupId: number
    ) {
        return this.groupService.remove(storeId, groupId);
    }

    /** 既存グループに属性追加 */
    @Post(':groupId/attributes')
    @Auth({ roles: [Role.OWNER, Role.MANAGER] })
    @RequireStore()
    async addAttribute(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('groupId', ParseIntPipe) groupId: number,
        @Body() dto: CreateSeatAttributeDto
    ) {
        return this.attributeService.create(storeId, groupId, dto);
    }

    /** グループ内の特定属性論理削除 */
    @Delete(':groupId/attributes/:attributeId')
    @Auth({ roles: [Role.OWNER, Role.MANAGER] })
    @RequireStore()
    async removeAttribute(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('groupId', ParseIntPipe) groupId: number,
        @Param('attributeId', ParseIntPipe) attributeId: number
    ) {
        return this.attributeService.remove(storeId, groupId, attributeId);
    }
}
