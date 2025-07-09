// backend/src/common/decorators/require-store.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**  
 * @RequireStore() を付与されたルートでは、  
 * リクエストパラメータの storeId とユーザーの storeId を比較して  
 * テナント（店舗）スコープを制御します。  
 */
export const STORE_KEY = 'require_store';
export const RequireStore = () => SetMetadata(STORE_KEY, true);
