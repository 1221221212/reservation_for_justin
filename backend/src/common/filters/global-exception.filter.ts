// backend/src/common/filters/global-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        // --- ログ出力 ---
        const stack = exception instanceof Error
            ? exception.stack
            : JSON.stringify(exception);
        this.logger.error(`HTTP ${req.method} ${req.url}`, stack);

        // --- レスポンス整形 ---
        let status: number;
        let body: ApiErrorResponse;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const resp = exception.getResponse() as
                | string
                | { message?: any; error?: string;[key: string]: any };

            // rawMessage は string または string[] または object
            const rawMessage = typeof resp === 'string'
                ? resp
                : resp.message ?? resp.error ?? '予期せぬエラーが発生しました';

            // message フィールド設定
            if (Array.isArray(rawMessage) && rawMessage.every(m => typeof m === 'string')) {
                body = { statusCode: status, message: rawMessage.join(', ') };
            } else if (typeof rawMessage === 'string') {
                body = { statusCode: status, message: rawMessage };
            } else {
                body = { statusCode: status, message: JSON.stringify(rawMessage) };
            }

            // ValidationPipe 由来の詳細エラー (ValidationError オブジェクト配列)
            if (Array.isArray((resp as any).message) && typeof (resp as any).message[0] === 'object') {
                body.errors = (resp as any).message.map((m: any) => ({
                    field: m.property,
                    message: Object.values(m.constraints).join(', '),
                }));
            }

            // コード情報があれば追加
            if (typeof resp === 'object' && 'code' in resp) {
                body.code = resp['code'];
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            body = {
                statusCode: status,
                message: 'Internal server error',
            };
        }

        res.status(status).json(body);
    }
}
