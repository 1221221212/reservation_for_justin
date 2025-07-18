// backend/src/modules/reservation/reservation.module.ts
import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from '@/prisma-client/prisma.service';

@Module({
    controllers: [ReservationController],
    providers: [ReservationService, PrismaService],
    exports: [ReservationService],
})
export class ReservationModule { }
