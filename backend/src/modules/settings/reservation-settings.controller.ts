import {
    Controller,
    Get,
    Put,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { ReservationSettings } from '@prisma/client';
import { ReservationSettingsService } from './reservation-settings.service';
import { UpdateReservationSettingsDto } from './dto/update-reservation-settings.dto';
import { GetNextStepResponseDto } from './dto/get-reservation-settings-response.dto';

@ApiTags('reservation-settings')
@Controller('store/:storeId/settings/reservation')
export class ReservationSettingsController {
    constructor(
        private readonly settingsService: ReservationSettingsService,
    ) { }

    /** 内部用：全設定をそのまま返却 */
    @Get()
    async getSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<ReservationSettings> {
        return this.settingsService.getByStore(BigInt(storeId));
    }

    /** 内部用：設定更新 */
    @Put()
    async updateSettings(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: UpdateReservationSettingsDto,
    ): Promise<ReservationSettings> {
        return this.settingsService.update(BigInt(storeId), dto);
    }

    /**
     * GET /store/:storeId/settings/reservation/next-step
     * フロント用：次の画面判定フラグを返却
     */
    @Get('next-step')
    @ApiOperation({ summary: '次の画面判定フラグの取得' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'コース／席選択可否フラグ',
        type: GetNextStepResponseDto,
    })
    async getNextStepFlags(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<GetNextStepResponseDto> {
        const settings = await this.settingsService.getByStore(BigInt(storeId));
        return {
            allowCourseSelection: settings.allowCourseSelection,
            allowSeatSelection: settings.allowSeatSelection,
        };
    }
}
