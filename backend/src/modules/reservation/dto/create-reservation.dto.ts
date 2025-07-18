// backend/src/modules/reservation/dto/create-reservation.dto.ts
import {
    IsNumber,
    IsDateString,
    IsString,
    IsEmail,
    IsOptional,
    IsArray,
    ArrayNotEmpty,
    Matches,
} from 'class-validator';

export class CreateReservationDto {
    @IsNumber()
    storeId!: number;

    @IsDateString()
    date!: string; // YYYY-MM-DD

    @IsNumber()
    partySize!: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    seatIds!: number[];

    @Matches(/^\d{2}:\d{2}$/)
    startTime!: string; // "18:00"

    @Matches(/^\d{2}:\d{2}$/)
    endTime!: string;   // "20:00"

    @IsString()
    customerName!: string;

    @IsEmail()
    customerEmail!: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    customerMemo?: string;

    @IsOptional()
    @IsNumber()
    courseId?: number;
}
