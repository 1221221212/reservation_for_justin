import api from '@/lib/api';

export interface SpecialDay { /* SpecialDayDto に沿った型 */ }
export interface CreateSpecialDay { /* CreateSpecialDayDto に沿った型 */ }

export const fetchSpecialDays = (storeId: number) =>
    api.get<SpecialDay[]>(`/store/${storeId}/special-days`);
export const fetchSpecialDay = (storeId: number, id: number) =>
    api.get<SpecialDay>(`/store/${storeId}/special-days/${id}`);
export const createSpecialDay = (storeId: number, data: CreateSpecialDay) =>
    api.post<SpecialDay>(`/store/${storeId}/special-days`, data);
export const updateSpecialDay = (storeId: number, id: number, data: CreateSpecialDay) =>
    api.put<SpecialDay>(`/store/${storeId}/special-days/${id}`, data);
export const deleteSpecialDay = (storeId: number, id: number) =>
    api.delete<void>(`/store/${storeId}/special-days/${id}`);
