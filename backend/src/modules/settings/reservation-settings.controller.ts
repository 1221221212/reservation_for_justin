import { Controller, Get, Put, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ReservationSettingsService } from './reservation-settings.service';
import { UpdateReservationSettingsDto } from './dto/update-reservation-settings.dto';
import { ReservationSettings } from '@prisma/client';

// "次の画面" を表すレスポンスインターフェース
interface NextStepResponse {
    nextStep: 'course' | 'seat' | 'info';
}

@Controller('store/:storeId/settings/reservation')
export class ReservationSettingsController {
    constructor(
        private readonly settingsService: ReservationSettingsService,
    ) { }

    /** GET /store/:storeId/settings/reservation */
    @Get()
    async getSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<ReservationSettings> {
        return this.settingsService.getByStore(BigInt(storeId));
    }

    /** PUT /store/:storeId/settings/reservation */
    @Put()
    async updateSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: UpdateReservationSettingsDto,
    ): Promise<ReservationSettings> {
        return this.settingsService.update(BigInt(storeId), dto);
    }

    /**
     * 次の画面遷移先を返す
     * - allowCourseSelection が true → 'course'
     * - allowSeatSelection が true → 'seat'
     * - 上記どちらも false → 'info'
     */
    @Get('next-step')
    async getNextStep(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<NextStepResponse> {
        const cfg = await this.settingsService.getByStore(BigInt(storeId));
        if (cfg.allowCourseSelection) {
            return { nextStep: 'course' };
        }
        if (cfg.allowSeatSelection) {
            return { nextStep: 'seat' };
        }
        return { nextStep: 'info' };
    }
}