以下、# データベーススキーマ一覧 の全文を漏れなくインラインで記載します。テーブル名・カラム名はすべてスネークケース、MySQL（Xserver想定）の型で統一しています。

---

# データベーススキーマ一覧

以下は設計済みのテーブルとカラム一覧です。テーブル名・カラム名はすべてスネークケースで統一しています。

---

## seat\_attribute\_group

| カラム名         | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------ | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`         | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`   | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`       | VARCHAR(100)              | NO     |                     | —                                               |
| `status`     | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## seat\_attribute

| カラム名         | 型                         | NULL許容 | キー                              | デフォルト                                           |
| ------------ | ------------------------- | ------ | ------------------------------- | ----------------------------------------------- |
| `id`         | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT             | —                                               |
| `store_id`   | BIGINT UNSIGNED           | NO     | FK → store(id)                  | —                                               |
| `group_id`   | BIGINT UNSIGNED           | NO     | FK → seat\_attribute\_group(id) | —                                               |
| `name`       | VARCHAR(100)              | NO     |                                 | —                                               |
| `status`     | ENUM('active','inactive') | NO     |                                 | 'active'                                        |
| `created_at` | DATETIME                  | NO     |                                 | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME                  | NO     |                                 | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## seat

| カラム名           | 型                         | NULL許容 | キー                  | デフォルト                                           |
| -------------- | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`           | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`     | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`         | VARCHAR(50)               | NO     |                     | —                                               |
| `min_capacity` | INT UNSIGNED              | NO     |                     | 1                                               |
| `max_capacity` | INT UNSIGNED              | NO     |                     | 1                                               |
| `status`       | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at`   | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at`   | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## seat\_seat\_attribute

| カラム名           | 型               | NULL許容 | キー                           | デフォルト                                           |
| -------------- | --------------- | ------ | ---------------------------- | ----------------------------------------------- |
| `seat_id`      | BIGINT UNSIGNED | NO     | PK, FK → seat(id)            | —                                               |
| `attribute_id` | BIGINT UNSIGNED | NO     | PK, FK → seat\_attribute(id) | —                                               |
| `created_at`   | DATETIME        | NO     |                              | CURRENT\_TIMESTAMP                              |
| `updated_at`   | DATETIME        | NO     |                              | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## layout

