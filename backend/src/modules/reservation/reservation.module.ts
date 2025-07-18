// backend/src/modules/reservation/reservation.module.ts
import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { PrismaService } from '@/prisma-client/prisma.service';
import { RedisService } from '@/common/services/redis.service';

@Module({
    imports: [],
    providers: [
        ReservationService,
        PrismaService,
        RedisService,          // ← ここを追加
    ],
    controllers: [ReservationController],
})
export class ReservationModule { }
