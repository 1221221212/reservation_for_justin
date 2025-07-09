# データベース要件定義書

## テーブル名（例：reservations）

### 1. 概要
- 顧客の予約情報を保持するテーブル

### 2. カラム定義
| カラム名          | データ型             | PK | FK               | NULL | デフォルト                       | 説明                     |
|-------------------|---------------------|----|------------------|------|----------------------------------|--------------------------|
| id                | BIGINT(20)          | ◯  |                  | NO   | AUTO_INCREMENT                   | 予約ID                   |
| store_id          | INT(11)             |    | → stores.id      | NO   |                                  | 店舗ID                   |
| reservation_date  | DATETIME            |    |                  | NO   |                                  | 来店日時                 |
| number_of_guests  | INT(11)             |    |                  | NO   |                                  | 来店人数                 |
| course_id         | INT(11)             |    | → courses.id     | YES  | NULL                             | コースID（NULL許可）     |
| customer_name     | VARCHAR(50)         |    |                  | NO   |                                  | 顧客氏名                 |
| customer_email    | VARCHAR(100)        |    |                  | NO   |                                  | 顧客メールアドレス       |
| customer_phone    | VARCHAR(15)         |    |                  | YES  | NULL                             | 顧客電話番号             |
| status            | ENUM('CONFIRMED','CANCELLED','NOSHOW') |    |   | NO   | 'CONFIRMED'                     | 予約ステータス           |
| reservation_token | VARCHAR(100)        |    |                  | NO   | (ユニークトークンを自動生成)     | キャンセル用トークン     |
| created_at        | DATETIME            |    |                  | NO   | CURRENT_TIMESTAMP               | 作成日時                 |
| updated_at        | DATETIME            |    |                  | NO   | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新日時 |
| cancelled_at      | DATETIME            |    |                  | YES  | NULL                             | キャンセル日時           |

### 3. インデックス
- `idx_reservations_store_date` ON (`store_id`, `reservation_date`)  
- `uniq_reservation_token` UNIQUE (`reservation_token`)

### 4. リレーション
- `reservations.store_id` → `stores.id`  
- `reservations.course_id` → `courses.id`

### 5. 備考
- `reservation_token` は UUID4 形式で生成  
- `status` は ENUM 型を採用  
