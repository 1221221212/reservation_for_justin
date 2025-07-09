// backend/src/modules/seat/dto/create-seat.dto.ts
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsInt,
    Min,
    IsOptional,
    IsArray,
    ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';      // ← 追加
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeatDto {
    @ApiProperty({ description: '座席名', example: 'A-1' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;

    @ApiProperty({ description: '最小収容人数', example: 1 })
    @IsInt()
    @Min(1)
    minCapacity!: number;

    @ApiProperty({ description: '最大収容人数', example: 4 })
    @IsInt()
    @Min(1)
    maxCapacity!: number;

    @ApiProperty({
        description: '紐付ける座席属性 ID の配列',
        type: [Number],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)            // ← ここで要素を数値に変換
    @IsInt({ each: true })
    attributeIds?: number[];
}
