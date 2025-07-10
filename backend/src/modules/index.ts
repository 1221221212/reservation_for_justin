import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { SeatAttributeGroupModule } from './seat-attribute-group/seat-attribute-group.module';
import { SeatAttributeModule } from './seat-attribute/seat-attribute.module';
import { SeatModule } from './seat/seat.module';
import { LayoutModule } from './layout/layout.module';
import { ScheduleModule } from './schedule/​schedule.module';
import { ClosedDayGroupModule } from './closed-day-group/closed-day-group.module';

export const AppModules = [
  AuthModule,
  StoreModule,
  UserModule,
  SeatAttributeGroupModule,
  SeatAttributeModule,
  SeatModule,
  LayoutModule,
  ScheduleModule,
  ClosedDayGroupModule,
];
