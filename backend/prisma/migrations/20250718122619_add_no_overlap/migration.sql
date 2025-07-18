-- prisma/migrations/<timestamp>_add_no_overlap/migration.sql

-- 1) GIST index に必要な拡張
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2) tsrange カラム追加
ALTER TABLE reservation_seat
ADD COLUMN time_range tsrange GENERATED ALWAYS AS (
  tsrange(
    (date + start_time)::timestamp,
    (date + end_time)::timestamp,
    '[)'
  )
) STORED;


-- 3) 排他制約 (同一席・範囲重複を防ぐ)
ALTER TABLE reservation_seat
ADD CONSTRAINT no_overlap
  EXCLUDE USING GIST (
    seat_id   WITH =,
    time_range WITH &&
  );

