// backend/src/modules/seat-attribute-group/seat-attribute-group.module.ts

import { Module } from '@nestjs/common';
import { SeatAttributeGroupController } from './seat-attribute-group.controller';
import { SeatAttributeGroupService } from './seat-attribute-group.service';
import { SeatAttributeModule } from '../seat-attribute/seat-attribute.module';

@Module({
    imports: [SeatAttributeModule],
    controllers: [SeatAttributeGroupController],
    providers: [SeatAttributeGroupService],
})
export class SeatAttributeGroupModule { }
