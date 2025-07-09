// backend/src/modules/layout/dto/create-layout.dto.ts
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsArray,
    ArrayNotEmpty,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLayoutDto {
    @ApiProperty({ description: 'レイアウト名', example: '1階ホール', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiProperty({
        description: '紐付ける座席IDの配列（1つ以上必須）',
        type: [Number],
    })
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({ each: true })
    seatIds!: number[];
}