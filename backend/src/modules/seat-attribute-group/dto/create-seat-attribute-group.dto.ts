// backend/src/modules/seat-attribute-group/dto/create-seat-attribute-group.dto.ts

import { IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SelectionType } from '@prisma/client';
import { CreateSeatAttributeDto } from '@/modules/seat-attribute/dto/create-seat-attribute.dto';

export class CreateSeatAttributeGroupDto {
    @IsString()
    name!: string;

    @IsEnum(SelectionType)
    selectionType!: SelectionType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSeatAttributeDto)
    attributes!: CreateSeatAttributeDto[];
}
