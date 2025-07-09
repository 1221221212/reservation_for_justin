# インデックス設計 (indexes.md)

各テーブルに設定するインデックス一覧です。パフォーマンス要件や想定クエリに応じて最適化してください。

| テーブル                      | インデックス名               | 対象カラム                         | 種別     | 説明                 |
| ------------------------- | --------------------- | ----------------------------- | ------ | ------------------ |
| SeatAttributeGroup        | idx\_sag\_store       | (store\_id)                   | INDEX  | 店舗ごとに属性グループ検索高速化   |
| SeatAttribute             | uniq\_seatattr        | (store\_id, group\_id, name)  | UNIQUE | 同一店舗・同一グループ内名重複禁止  |
|                           | idx\_sa\_store        | (store\_id)                   | INDEX  | 店舗ごとに属性検索高速化       |
| Seat                      | uniq\_seat            | (store\_id, name)             | UNIQUE | 同一店舗内の座席名重複禁止      |
|                           | idx\_seat\_store      | (store\_id)                   | INDEX  | 店舗ごとに座席検索高速化       |
| Seat\_SeatAttribute       | idx\_ssa\_seat        | (seat\_id)                    | INDEX  | 座席ごとの属性参照高速化       |
|                           | idx\_ssa\_attr        | (attribute\_id)               | INDEX  | 属性ごとの座席参照高速化       |
| Layout                    | uniq\_layout          | (store\_id, name)             | UNIQUE | 同一店舗内のレイアウト名重複禁止   |
|                           | idx\_layout\_store    | (store\_id)                   | INDEX  | 店舗ごとにレイアウト検索高速化    |
| Layout\_Seat              | idx\_ls\_layout       | (layout\_id)                  | INDEX  | レイアウトごとの座席一覧高速化    |
| Layout\_Schedule          | idx\_lsc\_layout      | (layout\_id)                  | INDEX  | レイアウトのスケジュール検索高速化  |
|                           | idx\_lsc\_group       | (group\_id)                   | INDEX  | グループ単位スケジュール検索高速化  |
| ClosedDayGroup            | idx\_cdg\_store       | (store\_id)                   | INDEX  | 店舗ごとに定休日グループ検索高速化  |
|                           | idx\_cd\_group        | (group\_id)                   | INDEX  | グループ単位定休日検索高速化     |
| ClosedDay                 | idx\_cd\_store        | (store\_id)                   | INDEX  | 店舗ごとに定休日検索高速化      |
|                           | idx\_cd\_group        | (group\_id)                   | INDEX  | グループ単位定休日検索高速化     |
| SpecialDate               | idx\_sd\_layout\_date | (layout\_id, date)            | INDEX  | 特定日のレイアウト参照高速化     |
| Course\_Material          | idx\_cm\_course       | (course\_id)                  | INDEX  | コースごとの材料参照高速化      |
|                           | idx\_cm\_material     | (material\_id)                | INDEX  | 材料ごとのコース参照高速化      |
| Course\_Assignment        | idx\_ca\_course       | (course\_id)                  | INDEX  | コース別スケジュール検索高速化    |
| SpecialCourse\_Assignment | idx\_sca\_course      | (course\_id)                  | INDEX  | コース別臨時提供状況検索高速化    |
| Reservation               | idx\_res\_store       | (store\_id)                   | INDEX  | 店舗別予約一覧検索高速化       |
|                           | idx\_res\_course      | (course\_id)                  | INDEX  | コース別予約集計高速化        |
| ReservationMemo           | idx\_rm\_res          | (reservation\_id)             | INDEX  | 予約ごとのメモ検索高速化       |
| Reservation\_Seat         | idx\_rs\_seat\_time   | (seat\_id, date, start\_time) | INDEX  | 席ごとの空き確認高速化        |
| NotificationLog           | idx\_nl\_res          | (reservation\_id)             | INDEX  | 予約ごとの通知履歴検索高速化     |
|                           | idx\_nl\_chan\_status | (channel, status)             | INDEX  | チャネル・ステータス別絞込高速化   |
| AuditLog                  | idx\_al\_user         | (user\_id)                    | INDEX  | ユーザー操作ログ検索高速化      |
|                           | idx\_al\_action       | (action)                      | INDEX  | 操作種別別ログ検索高速化       |
| AuthToken                 | uniq\_at\_token       | (token)                       | UNIQUE | トークン重複禁止           |
|                           | idx\_at\_user\_type   | (user\_id, type)              | INDEX  | ユーザー・種別別トークン検索高速化  |
|                           | idx\_at\_expires      | (expires\_at)                 | INDEX  | 期限切れトークンクリーンアップ高速化 |
