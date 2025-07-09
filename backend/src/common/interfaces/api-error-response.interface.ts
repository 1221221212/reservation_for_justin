/**
 * 全 API で共通のエラー応答フォーマット
 */
export interface ApiErrorResponse {
  /** HTTP ステータスコード */
  statusCode: number;
  /** ユーザー向けメインメッセージ */
  message: string;
  /** 入力バリデーション等の詳細エラーリスト（任意） */
  errors?: Array<{
    /** 該当フィールド名 */
    field: string;
    /** そのフィールドで起きたエラー内容 */
    message: string;
  }>;
  /** フロント／バック両方で分岐に使えるエラーコード（任意） */
  code?: string;
}
