// frontend/src/lib/course-api.ts

import api from './api';
import {
    CourseResponseDto,
    CreateCourseDto,
    UpdateCourseDto,
    CourseMonthlyAvailabilityResponseDto,
    AvailableCoursesResponseDto,
} from '@/types/course';
import {
    CreateSpecialCourseScheduleGroupParams,
    SpecialCourseScheduleGroupDto,
} from '@/types/course-special-schedule';

/** 店舗のコース一覧取得 */
export async function fetchCourses(
    storeId: number
): Promise<CourseResponseDto[]> {
    const res = await api.get<CourseResponseDto[]>(
        `/stores/${storeId}/courses`
    );
    return res.data;
}

/** 単一コース詳細取得 */
export async function fetchCourse(
    storeId: number,
    courseId: number
): Promise<CourseResponseDto> {
    const res = await api.get<CourseResponseDto>(
        `/stores/${storeId}/courses/${courseId}`
    );
    return res.data;
}

/** 新規コース作成 */
export async function createCourse(
    storeId: number,
    dto: CreateCourseDto
): Promise<CourseResponseDto> {
    const res = await api.post<CourseResponseDto>(
        `/stores/${storeId}/courses`,
        dto
    );
    return res.data;
}

/** コース部分更新 */
export async function updateCourse(
    storeId: number,
    courseId: number,
    dto: UpdateCourseDto
): Promise<CourseResponseDto> {
    const res = await api.patch<CourseResponseDto>(
        `/stores/${storeId}/courses/${courseId}`,
        dto
    );
    return res.data;
}

/** コース論理削除（非公開化） */
export async function deleteCourse(
    storeId: number,
    courseId: number
): Promise<void> {
    await api.delete(
        `/stores/${storeId}/courses/${courseId}`
    );
}

/** 月次可用性取得 */
export async function fetchCourseMonthlyAvailability(
    storeId: number,
    courseId: number,
    year: number,
    month: number
): Promise<CourseMonthlyAvailabilityResponseDto> {
    const res = await api.get<
        CourseMonthlyAvailabilityResponseDto
    >(
        `/stores/${storeId}/courses/${courseId}/availability/monthly?year=${year}&month=${month}`
    );
    return res.data;
}

/** 指定日時で利用可能なコース一覧取得 */
export const fetchAvailableCourses = (
    storeId: number,
    date: string,
    time: string,
    partySize: number,
) =>
    api.get<AvailableCoursesResponseDto>(
        `/stores/${storeId}/courses/availability` +
        `?date=${date}` +
        `&time=${time}` +
        `&count=${partySize}`
    );

/** 特別日スケジュールグループ作成 */
export async function createSpecialCourseScheduleGroup(
    storeId: number,
    courseId: number,
    dto: CreateSpecialCourseScheduleGroupParams
): Promise<void> {
    await api.post(
        `/stores/${storeId}/courses/${courseId}/special`,
        dto
    );
}

/** 特別日スケジュールグループ削除 */
export async function deleteSpecialCourseScheduleGroup(
    storeId: number,
    courseId: number,
    date: string
): Promise<void> {
    await api.delete(
        `/stores/${storeId}/courses/${courseId}/special?date=${date}`
    );
}
