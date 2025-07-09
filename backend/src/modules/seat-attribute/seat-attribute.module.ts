// backend/src/modules/seat-attribute/seat-attribute.module.ts

import { Module } from '@nestjs/common';
import { SeatAttributeService } from './seat-attribute.service';

@Module({
  providers: [SeatAttributeService],
  exports: [SeatAttributeService],
})
export class SeatAttributeModule {}
