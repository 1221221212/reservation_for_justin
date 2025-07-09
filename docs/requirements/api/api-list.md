# API 一覧
> **凡例**
>
> * **R = Required ロール** (`owner`, `manager`, `staff`, `customer`, `guest`)
> * **G = ガード** (`RequireStore` = 店舗スコープ必須)
> * **C = CRUD** （C = create, R = read(list/single), U = update, D = delete<論理削除>）
> * **P = 優先度**（H = 高, M = 中, L = 低, `–` = 未設定）

---

## 1. 認証 / 共通

| PATH               | METHOD | 目的            | R      | G | 備考                    | P |
| ------------------ | ------ | ------------- | ------ | - | --------------------- | - |
| `/v1/auth/login`   | POST   | ログイン／JWT 発行   | guest  | – | `user_id`, `password` | H |
| `/v1/auth/refresh` | POST   | リフレッシュトークン再発行 | all    | – | –                     | M |
| `/v1/healthz`      | GET    | ヘルスチェック       | public | – | –                     | – |
| `/v1/version`      | GET    | バージョン情報       | public | – | –                     | – |

---

## 2. 店舗（Store）

| PATH         | METHOD | C | 目的     | R     | G            | P |
| ------------ | ------ | - | ------ | ----- | ------------ | - |
| `/v1/stores` | GET    | R | 店舗一覧取得 | owner | –            | H |
| `/v1/stores` | POST   | C | 店舗新規作成 | owner | –            | H |
| `/v1/stores` | DELETE | D | 店舗論理削除 | owner | RequireStore | M |

### StoreInfo（営業時間・TEL 等）

| PATH                         | METHOD  | C   | 目的     | R             | G            | P |
| ---------------------------- | ------- | --- | ------ | ------------- | ------------ | - |
| `/v1/stores/{store_id}/info` | GET/PUT | R/U | 店舗詳細設定 | owner,manager | RequireStore | H |

---

## 3. 座席系

### Seat

| PATH                                    | METHOD | C | 目的     | R        | G            | P |
| --------------------------------------- | ------ | - | ------ | -------- | ------------ | - |
| `/v1/stores/{store_id}/seats`           | GET    | R | 座席一覧取得 | manager+ | RequireStore | H |
| 同上                                      | POST   | C | 座席追加   | manager+ | RequireStore | H |
| `/v1/stores/{store_id}/seats/{seat_id}` | GET    | R | 座席詳細   | manager+ | RequireStore | H |
| 同上                                      | PUT    | U | 座席更新   | manager+ | RequireStore | L |
| 同上                                      | DELETE | D | 座席論理削除 | manager+ | RequireStore | M |

### SeatAttribute & Group

| PATH                                                                | METHOD         | C     | 目的                           | R        | G            | P                            |
| ------------------------------------------------------------------- | -------------- | ----- | ---------------------------- | -------- | ------------ | ---------------------------- |
| `/v1/stores/{store_id}/seat-attribute-groups`                       | GET/POST       | R/C   | グループ一覧 / 作成                  | manager+ | RequireStore | H                            |
| `/v1/stores/{store_id}/seat-attribute-groups/{group_id}`            | GET/PUT/DELETE | R/U/D | グループ詳細 / 更新 / 削除             | manager+ | RequireStore | H(GET), M(DELETE), L(UPDATE) |
| `/v1/stores/{store_id}/seat-attribute-groups/{group_id}/attributes` | POST           | C     | グループ作成と同時に属性一括追加/既存グループへ属性追加 | manager+ | RequireStore | H                            |
| `/v1/stores/{store_id}/seat-attributes/{attribute_id}`              | GET/PUT/DELETE | R/U/D | 単一属性取得 / 更新 / 削除             | manager+ | RequireStore | L                            |

> **属性一括登録例**
>
> ```json
> { "attributes": [ {"name":"窓側"}, {"name":"個室"} ] }
> ```

---

## 4. レイアウト系

| PATH                                        | METHOD         | 目的                  | R        | G            | P |
| ------------------------------------------- | -------------- | ------------------- | -------- | ------------ | - |
| `/v1/stores/{store_id}/layouts`             | GET/POST       | レイアウト一覧 / 作成        | manager+ | RequireStore | – |
| `/v1/stores/{store_id}/layouts/{layout_id}` | GET/PUT/DELETE | レイアウト詳細 / 更新 / 論理削除 | manager+ | RequireStore | L |

### Layout\_Schedule（詳細未定）

| PATH                                     | METHOD   | 目的                 | R        | G            | P |
| ---------------------------------------- | -------- | ------------------ | -------- | ------------ | - |
| `/v1/stores/{store_id}/layout-schedules` | GET/POST | レイアウトスケジュール一覧 / 作成 | manager+ | RequireStore | – |

---

## 5. 定休日

| PATH                               | METHOD   | 目的         | R        | G            | P |
| ---------------------------------- | -------- | ---------- | -------- | ------------ | - |
| `/v1/stores/{store_id}/closed-day` | GET/POST | 定休日一覧 / 作成 | manager+ | RequireStore | H |

---

## 6. 臨時営業・休業

| PATH                                  | METHOD              | 目的        | R        | G            | P |
| ------------------------------------- | ------------------- | --------- | -------- | ------------ | - |
| `/v1/stores/{store_id}/special-dates` | GET/POST/PUT/DELETE | 臨時営業・休業操作 | manager+ | RequireStore | H |

---

## 7. 予約系（詳細未定）

---

## 8. ユーザー管理

| PATH                           | METHOD | 目的          | R     | G | P |
| ------------------------------ | ------ | ----------- | ----- | - | - |
| `/v1/users`                    | POST   | 新規ユーザー作成    | owner | – | H |
| `/v1/users`                    | GET    | 全ユーザー一覧取得   | owner | – | H |
| `/v1/users/{user_id}`          | GET    | ユーザー詳細取得    | owner | – | M |
| 同上                             | PUT    | ロール/ステータス更新 | owner | – | L |
| 同上                             | DELETE | ユーザー論理削除    | owner | – | M |
| `/v1/users/{user_id}/password` | PATCH  | パスワードリセット   | owner | – | M |

---

## 9. 通知・ログ

| PATH                                      | METHOD | 目的     | R             | G            | P |
| ----------------------------------------- | ------ | ------ | ------------- | ------------ | - |
| `/v1/stores/{store_id}/notification-logs` | GET    | 通知ログ取得 | owner,manager | RequireStore | – |
| `/v1/audit-logs`                          | GET    | 監査ログ取得 | owner         | –            | – |

---

## 10. 設定

| PATH                                         | METHOD  | 目的     | R             | G            | P |
| -------------------------------------------- | ------- | ------ | ------------- | ------------ | - |
| `/v1/settings/basic`                         | GET/PUT | 会社基本設定 | owner         | –            | – |
| `/v1/stores/{store_id}/settings/reservation` | GET/PUT | 店舗予約設定 | owner,manager | RequireStore | L |

---

### 備考

* **DELETE はすべて論理削除** (`deleted_at` カラム)。
* ロール表記： **manager+** = manager と owner、 **staff+** = staff, manager, owner。
* 詳細 Schema は `openapi/reservation-system-v1.yaml` にて定義。
