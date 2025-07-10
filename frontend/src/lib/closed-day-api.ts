import api from './api';
import type {
    ClosedDayGroupDto,
    CreateClosedDayGroupDto,
} from '@/types/closed-day';

/**
 * 指定店舗の定期休業グループをまとめて取得
 * @param storeId 店舗ID
 * @returns ClosedDayGroupDto の配列
 */
export const fetchClosedDayGroups = async (
    storeId: number
): Promise<ClosedDayGroupDto[]> => {
    const res = await api.get<ClosedDayGroupDto[]>(
        `/store/${storeId}/closed-day-groups`
    );
    return res.data;
};

/**
 * 定期休業グループ＋ルールを一括登録
 * @param storeId 店舗ID
 * @param payload CreateClosedDayGroupDto
 * @returns 登録した ClosedDayGroupDto
 */
export const createClosedDayGroup = async (
    storeId: number,
    payload: CreateClosedDayGroupDto
): Promise<ClosedDayGroupDto> => {
    const res = await api.post<ClosedDayGroupDto>(
        `/store/${storeId}/closed-day-groups`,
        payload
    );
    return res.data;
};
