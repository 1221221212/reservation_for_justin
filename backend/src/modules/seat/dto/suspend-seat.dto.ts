// backend/src/modules/seat/dto/suspend-seat.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspendSeatDto {
    @ApiProperty({
        description: '座席停止の理由（任意）',
        example: '清掃中のため',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    reason?: string;
}
