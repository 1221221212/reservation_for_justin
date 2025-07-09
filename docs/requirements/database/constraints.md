# 制約一覧 (constraints.md)

各テーブルに定義すべき制約をまとめています。DDL化時に正確に反映してください。

| テーブル                          | 制約種別   | 対象カラム                                                                                           | 参照先／条件／詳細                                             |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **SeatAttributeGroup**        | PK     | `id`                                                                                            | 主キー、自動採番                                              |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | UNIQUE | (`store_id`,`name`)                                                                             | 同一店舗内でグループ名の重複禁止                                      |
| **SeatAttribute**             | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | FK     | `group_id`                                                                                      | REFERENCES `SeatAttributeGroup(id)` ON DELETE CASCADE |
|                               | UNIQUE | (`store_id, group_id, name`)                                                                    | 同一店舗・同一グループ内で属性名重複禁止                                  |
| **Seat**                      | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | UNIQUE | (`store_id, name`)                                                                              | 同一店舗内で座席名称重複禁止                                        |
| **Seat\_SeatAttribute**       | PK     | (`seat_id`, `attribute_id`)                                                                     |                                                       |
|                               | FK     | `seat_id`                                                                                       | REFERENCES `Seat(id)` ON DELETE CASCADE               |
|                               | FK     | `attribute_id`                                                                                  | REFERENCES `SeatAttribute(id)` ON DELETE CASCADE      |
| **Layout**                    | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | UNIQUE | (`store_id, name`)                                                                              | 同一店舗内でレイアウト名重複禁止                                      |
| **Layout\_Seat**              | PK     | (`layout_id`, `seat_id`)                                                                        |                                                       |
|                               | FK     | `layout_id`                                                                                     | REFERENCES `Layout(id)` ON DELETE CASCADE             |
|                               | FK     | `seat_id`                                                                                       | REFERENCES `Seat(id)` ON DELETE CASCADE               |
| **Layout\_Schedule**          | PK     | (`layout_id`, `day_of_week`, `start_time`)                                                      |                                                       |
|                               | FK     | `layout_id`                                                                                     | REFERENCES `Layout(id)` ON DELETE CASCADE             |
| **ClosedDayGroup**            | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
| **ClosedDay**                 | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | FK     | `group_id`                                                                                      | REFERENCES `ClosedDayGroup(id)` ON DELETE CASCADE     |
| **SpecialDate**               | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `layout_id`                                                                                     | REFERENCES `Layout(id)` ON DELETE CASCADE             |
|                               | UNIQUE | (`layout_id, date, start_time, type`)                                                           | 同一レイアウト同日時に同種別設定禁止                                    |
| **Course**                    | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
| **Material**                  | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
| **Course\_Material**          | PK     | (`course_id`, `material_id`)                                                                    |                                                       |
|                               | FK     | `course_id`                                                                                     | REFERENCES `Course(id)` ON DELETE CASCADE             |
|                               | FK     | `material_id`                                                                                   | REFERENCES `Material(id)` ON DELETE CASCADE           |
| **Course\_Assignment**        | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `course_id`                                                                                     | REFERENCES `Course(id)` ON DELETE CASCADE             |
|                               | UNIQUE | (`course_id, day_of_week, start_time`)                                                          | 同一コース同曜日同時刻重複禁止                                       |
| **SpecialCourse\_Assignment** | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `course_id`                                                                                     | REFERENCES `Course(id)` ON DELETE CASCADE             |
|                               | UNIQUE | (`course_id, date, start_time, type`)                                                           | 同一コース同日同種別重複禁止                                        |
| **UserAccount**               | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE SET NULL             |
|                               | UNIQUE | `user_id`                                                                                       | ログインIDユニーク                                            |
|                               | CHECK  | `(role='owner' AND store_id IS NULL) OR (role IN ('manager','staff') AND store_id IS NOT NULL)` | オーナーは店舗未所属、その他は店舗所属必須                                 |
| **Reservation**               | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `store_id`                                                                                      | REFERENCES `Store(id)` ON DELETE CASCADE              |
|                               | FK     | `course_id`                                                                                     | REFERENCES `Course(id)` ON DELETE SET NULL            |
| **ReservationMemo**           | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `reservation_id`                                                                                | REFERENCES `Reservation(id)` ON DELETE CASCADE        |
|                               | FK     | `user_account_id`                                                                               | REFERENCES `UserAccount(id)` ON DELETE SET NULL       |
| **Reservation\_Seat**         | PK     | (`reservation_id, seat_id, date, start_time`)                                                   |                                                       |
|                               | FK     | `reservation_id`                                                                                | REFERENCES `Reservation(id)` ON DELETE CASCADE        |
|                               | FK     | `seat_id`                                                                                       | REFERENCES `Seat(id)` ON DELETE CASCADE               |
| **NotificationLog**           | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `reservation_id`                                                                                | REFERENCES `Reservation(id)` ON DELETE CASCADE        |
| **AuditLog**                  | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `user_id`                                                                                       | REFERENCES `UserAccount(id)` ON DELETE SET NULL       |
|                               | FK     | `resource_id`                                                                                   | （任意リソース参照）                                            |
| **AuthToken**                 | PK     | `id`                                                                                            |                                                       |
|                               | FK     | `user_id`                                                                                       | REFERENCES `UserAccount(id)` ON DELETE CASCADE        |
