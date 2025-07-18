// backend/src/modules/reservation/reservation.controller.ts
import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('v1/reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    /** 新規予約作成 */
    @Post()
    async create(@Body() dto: CreateReservationDto) {
        const result = await this.reservationService.create(dto);
        return { reservationCode: result.reservationCode };
    }

    /** 月単位予約取得 */
    @Get()
    async findMonthly(
        @Query('storeId', ParseIntPipe) storeId: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month1to12: number,
    ) {
        return this.reservationService.findMonthly(storeId, year, month1to12);
    }

    /** 予約詳細取得 */
    @Get(':code')
    async findOne(@Param('code') code: string) {
        return this.reservationService.findByCode(code);
    }
}
