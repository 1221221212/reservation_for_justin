import { ApiProperty } from '@nestjs/swagger';

/**
 * 指定日時に利用可能な単一コース情報を表す DTO
 */
export class AvailableCourseDto {
    @ApiProperty({ description: 'コースID', example: 1 })
    courseId!: number;

    @ApiProperty({ description: 'コース名', example: 'ディナーコース' })
    name!: string;

    @ApiProperty({ description: '所要時間（分）', example: 120 })
    durationMinutes!: number;

    @ApiProperty({ description: '価格', example: 5000, required: false })
    price?: number;

    @ApiProperty({ description: '最小人数', example: 1, required: false })
    minPeople?: number;

    @ApiProperty({ description: '最大人数', example: 4, required: false })
    maxPeople?: number;

    @ApiProperty({ description: '当該日時から開始可能か' })
    startable!: boolean;

    @ApiProperty({ description: '当該日時を含む利用可能終了時刻 (HH:mm:ss)', example: '20:00:00' })
    endTime!: string;
}

/**
 * 指定日時で利用可能なコース一覧レスポンス DTO
 */
export class AvailableCoursesResponseDto {
    @ApiProperty({ description: '対象日 (YYYY-MM-DD)', example: '2025-08-15' })
    date!: string;

    @ApiProperty({ description: '対象時刻 (HH:mm)', example: '19:30' })
    time!: string;

    @ApiProperty({ description: '利用可能なコース一覧', type: [AvailableCourseDto] })
    courses!: AvailableCourseDto[];
}
