// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModules } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...AppModules,
  ],
})
export class AppModule {}
