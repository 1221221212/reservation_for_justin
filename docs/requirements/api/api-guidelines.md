# API ガイドライン

> **目的**
> すべてのエンジニアが同一ルールで API を設計・実装・レビューできるようにする。命名揺れ・実装差分・将来の破壊的変更リスクを最小化。

---

## 目次

1. パス命名規則
2. バージョニング
3. 認証・認可（ロール／店舗スコープ）
4. エラーフォーマット
5. 日付・時間フォーマット & タイムゾーン
6. ページング・ソート・フィルタ
7. 論理削除（ソフトデリート）
8. 並列更新対策（ETag / If‑Match）
9. 冪等リクエスト（Idempotency-Key）
10. トレーシングヘッダ & ロギング
11. レート制限
12. 多言語対応
13. 監査ログ
14. ヘルスチェック & バージョン
15. ドキュメント配置

---

## 1. パス命名規則

| ルール                       | 例                                                     |
| ------------------------- | ----------------------------------------------------- |
| 名詞は **複数形**               | `/stores/{store_id}/seats`                            |
| 階層最大 **3 段**              | `/stores/{store_id}/seats/{seat_id}`                  |
| 店舗スコープは第 1 階層固定           | `/stores/{store_id}/…`                                |
| 動詞は使わない（動作は HTTP メソッドで表現） | `DELETE /seats/{id}` ✔︎ / `POST /seats/{id}/delete` ✘ |

## 2. バージョニング

* URL パスに `/v1/` を含める (`/v1/stores/{store_id}/…`)。
* 後方互換を壊す変更時のみ `/v2` へ昇格。

## 3. 認証・認可

### 3.1 ロール

`owner` / `manager` / `staff` / `customer` / `guest(なし)`

### 3.2 JWT クレーム

| クレーム       | 説明                            |
| ---------- | ----------------------------- |
| `sub`      | ユーザー ID                       |
| `role`     | 上記ロール                         |
| `store_id` | アクセス可能店舗 ID（owner は null で全店） |
| `exp`      | 有効期限（1h）                      |

### 3.3 API ガード

* `@RequireRole("manager+")` = manager 以上。
* `@RequireStore` = パス／ボディの `store_id` とトークンの `store_id` が一致。

## 4. エラーフォーマット (RFC7807 準拠)

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation error",
  "status": 400,
  "detail": "date is required",
  "instance": "X-Request-ID",
  "errors": [ { "field": "date", "issue": "missing" } ]
}
```

## 5. 日付・時間フォーマット & タイムゾーン

* **日付** `YYYY-MM-DD`
* **時間** `HH:MM` (24h, 秒不要)
* **日時** `YYYY-MM-DDTHH:MM:SSZ` (ISO‑8601) *内部のみ*
* すべて **JST 固定**。API も UI も変換しない。

## 6. ページング・ソート・フィルタ

| 機能    | 方式               | パラメータ                        |
| ----- | ---------------- | ---------------------------- |
| ページング | **cursor**       | `cursor`, `limit` (max=100)  |
| ソート   | クエリ              | `sort=created_at&order=desc` |
| フィルタ  | `filter_` prefix | `filter_status=active`       |

## 7. 論理削除（ソフトデリート）

| ルール         | 内容                                                             |
| ----------- | -------------------------------------------------------------- |
| カラム         | 全マスタ/予約系テーブルに `deleted_at DATETIME NULL`                       |
| `DELETE` 動作 | `UPDATE … SET deleted_at = NOW()` を行い **204 No Content** を返す   |
| 復元          | `PUT /{resource}/{id}/restore` で `deleted_at = NULL`           |
| 取得 API      | 既定で `deleted_at IS NULL` を暗黙条件。`?include_deleted=true` で全件取得可。 |
| 物理削除        | AuditLog 等ログ系・一時テーブルのみ。週次バッチでパージ。                              |

## 8. 並列更新対策

* 更新系 (`PUT` / `PATCH` / `DELETE`) は **ETag** を返し、クライアントは `If-Match` 必須。
* ETag 値は `sha256(updated_at)`。

## 9. 冪等リクエスト

* 予約作成 `POST /reservations` はヘッダ `Idempotency-Key` 受け付け。
* 同キー重複リクエストは **前回と同一レスポンス** を返す。

## 10. トレーシング & ロギング

* すべてのリクエストに `X-Request-ID` ヘッダ必須。なければサーバ生成し返却。
* ログは JSON Lines→ OpenTelemetry 連携。

## 11. レート制限

| API                                 | 制限                                        |
| ----------------------------------- | ----------------------------------------- |
| 公開 (`/calendar`, `/time-selection`) | 100 req / 5 min / IP                      |
| 認証済み                                | 1000 req / 5 min / user\_id               |
| バースト超過時                             | 429 Too Many Requests + `Retry-After` ヘッダ |

## 12. 多言語対応

* `Accept-Language` (`ja`, `en`) を読み、エラー `title` / `detail` をローカライズ。
* 未対応言語は `ja` で返す。

## 13. 監査ログ

* ロール `owner` / `manager` / `staff` の **POST / PUT / DELETE** は `AuditLog` テーブルへ自動挿入。
* OpenAPI `x-audit: true` を付与し、自動コード生成側でミドルウェアを呼び出す。

## 14. ヘルスチェック & バージョン

| パス             | 内容                                                 |
| -------------- | -------------------------------------------------- |
| `GET /healthz` | 200: `{status:"ok"}` / 503: `{status:"unhealthy"}` |
| `GET /version` | `{"version":"1.0.0","commit":"abcdef"}`            |

## 15. ドキュメント配置

```
docs/
└─ api/
     ├─ guidelines.md          ← 本ファイル
     ├─ draft/
     │    └─ calendar-time-selection-api-v0.4.md
     └─ openapi/
          └─ reservation-system-v1.yaml
```

* Pull Request マージ時、自動で Redoc サイトにデプロイ。

---

> **改訂ルール**
>
> * 変更提案は PR。レビュワーは BE リード＋フロント代表。
> * 互換性を壊す場合は `v1.x` → `v2.0` へメジャーアップし、旧バージョンを 6 ヶ月サポート。
