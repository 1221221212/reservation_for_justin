import { Type } from 'class-transformer';
import { IsString, IsEnum, IsNumber, IsOptional, Length, IsBoolean, IsNotEmpty } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    @Length(3, 100)
    userId!: string;

    @IsString()
    @Length(1, 100)
    username!: string;

    @IsString()
    @Length(6, 128)
    password!: string;

    @IsEnum(Role)
    role!: Role;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'storeId は数値で指定してください' })
    storeId?: number;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;
}
