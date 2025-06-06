作成日: 2025-06-06  
バージョン: 0.1
# データ辞書 テンプレート

以下のフォーマットを利用して、データベースのテーブルとカラムを整理してください。

| テーブル名          | カラム名                 | 型               | 制約                  | 意味・備考      |
| -------------- | -------------------- | --------------- | ------------------- | ---------- |
| `stores`       | `id`                 | INT UNSIGNED    | PK, AUTO\_INCREMENT | 店舗ID       |
|                | `name`               | VARCHAR(100)    | NOT NULL            | 店舗名        |
|                | `postal_code`        | VARCHAR(20)     | NOT NULL            | 郵便番号       |
|                | `address_line1`      | VARCHAR(255)    | NOT NULL            | 住所（市区町村以降） |
| `reservations` | `id`                 | BIGINT UNSIGNED | PK, AUTO\_INCREMENT | 予約ID       |
|                | `reservation_number` | VARCHAR(36)     | UNIQUE              | 予約識別用UUID  |
|                | `reservation_date`   | DATE            | NOT NULL            | 予約日        |
|                | `datetime_start`     | DATETIME        | NOT NULL            | 開始日時       |
|                | `status`             | ENUM(...)       | DEFAULT 'pending'   | 予約ステータス    |

※ 実際には全テーブル・全カラム分を埋めてください。
