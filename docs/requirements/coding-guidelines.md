# コーディング規約・ガイドライン

## 目次

1. 前提
2. 言語・フレームワーク
3. ファイル／ディレクトリ構成ルール
4. 命名規則
5. コードスタイル（ESLint／Prettier）
6. コメント・ドキュメンテーション
7. ブランチ・コミットメッセージ規約
8. Pull Request（レビュー）ルール
9. セキュリティ注意点

---

## 1. 前提

* 本プロジェクトは TypeScript + Node.js（Nest.js／Next.js）で開発する。
* Linter は ESLint、フォーマッターは Prettier を使用する。
* 可読性・保守性を重視し、一貫したスタイルを守る。

---

## 2. 言語・フレームワーク

* **バックエンド**

  * Nest.js（TypeScript）
  * Node.js は LTS バージョンを使用
* **フロントエンド**

  * Next.js（TypeScript + React）
* **共通ライブラリ**

  * ESLint, Prettier, Husky（Git Hooks）, lint-staged

---

## 3. ファイル／ディレクトリ構成ルール

プロジェクトルートから見た構成例:

```
project-root/
├── backend/
│   ├── prisma/                  # Prisma schema & マイグレーション
│   │   └── schema.prisma
│   ├── src/
│   │   ├── main.ts             # エントリポイント
│   │   ├── prismaClient.ts     # Prisma Client 初期化
│   │   ├── modules/            # 機能別モジュール (Controller, Service, DTO)
│   │   └── common/             # 共通ユーティリティ (Guards, Filters, Interfaces)
│   ├── test/                   # 単体テスト
│   └── README.md
├── frontend/
│   ├── pages/                  # Next.js ページ
│   ├── components/             # UI コンポーネント
│   └── lib/                    # API 呼び出し等の共通ユーティリティ
├── docs/                       # 要件・設計ドキュメント
├── infra/                      # インフラ構成 (nginx, Terraform 等)
└── README.md
```

---

## 4. 命名規則

### 4.1 ファイル名

* 拡張子: `.ts` (サーバー), `.tsx` (React コンポーネント)
* **ケバブケース** を使用 (例: `user.controller.ts`)
* Nest.js モジュール: `<機能>.module.ts`、コントローラ: `<機能>.controller.ts`、サービス: `<機能>.service.ts`

### 4.2 クラス／インターフェース名

* **PascalCase** (例: `UserController`, `CreateReservationDto`)
* DTO には必ず末尾に `Dto` を付与

### 4.3 変数／関数名

* **camelCase** (例: `userService`, `createReservation`)
* 定数は **UPPER\_SNAKE\_CASE** (例: `DEFAULT_PAGE_SIZE`)

### 4.4 ディレクトリ名

* **ケバブケース** (例: `prisma-client`, `order-history`)

---

## 5. コードスタイル（ESLint／Prettier）

### 5.1 ESLint

プロジェクトルートに `.eslintrc.js` を配置し、以下をベースに設定する:

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', '@nestjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:@nestjs/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    ...
  },
};
```

### 5.2 Prettier

プロジェクトルートに `prettier.config.js` を配置:

```js
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  semi: true,
};
```

### 5.3 lint-staged + Husky

`package.json` に設定:

```jsonc
{
  "husky": {"hooks": {"pre-commit": "lint-staged"}},
  "lint-staged": {"*.{ts,tsx}":["eslint --fix","prettier --write"]}
}
```

---

## 6. コメント・ドキュメンテーション

* 関数／クラスには JSDoc コメントを付与
* README.md に環境構築手順、実行コマンド一覧、ディレクトリ構成を記載

---

## 7. ブランチ・コミットメッセージ規約

### 7.1 ブランチ戦略

* `main` / `develop` / `feature/<ticket>-<desc>` / `bugfix/<ticket>` / `hotfix/<version>`

### 7.2 コミットメッセージ

* フォーマット: `<type>(<scope>): <description>`
* type: `feat`, `fix`, `docs`, `chore`, `refactor`
* 例: `feat(reservation): 新規予約API実装`

---

## 8. Pull Request（レビュー）ルール

* PR は `develop` へ
* レビュー担当1名以上必須
* PRタイトルはコミットメッセージ形式
* 説明欄に要約、影響範囲、テスト確認項目を記載

---

## 9. セキュリティ注意点

* CSRF／XSS／SQLインジェクション対策を徹底
* 個人情報は暗号化保存
* ログに機密情報を出力しない
