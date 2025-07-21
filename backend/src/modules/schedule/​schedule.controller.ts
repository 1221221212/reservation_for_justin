// backend/src/modules/schedule/schedule.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { ScheduleService } from './​schedule.service';
import { MonthScheduleService } from './month-schedule.service';
import { CreateScheduleGroupDto } from './dto/​create-schedule-group.dto';
import { ScheduleGroupDto } from './dto/​schedule-group.dto';

@ApiTags('schedules')
@Controller('store/:storeId/schedules')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly monthService: MonthScheduleService,
  ) { }

  @Get('month-detail')              // ← ここを先頭に移動
  @Auth({ roles: ['OWNER', 'MANAGER'] })
  @RequireStore()
  async getMonthDetail(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    const data = await this.monthService.getMonthDetail(storeId, year, month - 1);
    return { data };
  }

  @Get()
  @Auth({ roles: ['OWNER', 'MANAGER'] })
  @RequireStore()
  async getAll(
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<ScheduleGroupDto[]> {
    return this.scheduleService.findAll(storeId);
  }

  @Get(':groupId')                  // ← こちらは後ろへ
  @Auth({ roles: ['OWNER', 'MANAGER'] })
  @RequireStore()
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.scheduleService.findOne(storeId, groupId);
  }

  @Post()
  @Auth({ roles: ['OWNER', 'MANAGER'] })
  @RequireStore()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateScheduleGroupDto,
  ): Promise<void> {
    await this.scheduleService.create(storeId, dto);
  }
}