| カラム名         | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------ | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`         | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`   | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`       | VARCHAR(100)              | NO     |                     | —                                               |
| `status`     | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## layout\_seat

| カラム名         | 型               | NULL許容 | キー                  | デフォルト                                           |
| ------------ | --------------- | ------ | ------------------- | ----------------------------------------------- |
| `layout_id`  | BIGINT UNSIGNED | NO     | PK, FK → layout(id) | —                                               |
| `seat_id`    | BIGINT UNSIGNED | NO     | PK, FK → seat(id)   | —                                               |
| `created_at` | DATETIME        | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME        | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## layout\_schedule\_group

| カラム名             | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ---------------- | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`             | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`       | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`           | VARCHAR(100)              | NO     |                     | —                                               |
| `status`         | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `effective_from` | DATE                      | NO     |                     | —                                               |
| `created_at`     | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at`     | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## layout\_schedule

| カラム名          | 型                         | NULL許容 | キー                               | デフォルト                                           |
| ------------- | ------------------------- | ------ | -------------------------------- | ----------------------------------------------- |
| `layout_id`   | BIGINT UNSIGNED           | NO     | PK, FK → layout(id)              | —                                               |
| `group_id`    | BIGINT UNSIGNED           | NO     | FK → layout\_schedule\_group(id) | —                                               |
| `day_of_week` | TINYINT UNSIGNED          | NO     | PK                               | —                                               |
| `start_time`  | TIME                      | NO     | PK                               | —                                               |
| `end_time`    | TIME                      | YES    |                                  | —                                               |
| `status`      | ENUM('active','inactive') | NO     |                                  | 'active'                                        |
| `created_at`  | DATETIME                  | NO     |                                  | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME                  | NO     |                                  | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## closed\_day\_group

| カラム名             | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ---------------- | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`             | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`       | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`           | VARCHAR(100)              | NO     |                     | —                                               |
| `status`         | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `effective_from` | DATE                      | NO     |                     | —                                               |
| `created_at`     | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at`     | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## closed\_day

| カラム名           | 型                                                                      | NULL許容 | キー                          | デフォルト                                           |
| -------------- | ---------------------------------------------------------------------- | ------ | --------------------------- | ----------------------------------------------- |
| `id`           | BIGINT UNSIGNED                                                        | NO     | PK, AUTO\_INCREMENT         | —                                               |
| `store_id`     | BIGINT UNSIGNED                                                        | NO     | FK → closed\_day\_group(id) | —                                               |
| `type`         | ENUM('none','weekly','monthly\_date','monthly\_nth\_weekday','yearly') | NO     |                             | —                                               |
| `weekday`      | TINYINT UNSIGNED                                                       | YES    |                             | NULL                                            |
| `day_of_month` | TINYINT UNSIGNED                                                       | YES    |                             | NULL                                            |
| `nth_week`     | TINYINT UNSIGNED                                                       | YES    |                             | NULL                                            |
| `month`        | TINYINT UNSIGNED                                                       | YES    |                             | NULL                                            |
| `day`          | TINYINT UNSIGNED                                                       | YES    |                             | NULL                                            |
| `status`       | ENUM('active','inactive')                                              | NO     |                             | 'active'                                        |
| `group_id`     | BIGINT UNSIGNED                                                        | NO     | FK → closed\_day\_group(id) | —                                               |
| `created_at`   | DATETIME                                                               | NO     |                             | CURRENT\_TIMESTAMP                              |
| `updated_at`   | DATETIME                                                               | NO     |                             | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## special\_date

| カラム名          | 型                         | NULL許容 | キー                     | デフォルト                                           |
| ------------- | ------------------------- | ------ | ---------------------- | ----------------------------------------------- |
| `id`          | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT    | —                                               |
| `layout_id`   | BIGINT UNSIGNED           | NO     | FK → layout(id), INDEX | —                                               |
| `date`        | DATE                      | NO     | INDEX                  | —                                               |
| `start_time`  | TIME                      | NO     |                        | —                                               |
| `end_time`    | TIME                      | NO     |                        | —                                               |
| `type`        | ENUM('closure','opening') | NO     |                        | —                                               |
| `batch_key`   | CHAR(36)                  | YES    | INDEX                  | NULL                                            |
| `description` | VARCHAR(255)              | YES    |                        | NULL                                            |
| `created_at`  | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## course

| カラム名               | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------------ | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`               | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`         | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`             | VARCHAR(100)              | NO     |                     | —                                               |
| `price`            | DECIMAL(10,2)             | NO     |                     | —                                               |
| `min_people`       | INT UNSIGNED              | NO     |                     | 1                                               |
| `max_people`       | INT UNSIGNED              | NO     |                     | 1                                               |
| `duration_minutes` | INT UNSIGNED              | NO     |                     | —                                               |
| `description`      | TEXT                      | YES    |                     | NULL                                            |
| `status`           | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at`       | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at`       | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## material

