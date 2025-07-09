// backend/src/modules/index.ts

import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { SeatAttributeGroupModule } from './seat-attribute-group/seat-attribute-group.module';
import { SeatAttributeModule } from './seat-attribute/seat-attribute.module';
import { SeatModule } from './seat/seat.module';
import { LayoutModule } from './layout/layout.module';  // ← 追加

export const AppModules = [
  AuthModule,
  StoreModule,
  UserModule,
  SeatAttributeGroupModule,
  SeatAttributeModule,
  SeatModule,
  LayoutModule,  // ← 追加
  // OtherModule,
];
