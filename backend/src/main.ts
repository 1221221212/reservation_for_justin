// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';

;(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // 全例外を一元処理するフィルタ（ログ出力＋レスポンス整形）
  app.useGlobalFilters(new GlobalExceptionFilter());

  // DTO のバリデーションをグローバルに有効化
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 全ルートに v1 プレフィックス
  app.setGlobalPrefix('v1');

  // CORS 設定
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}/v1`, 'Bootstrap');
}
bootstrap();
