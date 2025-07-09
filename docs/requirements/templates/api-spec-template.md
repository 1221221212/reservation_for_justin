# API 要件定義書

## リソース名（例：Reservations）

### 1. POST /api/reservations
- **概要**：新規予約を作成する  
- **認可**：不要（顧客向け）  
- **リクエスト**
  - Content-Type: application/json  
  - Body:
    ```json
    {
      "storeId": 3,
      "reservationDate": "2025-07-15T18:30:00",
      "numberOfGuests": 4,
      "courseId": 2,
      "customerName": "山田太郎",
      "customerEmail": "taro@example.com",
      "customerPhone": "09012345678",
      "comment": "アレルギー: なし"
    }
    ```
- **バリデーション**
  - `storeId`：存在する店舗ID  
  - `reservationDate`：未来日時、営業時間内  
  - `numberOfGuests`：1～最大席数  
  - `customerEmail`：メール形式  
- **レスポンス**  
  - HTTP 201 Created  
    ```json
    {
      "reservationId": 7890,
      "status": "CONFIRMED",
      "message": "予約が完了しました"
    }
    ```
- **エラー**  
  - 400 Bad Request（バリデーションエラー）  
  - 409 Conflict（空席なし）  
  - 500 Internal Server Error

### 2. GET /api/stores/{storeId}/reservations
- **概要**：指定店舗の予約一覧を取得  
- **認可**：スタッフ以上（JWT 必須）  
- **クエリパラメータ**  
  - `date=YYYY-MM-DD`（任意、未指定で当日）  
  - `status=confirmed|cancelled|noshow|all`（任意、デフォルト all）  
  - `search=<顧客名 or メール or 電話>`（任意）  
- **レスポンス**  
  - HTTP 200 OK  
    ```json
    [
      {
        "reservationId": 7890,
        "customerName": "山田太郎",
        "reservationDate": "2025-07-15T18:30:00",
        "numberOfGuests": 4,
        "status": "CONFIRMED",
        "courseName": "ディナーコース",
        "comment": "アレルギー: なし"
      },
      …
    ]
    ```
- **エラー**
  - 403 Forbidden（権限エラー）  
  - 500 Internal Server Error

### 3. （他メソッド…）
