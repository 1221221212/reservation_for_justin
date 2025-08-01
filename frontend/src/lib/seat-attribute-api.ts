// frontend/lib/seat-attribute-api.ts

import api from './api';
import type {
    AttributeGroup,
    CreateAttributeGroupParams,
    CreateAttributeParams,
    Attribute
} from '@/types/attribute';

/**
 * 指定店舗の座席属性グループ一覧を取得します
 * @param storeId - 店舗ID
 */
export const fetchAttributeGroups = (storeId: number) =>
    api.get<AttributeGroup[]>(`/store/${storeId}/seat-attribute`);

/**
 * 新しい属性グループを作成します
 * @param storeId - 店舗ID
 * @param params - グループ作成用パラメータ
 */
export const createAttributeGroup = (
    storeId: number,
    params: CreateAttributeGroupParams
) => api.post<AttributeGroup>(`/store/${storeId}/seat-attribute`, params);

/**
 * 属性グループを削除します
 * @param storeId - 店舗ID
 * @param groupId - 属性グループID
 */
export const deleteAttributeGroup = (
    storeId: number,
    groupId: number
) => api.delete<void>(`/store/${storeId}/seat-attribute/${groupId}`);

/**
 * 属性を指定グループに追加します
 * @param storeId - 店舗ID
 * @param groupId - 属性グループID
 * @param params - 属性作成用パラメータ
 */
export const addAttribute = (
    storeId: number,
    groupId: number,
    params: CreateAttributeParams
) => api.post<Attribute>(
    `/store/${storeId}/seat-attribute/${groupId}/attributes`,
    params
);

/**
 * 属性を削除します
 * @param storeId - 店舗ID
 * @param groupId - 属性グループID
 * @param attributeId - 属性ID
 */
export const deleteAttribute = (
    storeId: number,
    groupId: number,
    attributeId: number
) => api.delete<void>(
    `/store/${storeId}/seat-attribute/${groupId}/attributes/${attributeId}`
);
