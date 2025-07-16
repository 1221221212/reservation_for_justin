// backend/src/modules/settings/dto/update-reservation-settings.dto.ts

import { IsInt, IsBoolean, IsOptional, IsObject, ValidateNested, IsJSON } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservationSettingsDto {
  @IsInt()
  gridUnit!: number;

  @IsInt()
  standardReservationMinutes!: number;

  @IsObject()
  bookingWindow!: object;  // JSON スキーマはサービス層でチェック

  @IsInt()
  bufferTime!: number;

  @IsBoolean()
  allowCourseSelection!: boolean;

  @IsBoolean()
  allowSeatSelection!: boolean;

  @IsBoolean()
  allowSeatCombination!: boolean;

  @IsOptional()
  @IsInt()
  minCombinationPartySize?: number;

  @IsOptional()
  @IsInt()
  maxCombinationSeats?: number;

  @IsObject()
  cancellationPolicy!: object;

  @IsObject()
  modificationPolicy!: object;
}
