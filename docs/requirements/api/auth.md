# 認証・認可ドキュメント

## 1. 概要

このシステムでは、以下の仕組みで認証および認可を行います。

* **認証（Authentication）**

  * JWT（JSON Web Token）ベースのステートレス認証を採用
  * `POST /v1/auth/login` でユーザーIDとパスワードを送信し、アクセストークンを取得
  * クライアントは以降のリクエストで `Authorization: Bearer <token>` をヘッダーに付与

* **認可（Authorization）**

  * **RolesGuard**：ユーザーのロール（`owner`、`manager`、`staff`）によるアクセス制御
  * **StoreScopeGuard**：テナント（店舗）ごとのアクセス制御。リクエストURIの `storeId` とログイントークンの `storeId` を比較

---

## 2. エンドポイント一覧

| PATH               | METHOD | 説明                                    |
| ------------------ | ------ | ------------------------------------- |
| `/v1/auth/login`   | POST   | ログイン。`userId`/`password` を送信し、トークンを取得 |
| `/v1/auth/refresh` | POST   | リフレッシュトークン再発行（未実装）                    |

---

## 3. JWT ペイロード定義

```json
{
  "sub": "<ユーザーID>",
  "role": "<owner|manager|staff>",
  "iat": 1610000000,
  "exp": 1610003600
}
```

* `sub`：ユーザーの主キーID（文字列化済み）
* `role`：ユーザーのロール
* `iat`：発行時刻（Unix timestamp）
* `exp`：有効期限（Unix timestamp）

---

## 4. RolesGuard

### 4-1. デコレーター定義

```ts
// backend/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 4-2. ガード実装

```ts
// backend/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) {
      return true; // 権限チェック不要
    }
    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('権限がありません');
    }
    return true;
  }
}
```

---

## 5. StoreScopeGuard（店舗スコープ制御）

### 5-1. デコレーター定義

```ts
// backend/src/common/decorators/require-store.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const STORE_KEY = 'store';
export const RequireStore = () => SetMetadata(STORE_KEY, true);
```

### 5-2. ガード実装

```ts
// backend/src/common/guards/store-scope.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StoreScopeGuard implements CanActivate {
  private prisma = new PrismaClient();
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireStore = this.reflector.get<boolean>(STORE_KEY, context.getHandler());
    if (!requireStore) return true;

    const req = context.switchToHttp().getRequest();
    const storeIdParam = parseInt(req.params.storeId, 10);
    const userId = req.user.sub; // JwtStrategy validate で設定

    const user = await this.prisma.userAccount.findUnique({ where: { id: BigInt(userId) } });
    if (user.storeId === BigInt(storeIdParam)) {
      return true;
    }
    throw new ForbiddenException('他店舗の操作は許可されていません');
  }
}
```

---

## 6. 適用例

```ts
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StoreScopeGuard } from '../common/guards/store-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireStore } from '../common/decorators/require-store.decorator';

@Controller('stores')
export class StoreController {
  @UseGuards(JwtAuthGuard, RolesGuard, StoreScopeGuard)
  @Roles('owner', 'manager')
  @RequireStore()
  @Get(':storeId/info')
  getStoreInfo(@Param('storeId') storeId: string) {
    // 処理...
  }
}
```

---

## 7. 環境変数設定

`backend/.env` に以下を追加：

```dotenv
# JWT
JWT_SECRET="<長いランダム文字列>"
JWT_EXPIRES_IN="3600s"
```

---

## 8. 運用フロー

* JWT シークレットの定期ローテーション方法（例：Vault連携）
* トークン失効ポリシー設計（ブラックリスト or 短い有効期限＋リフレッシュトークン）
* ログアウト時のリフレッシュトークン削除フロー

---
