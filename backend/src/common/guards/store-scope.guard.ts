import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class StoreScopeGuard implements CanActivate {
    private readonly logger = new Logger(StoreScopeGuard.name);

    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        const storeIdParam = Number(req.params.storeId);
        this.logger.debug('StoreScopeGuard#canActivate', { user, storeIdParam });

        if (user.role === Role.OWNER) {
            this.logger.debug('StoreScopeGuard: owner bypass');
            return true;
        }
        if (user.storeId === storeIdParam) {
            this.logger.debug('StoreScopeGuard: storeId matched');
            return true;
        }
        this.logger.error('StoreScopeGuard: forbidden', { userStoreId: user.storeId, param: storeIdParam });
        throw new ForbiddenException('この店舗へのアクセス権限がありません');
    }
}
