作成日: 2025-06-06  
バージョン: 0.1
# Project Kickoff ガイドライン

このドキュメントは、プロジェクトキックオフ段階でチーム全員が合意しておくべきルールや手順をまとめています。
`docs/guidelines/Project_Guidelines.md` に配置して活用してください。

---

## 1. プロジェクト概要

* **名称**: PJT Miko
* **目的**: 予約作成・管理・編集などの予約関連の機能のWeb完結化
* **ステークホルダー**:

  * 友人
  * Naoki Iwasa
  * ChatGPT (アシスタント)
* **フェーズ**:

  1. キックオフ・ガイドライン整備
  2. 要件定義・詳細設計
  3. 実装・テスト
  4. リリース・運用

## 2. プロジェクト管理 プロジェクト管理

### 2.1 開発手法

* アジャイル開発（1〜2週間スプリント）
* 毎日15分スタンドアップ、スプリントプランニング、レビュー、レトロスペクティブを実施

### 2.2 タスク管理

* チケット管理ツール: Jira／GitHub Issues
* 各チケットに必須記載:

  * 概要
  * 担当者
  * 見積もり（Story Pointまたは時間）
  * 受け入れ条件

### 2.3 コミュニケーション

* Slackチャンネル: #general, #backend, #frontend, #ops など
* 重要決定はConfluence/Notionに記録

## 3. バージョン管理・ブランチ戦略

* リポジトリ: GitHub
* ブランチモデル (Git Flow準拠):

  * `main`: 本番安定版
  * `develop`: 次リリース向け統合
  * `feature/*`, `hotfix/*`, `release/*`
* コミット規約: Conventional Commits（`feat:`, `fix:` など）

## 4. コード品質・コーディング規約

* リンター/フォーマッタ:

  * JS/TS: ESLint + Prettier
  * PHP: PHP\_CodeSniffer (PSR-12)
  * CSS/SCSS: Stylelint
* 命名規則:

  * ファイル: `kebab-case`
  * 変数/関数: `camelCase`
  * クラス/型: `PascalCase`
* ディレクトリ構成例:

  ```
  src/
  ├ components/
  ├ pages/
  ├ services/
  ├ hooks/
  └ utils/
  ```

## 5. テスト・品質ゲート

* テスト:

  * ユニット: Jest / PHPUnit
  * 結合: Supertest / Cypress
  * E2E: Cypress / Playwright
* カバレッジ: 主要モジュール80%以上目標
* PRレビュー: 最低1名+テスト通過

## 6. CI/CD・デプロイ

* CIツール: GitHub Actions
* プルリク時にテスト・ビルド・静的解析実行
* `develop`マージでステージングデプロイ
* `main`マージ or タグで本番デプロイ

## 7. ドキュメント管理

* `docs/`ディレクトリを一元管理:

  * specs/, api/, database/, architecture/, templates/, guidelines/
* 各ドキュメントはMarkdown形式でコミット
* 更新時は概要をREADMEに追記

## 8. 次フェーズへの橋渡し

* 本ドキュメントに沿って要件定義に入る
* `docs/specs`に詳細仕様を追加
* `migrations/`と`backend/db/init.sql`を整備

---

以上をキックオフ段階でチーム全員に共有し、以降の開発チャットでも参照・更新を続けてください。
