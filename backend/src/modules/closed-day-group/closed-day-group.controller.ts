// backend/src/modules/closed-day-group/closed-day-group.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { ClosedDayGroupService } from './closed-day-group.service';
import { CreateClosedDayGroupDto } from './dto/create-closed-day-group.dto';
import { ClosedDayGroupDto } from './dto/closed-day-group.dto';

@ApiTags('closed-day-groups')
@Controller('store/:storeId/closed-day-groups')
export class ClosedDayGroupController {
  constructor(private readonly service: ClosedDayGroupService) {}

  /** 定期休業グループ一覧取得 */
  @Get()
  @Auth({ roles: ['owner', 'manager'] })
  @RequireStore()
  async getAll(
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<ClosedDayGroupDto[]> {
    return this.service.findAll(storeId);
  }

  /** 定期休業グループ＋ルール一括登録 */
  @Post()
  @Auth({ roles: ['owner', 'manager'] })
  @RequireStore()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateClosedDayGroupDto,
  ): Promise<ClosedDayGroupDto> {
    return this.service.create(storeId, dto);
  }
}
