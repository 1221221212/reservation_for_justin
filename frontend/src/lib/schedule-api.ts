// frontend/lib/schedule-api.ts
import api from '@/lib/api';
import type {
    ScheduleGroupDto,
    CreateScheduleGroupDto,
    MonthDetail,
} from '@/types/schedule';

/**
 * 指定店舗のスケジュールグループをまとめて取得
 */
export const fetchScheduleGroups = async (
    storeId: number
): Promise<ScheduleGroupDto[]> => {
    const response = await api.get<ScheduleGroupDto[]>(
        `/store/${storeId}/schedules`
    );
    return response.data;
};

/**
 * グループ単位でスケジュールを登録
 */
export const createScheduleGroup = async (
    storeId: number,
    payload: CreateScheduleGroupDto
): Promise<void> => {
    await api.post(`/store/${storeId}/schedules`, payload);
};

/**
 * 特定のスケジュールグループ詳細を取得
 */
export async function fetchScheduleGroup(
    storeId: number,
    groupId: number
): Promise<ScheduleGroupDto> {
    const res = await api.get<ScheduleGroupDto>(
        `/store/${storeId}/schedules/${groupId}`
    );
    return res.data;
}

/**
 * 月間スケジュール詳細を取得
 */
export async function fetchMonthDetail(
    storeId: number,
    year: number,
    month: number
): Promise<MonthDetail[]> {
    // バックは { data: MonthDetail[] } で返却している想定
    const res = await api.get<{ data: MonthDetail[] }>(
        `/store/${storeId}/schedules/month-detail`,
        {
            params: { year, month },
        }
    );
    return res.data.data;
}
