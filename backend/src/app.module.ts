// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModules } from './modules';
import { SpecialDayModule } from './modules/special-day/special-day.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...AppModules,
    SpecialDayModule,
  ],
})
export class AppModule {}
