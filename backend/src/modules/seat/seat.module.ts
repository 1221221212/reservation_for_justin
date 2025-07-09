// backend/src/modules/seat/seat.module.ts
import { Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';

@Module({
    imports: [],
    controllers: [SeatController],
    providers: [SeatService],
    exports: [SeatService],
})
export class SeatModule { }
