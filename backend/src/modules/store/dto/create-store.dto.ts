import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ description: '店舗名', example: 'My Store' })
  @IsString()
  @Length(1, 100)
  name!: string;
}
