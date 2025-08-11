import { ApiProperty } from '@nestjs/swagger';

export class SeatAvailabilityAttributeDto {
    @ApiProperty({ description: '属性ID', example: 20 })
    id!: number;

    @ApiProperty({ description: '属性名', example: 'テーブル' })
    name!: string;
}

export class SeatAvailabilityAttributeGroupDto {
    @ApiProperty({ description: '属性グループID', example: 2 })
    groupId!: number;

    @ApiProperty({ description: '属性グループ名', example: '席タイプ' })
    groupName!: string;

    @ApiProperty({
        description: 'このグループに属する選択可能属性の一覧',
        type: [SeatAvailabilityAttributeDto],
    })
    attributes!: SeatAvailabilityAttributeDto[];
}

export class SeatAvailabilityResponseDto {
    @ApiProperty({
        description: '条件を満たす可用席ID一覧（昇順推奨）',
        type: [Number],
        example: [12, 15, 18],
    })
    seatIds!: number[];

    @ApiProperty({
        description: '現条件下で選択可能な属性グループ一覧（未選択属性は返さない）',
        type: [SeatAvailabilityAttributeGroupDto],
    })
    attributeGroups!: SeatAvailabilityAttributeGroupDto[];
}
