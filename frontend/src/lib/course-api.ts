// frontend/src/lib/course-api.ts

import api from './api';
import {
    CourseResponseDto,
    CreateCourseDto,
    UpdateCourseDto,
} from '@/types/course';

/** 店舗のコース一覧取得 */
export async function fetchCourses(storeId: number): Promise<CourseResponseDto[]> {
    const res = await api.get<CourseResponseDto[]>(`/stores/${storeId}/courses`);
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
    await api.delete(`/stores/${storeId}/courses/${courseId}`);
}
