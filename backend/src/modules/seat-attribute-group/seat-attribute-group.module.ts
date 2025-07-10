// backend/src/modules/seat-attribute-group/seat-attribute-group.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { SeatAttributeModule } from '../seat-attribute/seat-attribute.module';
import { SeatAttributeGroupController } from './seat-attribute-group.controller';
import { SeatAttributeGroupService } from './seat-attribute-group.service';

@Module({
    imports: [PrismaModule, SeatAttributeModule],
    controllers: [SeatAttributeGroupController],
    providers: [SeatAttributeGroupService],
    exports: [SeatAttributeGroupService],
})
export class SeatAttributeGroupModule { }
