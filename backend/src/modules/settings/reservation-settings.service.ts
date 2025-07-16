import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { UpdateReservationSettingsDto } from './dto/update-reservation-settings.dto';
import { ReservationSettings } from '@prisma/client';

@Injectable()
export class ReservationSettingsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 店舗に紐づく予約設定を取得（存在しなければデフォルトを作成）
     */
    async getByStore(storeId: bigint): Promise<ReservationSettings> {
        const id = Number(storeId);
        let settings = await this.prisma.reservationSettings.findUnique({
            where: { storeId: id },
        });
        if (!settings) {
            settings = await this.prisma.reservationSettings.create({
                data: { storeId: id },
            });
        }
        return settings;
    }

    /**
     * 店舗に紐づく予約設定を更新または作成
     */
    async update(
        storeId: bigint,
        dto: UpdateReservationSettingsDto,
    ): Promise<ReservationSettings> {
        const id = Number(storeId);
        // upsert で存在なければ作成、あれば更新
        return this.prisma.reservationSettings.upsert({
            where: { storeId: id },
            create: { storeId: id, ...dto },
            update: { ...dto },
        });
    }
}
