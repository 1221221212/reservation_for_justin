// backend/src/modules/auth/dto/user-profile.dto.ts

/**
 * ログイン中のユーザー情報を返却する DTO
 */
export class UserProfileDto {
  /** ユーザーID */
  id!: string;

  /** 表示用ユーザー名 */
  username!: string;

  /** ユーザーのロール ('owner' | 'manager' | 'staff') */
  role!: 'owner' | 'manager' | 'staff';

  /** manager/staff がアクセス可能な店舗 ID のリスト (owner は全店舗許可) */
  allowedStoreIds!: number[];
}
