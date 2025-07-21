// backend/src/modules/seat/seat.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';       // これも不要なら削除
import { Auth } from '@/common/decorators/auth.decorator';
import { RequireStore } from '@/common/decorators/require-store.decorator';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { SuspendSeatDto } from './dto/suspend-seat.dto';

@ApiTags('seats')  // これも不要なら削除できます
@Controller('store/:storeId/seats')
export class SeatController {
    constructor(private readonly seatService: SeatService) { }

    @Get()
    @Auth({ roles: ['OWNER', 'MANAGER', 'STAFF'] })
    @RequireStore()
    async findAll(
        @Param('storeId', ParseIntPipe) storeId: number,
    ) {
        return this.seatService.findAll(storeId);
    }

    @Post()
    @Auth({ roles: ['OWNER', 'MANAGER'] })
    @RequireStore()
    async create(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() createDto: CreateSeatDto,
    ) {
        return this.seatService.create(storeId, createDto);
    }

    @Patch(':seatId/suspend')
    @Auth({ roles: ['OWNER', 'MANAGER'] })
    @RequireStore()
    async suspend(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('seatId', ParseIntPipe) seatId: number,
        @Body() dto: SuspendSeatDto,
    ) {
        return this.seatService.suspendSeat(storeId, seatId, dto);
    }
}
