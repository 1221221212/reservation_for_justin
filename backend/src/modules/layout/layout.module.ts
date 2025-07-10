// backend/src/modules/layout/layout.module.ts
import { Module } from '@nestjs/common';
import { LayoutService } from './layout.service';
import { LayoutController } from './layout.controller';
import { PrismaModule } from '@/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LayoutController],
  providers: [LayoutService],
  exports: [LayoutService],
})
export class LayoutModule {}