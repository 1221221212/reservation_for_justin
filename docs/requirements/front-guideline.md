# フロントエンド設計ドキュメント

## 1. フレームワーク・技術スタック

* **Next.js**（React）
* **TypeScript**
* **Axios**（APIクライアント）
* **Tailwind CSS**（スタイリング）

---

## 2. 画面領域の分割

1. **顧客画面**（予約エンドユーザー向け）

   * `/` — トップページ
   * `/reservation` — 予約一覧・検索
   * `/reservation/[storeId]` — 店舗ごとの予約ページ

2. **管理画面**（オーナー・店舗スタッフ向け）

   * `/admin/login` — 共通ログイン
   * `/admin/owner` — オーナーダッシュボード（全店舗管理）
   * `/admin/owner/users` — ユーザー管理
   * `/admin/store` — 店舗一覧（オーナー用）
   * `/admin/store/[storeId]` — 店舗別管理画面

     * `/.../index` — 予約管理
     * `/.../seats` — 座席管理
     * `/.../settings` — 店舗設定

---

## 3. ディレクトリ構成案

```
frontend/
├── public/                    # 静的ファイル
├── styles/                    # グローバルCSS, Tailwind設定
├── components/                # 共通UIコンポーネント
│   ├── ui/                    # ボタン, フォーム等
│   └── layout/                # AdminLayout, CustomerLayout
├── lib/                       # APIクライアント, utility
│   └── api.ts
├── hooks/                     # カスタムフック
│   └── useAuth.ts
├── context/                   # React Context
│   └── AuthContext.tsx
├── pages/                     # Next.js ページ
│   ├── index.tsx              # 顧客トップ
│   ├── reservation/
│   │   ├── index.tsx          # 予約一覧
│   │   └── [storeId]/
│   │       └── index.tsx      # 店舗予約
│   └── admin/
│       ├── login.tsx          # 管理画面ログイン
│       ├── owner/
│       │   ├── index.tsx      # 全店舗ダッシュボード
│       │   └── users.tsx      # ユーザー管理
│       └── store/
│           ├── index.tsx      # 店舗一覧
│           └── [storeId]/
│               ├── index.tsx  # 予約管理
│               ├── seats.tsx  # 座席管理
│               └── settings.tsx # 店舗設定
└── package.json
```

---

## 4. 共通レイアウト

* **CustomerLayout**: 顧客画面のヘッダー／フッターを定義
* **AdminLayout**: 管理画面のサイドバー（ナビゲーション）／ヘッダー

---

## 5. 認証・状態管理

* **AuthContext** + **useAuth** でトークン保持とヘッダー付与
* 未ログイン時は `/admin/login` へリダイレクト

---
