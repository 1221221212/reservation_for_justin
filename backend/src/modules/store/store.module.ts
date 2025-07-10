// backend/src/modules/store/store.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [PrismaModule],  // PrismaService を利用
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}