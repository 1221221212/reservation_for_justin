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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { ScheduleService } from './​schedule.service';
import { CreateScheduleGroupDto } from './dto/​create-schedule-group.dto';
import { ScheduleGroupDto } from './dto/​schedule-group.dto';

@ApiTags('schedules')
@Controller('store/:storeId/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @Auth({ roles: ['owner', 'manager', 'staff'] })
  @RequireStore()
  async getAll(
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<ScheduleGroupDto[]> {
    return this.scheduleService.findAll(storeId);
  }

  @Get(':groupId')
  @Auth({ roles: ['owner', 'manager', 'staff'] })
  @RequireStore()
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.scheduleService.findOne(storeId, groupId);
  }

  @Post()
  @Auth({ roles: ['owner', 'manager'] })
  @RequireStore()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateScheduleGroupDto,
  ): Promise<void> {
    await this.scheduleService.create(storeId, dto);
  }
}