import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';

@Module({
    imports: [PrismaModule],
    controllers: [SeatController],
    providers: [SeatService],
    exports: [SeatService],
})
export class SeatModule { }
