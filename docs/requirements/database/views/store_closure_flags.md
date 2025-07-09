# store\_closure\_flags ビュー詳細

## 1. 概要

特定の日付が店舗の定休日かどうかを判定するヘルパービューです。

## 2. パラメータ

| パラメータ        | 型      | 必須／省略可 | 説明         |
| ------------ | ------ | ------ | ---------- |
| `p_store_id` | BIGINT | 必須     | 判定対象の店舗ID  |
| `p_date`     | DATE   | 必須     | 判定対象日（年月日） |

## 3. 出力カラム

| カラム名           | 型       | 説明                            |
| -------------- | ------- | ----------------------------- |
| `store_id`     | BIGINT  | 判定対象の店舗ID                     |
| `date`         | DATE    | 判定対象日                         |
| `is_closed`    | BOOLEAN | 休業日なら `true`、営業日なら `false`    |
| `closure_type` | TEXT    | マッチした `type` 値（例：`weekly` など） |

## 4. SQL 擬似コード

```sql
CREATE OR REPLACE VIEW store_closure_flags AS
SELECT
  c.store_id,
  c.date,
  (sc.id IS NOT NULL) AS is_closed,
  sc.type AS closure_type
FROM
  (SELECT :p_store_id::bigint AS store_id, :p_date::date AS date) AS c
LEFT JOIN StoreClosure sc
  ON sc.store_id = c.store_id
  AND (
       (sc.type = 'weekly'
         AND CASE WHEN sc.weekday = 7 THEN date_part('isodow', c.date) = 7
                   ELSE date_part('dow', c.date) = sc.weekday END)
    OR (sc.type = 'monthly_date'
         AND (sc.day_of_month = 99 AND c.date = (date_trunc('month', c.date) + INTERVAL '1 month - 1 day')::date
              OR date_part('day', c.date)::int = sc.day_of_month))
    OR (sc.type = 'monthly_nth_weekday'
         AND /* nth_week と weekday による判定ロジック */)
    OR (sc.type = 'yearly'
         AND date_part('month', c.date)::int = sc.month
         AND date_part('day', c.date)::int = sc.day)
  );
```

## 5. テストケース

1. **weekly**: `weekday=1`（月曜）で、2025-07-07 をテスト → `is_closed=true`
2. **weekly 祝日**: `weekday=7`（祝日）で祝日の日付をテスト → `is_closed=true`
3. **monthly\_date**: `day_of_month=15` で2025-07-15をテスト → `is_closed=true`
4. **monthly\_date 月末**: `day_of_month=99` で2025-07-31をテスト → `is_closed=true`
5. **monthly\_nth\_weekday**: `nth_week=2, weekday=3` で2025-07-08をテスト → `is_closed=true`
6. **yearly**: `month=12,day=25`で2025-12-25をテスト → `is_closed=true`
7. 上記以外の日付 → `is_closed=false`
