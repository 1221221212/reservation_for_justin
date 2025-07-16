// backend/src/modules/settings/reservation-settings.controller.ts

import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ReservationSettingsService } from './reservation-settings.service';
import { UpdateReservationSettingsDto } from './dto/update-reservation-settings.dto';
import { ReservationSettings } from '@prisma/client';

@Controller('store/:storeId/settings/reservation')
export class ReservationSettingsController {
    constructor(private readonly service: ReservationSettingsService) { }

    /** GET /v1/store/:storeId/settings/reservation */
    @Get()
    async getSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<ReservationSettings> {
        return this.service.getByStore(BigInt(storeId));
    }

    /** PUT /v1/store/:storeId/settings/reservation */
    @Put()
    async updateSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: UpdateReservationSettingsDto,
    ): Promise<ReservationSettings> {
        return this.service.update(BigInt(storeId), dto);
    }
}
