// backend/src/modules/seat-attribute/dto/create-seat-attribute.dto.ts

import { IsString } from 'class-validator';

export class CreateSeatAttributeDto {
  @IsString()
  name!: string;
}
