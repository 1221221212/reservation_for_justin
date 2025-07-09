// frontend/src/types/seat.ts

/**
 * 座席に紐づく属性情報
 */
export interface SeatAttributeInfo {
  groupId: number;
  groupName: string;
  attributeId: number;
  attributeName: string;
}

/**
 * 座席一覧取得時のレスポンスタイプ
 */
export interface SeatWithAttributes {
  id: number;
  name: string;
  minCapacity: number;
  maxCapacity: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  attributes: SeatAttributeInfo[];
}

/**
 * 座席作成時のリクエストパラメータ
 */
export interface CreateSeatParams {
  /** 座席名 */
  name: string;
  /** 最小収容人数 */
  minCapacity: number;
  /** 最大収容人数 */
  maxCapacity: number;
  /** 紐付ける属性 ID の配列（任意） */
  attributeIds?: number[];
}