| カラム名         | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------ | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`         | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `store_id`   | BIGINT UNSIGNED           | NO     | FK → store(id)      | —                                               |
| `name`       | VARCHAR(100)              | NO     |                     | —                                               |
| `unit`       | VARCHAR(50)               | NO     |                     | —                                               |
| `status`     | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## course\_material

| カラム名          | 型               | NULL許容 | キー                    | デフォルト                                           |
| ------------- | --------------- | ------ | --------------------- | ----------------------------------------------- |
| `course_id`   | BIGINT UNSIGNED | NO     | PK, FK → course(id)   | —                                               |
| `material_id` | BIGINT UNSIGNED | NO     | PK, FK → material(id) | —                                               |
| `quantity`    | DECIMAL(10,2)   | NO     |                       | —                                               |
| `created_at`  | DATETIME        | NO     |                       | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME        | NO     |                       | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## course\_assignment

| カラム名             | 型                         | NULL許容 | キー                     | デフォルト                                           |
| ---------------- | ------------------------- | ------ | ---------------------- | ----------------------------------------------- |
| `id`             | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT    | —                                               |
| `course_id`      | BIGINT UNSIGNED           | NO     | FK → course(id), INDEX | —                                               |
| `day_of_week`    | TINYINT UNSIGNED          | NO     |                        | —                                               |
| `start_time`     | TIME                      | NO     |                        | —                                               |
| `end_time`       | TIME                      | NO     |                        | —                                               |
| `effective_from` | DATE                      | YES    |                        | NULL                                            |
| `effective_to`   | DATE                      | YES    |                        | NULL                                            |
| `status`         | ENUM('active','inactive') | NO     |                        | 'active'                                        |
| `created_at`     | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP                              |
| `updated_at`     | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## special\_course\_assignment

| カラム名          | 型                         | NULL許容 | キー                     | デフォルト                                           |
| ------------- | ------------------------- | ------ | ---------------------- | ----------------------------------------------- |
| `id`          | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT    | —                                               |
| `course_id`   | BIGINT UNSIGNED           | NO     | FK → course(id), INDEX | —                                               |
| `date`        | DATE                      | NO     | INDEX                  | —                                               |
| `start_time`  | TIME                      | NO     |                        | —                                               |
| `end_time`    | TIME                      | NO     |                        | —                                               |
| `type`        | ENUM('closure','opening') | NO     |                        | 'closure'                                       |
| `status`      | ENUM('active','inactive') | NO     |                        | 'active'                                        |
| `description` | VARCHAR(255)              | YES    |                        | NULL                                            |
| `created_at`  | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME                  | NO     |                        | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## store

| カラム名         | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------ | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`         | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `name`       | VARCHAR(255)              | NO     |                     | —                                               |
| `status`     | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at` | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## store\_info

| カラム名          | 型               | NULL許容 | キー                 | デフォルト                                           |
| ------------- | --------------- | ------ | ------------------ | ----------------------------------------------- |
| `store_id`    | BIGINT UNSIGNED | NO     | PK, FK → store(id) | —                                               |
| `address`     | VARCHAR(255)    | YES    |                    | NULL                                            |
| `phone`       | VARCHAR(20)     | YES    |                    | NULL                                            |
| `image_url`   | VARCHAR(512)    | YES    |                    | NULL                                            |
| `description` | TEXT            | YES    |                    | NULL                                            |
| `created_at`  | DATETIME        | NO     |                    | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME        | NO     |                    | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## user\_account

| カラム名            | 型                               | NULL許容 | キー                    | デフォルト                                           |
| --------------- | ------------------------------- | ------ | --------------------- | ----------------------------------------------- |
| `id`            | BIGINT UNSIGNED                 | NO     | PK, AUTO\_INCREMENT   | —                                               |
| `store_id`      | BIGINT UNSIGNED                 | YES    | FK → store(id), INDEX | NULL                                            |
| `role`          | ENUM('owner','manager','staff') | NO     |                       | —                                               |
| `user_id`       | VARCHAR(100)                    | NO     | UNIQUE                | —                                               |
| `username`      | VARCHAR(100)                    | NO     | INDEX                 | —                                               |
| `password_hash` | VARCHAR(255)                    | NO     |                       | —                                               |
| `is_locked`     | BOOLEAN                         | NO     |                       | FALSE                                           |
| `last_login_at` | DATETIME                        | YES    |                       | NULL                                            |
| `status`        | ENUM('active','inactive')       | NO     |                       | 'active'                                        |
| `created_at`    | DATETIME                        | NO     |                       | CURRENT\_TIMESTAMP                              |
| `updated_at`    | DATETIME                        | NO     |                       | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## reservation

| カラム名             | 型                                   | NULL許容 | キー                     | デフォルト                                           |
| ---------------- | ----------------------------------- | ------ | ---------------------- | ----------------------------------------------- |
| `id`             | BIGINT UNSIGNED                     | NO     | PK, AUTO\_INCREMENT    | —                                               |
| `store_id`       | BIGINT UNSIGNED                     | NO     | FK → store(id), INDEX  | —                                               |
| `course_id`      | BIGINT UNSIGNED                     | YES    | FK → course(id), INDEX | NULL                                            |
| `num_people`     | INT UNSIGNED                        | NO     |                        | 1                                               |
| `status`         | ENUM('booked','cancelled','noshow') | NO     |                        | 'booked'                                        |
| `customer_name`  | VARCHAR(255)                        | NO     |                        | —                                               |
| `customer_email` | VARCHAR(255)                        | NO     |                        | —                                               |
| `customer_phone` | VARCHAR(20)                         | YES    |                        | NULL                                            |
| `customer_memo`  | TEXT                                | YES    |                        | NULL                                            |
| `action_required`  | BOOLEN                                | NO    |                        | FALSE                                            |
| `created_at`     | DATETIME                            | NO     |                        | CURRENT\_TIMESTAMP                              |
| `updated_at`     | DATETIME                            | NO     |                        | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## reservation\_memo

| カラム名              | 型               | NULL許容 | キー                            | デフォルト                                           |
| ----------------- | --------------- | ------ | ----------------------------- | ----------------------------------------------- |
| `id`              | BIGINT UNSIGNED | NO     | PK, AUTO\_INCREMENT           | —                                               |
| `reservation_id`  | BIGINT UNSIGNED | NO     | FK → reservation(id), INDEX   | —                                               |
| `user_account_id` | BIGINT UNSIGNED | NO     | FK → user\_account(id), INDEX | —                                               |
| `memo`            | TEXT            | NO     |                               | —                                               |
| `created_at`      | DATETIME        | NO     |                               | CURRENT\_TIMESTAMP                              |
| `updated_at`      | DATETIME        | NO     |                               | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## reservation\_seat

| カラム名             | 型               | NULL許容 | キー                              | デフォルト                                           |
| ---------------- | --------------- | ------ | ------------------------------- | ----------------------------------------------- |
| `reservation_id` | BIGINT UNSIGNED | NO     | PK, FK → reservation(id), INDEX | —                                               |
| `seat_id`        | BIGINT UNSIGNED | NO     | PK, FK → seat(id)               | —                                               |
| `date`           | DATE            | NO     | PK                              | —                                               |
| `start_time`     | TIME            | NO     | PK                              | —                                               |
| `end_time`       | TIME            | NO     |                                 | —                                               |
| `created_at`     | DATETIME        | NO     |                                 | CURRENT\_TIMESTAMP                              |
| `updated_at`     | DATETIME        | NO     |                                 | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## notification\_log

| カラム名              | 型                                   | NULL許容 | キー                          | デフォルト              |
| ----------------- | ----------------------------------- | ------ | --------------------------- | ------------------ |
| `id`              | BIGINT UNSIGNED                     | NO     | PK, AUTO\_INCREMENT         | —                  |
| `reservation_id`  | BIGINT UNSIGNED                     | NO     | FK → reservation(id), INDEX | —                  |
| `channel`         | ENUM('email','line','sms','push')   | NO     |                             | —                  |
| `status`          | ENUM('pending','success','failure') | NO     |                             | 'pending'          |
| `attempts`        | INT UNSIGNED                        | NO     |                             | 0                  |
| `last_attempt_at` | DATETIME                            | YES    |                             | NULL               |
| `payload`         | JSON                                | YES    |                             | NULL               |
| `created_at`      | DATETIME                            | NO     |                             | CURRENT\_TIMESTAMP |

---

## audit\_log

| カラム名          | 型               | NULL許容 | キー                            | デフォルト              |
| ------------- | --------------- | ------ | ----------------------------- | ------------------ |
| `id`          | BIGINT UNSIGNED | NO     | PK, AUTO\_INCREMENT           | —                  |
| `user_id`     | BIGINT UNSIGNED | YES    | FK → user\_account(id), INDEX | NULL               |
| `action`      | VARCHAR(100)    | NO     |                               | —                  |
| `resource`    | VARCHAR(100)    | YES    |                               | NULL               |
| `resource_id` | BIGINT UNSIGNED | YES    |                               | NULL               |
| `ip_address`  | VARCHAR(45)     | YES    |                               | NULL               |
| `user_agent`  | VARCHAR(255)    | YES    |                               | NULL               |
| `details`     | JSON            | YES    |                               | NULL               |
| `created_at`  | DATETIME        | NO     |                               | CURRENT\_TIMESTAMP |

---

## auth\_token

| カラム名         | 型                        | NULL許容 | キー                            | デフォルト              |
| ------------ | ------------------------ | ------ | ----------------------------- | ------------------ |
| `id`         | BIGINT UNSIGNED          | NO     | PK, AUTO\_INCREMENT           | —                  |
| `user_id`    | BIGINT UNSIGNED          | NO     | FK → user\_account(id), INDEX | —                  |
| `token`      | VARCHAR(512)             | NO     | UNIQUE                        | —                  |
| `type`       | ENUM('access','refresh') | NO     |                               | 'access'           |
| `expires_at` | DATETIME                 | NO     | INDEX                         | —                  |
| `created_at` | DATETIME                 | NO     |                               | CURRENT\_TIMESTAMP |

---

## basic\_setting

| カラム名          | 型                         | NULL許容 | キー                  | デフォルト                                           |
| ------------- | ------------------------- | ------ | ------------------- | ----------------------------------------------- |
| `id`          | BIGINT UNSIGNED           | NO     | PK, AUTO\_INCREMENT | —                                               |
| `key`         | VARCHAR(100)              | NO     | UNIQUE              | —                                               |
| `value`       | VARCHAR(500)              | NO     |                     | —                                               |
| `description` | VARCHAR(255)              | YES    |                     | NULL                                            |
| `status`      | ENUM('active','inactive') | NO     |                     | 'active'                                        |
| `created_at`  | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP                              |
| `updated_at`  | DATETIME                  | NO     |                     | CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP |

---

## reservation\_setting

| 項目      | 説明     |
| ------- | ------ |
| 予約受付期間  | （詳細未定） |
| キャンセル期限 | （詳細未定） |
| 標準予約時間  | （詳細未定） |
| コース選択可否 | （詳細未定） |
| 座席選択可否  | （詳細未定） |

---

