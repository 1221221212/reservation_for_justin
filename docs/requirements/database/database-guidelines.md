# Prisma スキーマ管理ルール

以下のガイドラインに沿って、今後のモデル追加・修正を行ってください。

---

## 1. 命名規則

- **モデル名**：`PascalCase`（例：`UserAccount`）
- **Prisma フィールド**：`camelCase`（例：`createdAt`）
- **実 DB カラム**：`snake_case`（例：`created_at`）\
  → Prisma フィールドと異なる場合は必ず `@map("snake_case")` を付与。

## 2. テーブル名

- 実 DB のテーブル名はすべて `snake_case` に統一。\
  → 各モデルに `@@map("table_name")` で明示。

## 3. デフォルト値と必須設定

- 論理フラグ（例：`isLocked`）には `@default(false)` を必ず付与。
- ステータス文字列は Enum 化し、`@default` で初期値を指定（例：`StoreStatus.ACTIVE`）。

## 4. タイムスタンプ

- 全テーブルに必ず下記フィールドを追加：
  ```prisma
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt     @map("updated_at")
  ```
- 運用ログや監査対応に必須。

## 5. Enum 管理

- 文字列ステータスはすべて `enum` 定義で管理し、直接文字列を使わない。
- 現在の定義例：
  ```prisma
  enum Role {
    owner
    manager
    staff
  }

  enum StoreStatus {
    ACTIVE
    INACTIVE
    CLOSED
  }
  ```

## 6. リレーション

- 外部キーは必ず `@relation(fields: [field], references: [id])` で明示。
- 中間テーブルや複合主キーが必要な場合は `@@id([a, b])` を利用。

