import { IsString, IsEnum, IsOptional, Length, IsBoolean } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(1, 100)
    username?: string;

    @IsOptional()
    @IsString()
    @Length(6, 128)
    password?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsOptional()
    storeId?: bigint;
}
