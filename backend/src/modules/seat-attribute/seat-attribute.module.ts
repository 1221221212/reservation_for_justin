// backend/src/modules/seat-attribute/seat-attribute.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { SeatAttributeService } from './seat-attribute.service';

@Module({
  imports: [PrismaModule],  // PrismaService を DI で共有
  providers: [SeatAttributeService],
  exports: [SeatAttributeService],
})
export class SeatAttributeModule {}