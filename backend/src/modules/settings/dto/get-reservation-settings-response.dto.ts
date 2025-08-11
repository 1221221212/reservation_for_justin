// src/modules/settings/dto/get-next-step-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

/**
 * フロント用：次の画面判定フラグ DTO
 */
export class GetNextStepResponseDto {
    @ApiProperty({ description: 'コース選択を許可するか', example: true })
    allowCourseSelection!: boolean;

    @ApiProperty({ description: '席選択を許可するか', example: true })
    allowSeatSelection!: boolean;
}
