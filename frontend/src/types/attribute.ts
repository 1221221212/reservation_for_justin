// frontend/src/types/attribute.ts

/** 属性の型定義 */
export interface Attribute {
    id: number;
    name: string;
    status: string;
}

/** 属性グループの型定義 */
export interface AttributeGroup {
    id: number;
    name: string;
    selectionType: 'single' | 'multiple';
    status: string;
    attributes: Attribute[];
}

/** 新規属性グループ作成用パラメータ */
export interface CreateAttributeGroupParams {
    name: string;
    selectionType: 'single' | 'multiple';
    attributes: { name: string }[];
}

/** 新規属性作成用パラメータ */
export interface CreateAttributeParams {
    name: string;
}
