import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const roles = this.reflector.get<Role[]>('roles', ctx.getHandler());
    this.logger.debug('RolesGuard#canActivate', { user: req.user, rolesAllowed: roles });

    if (req.user?.role === Role.OWNER) {
      this.logger.debug('RolesGuard: owner bypass');
      return true;
    }
    if (roles && req.user && roles.includes(req.user.role)) {
      this.logger.debug('RolesGuard: role allowed');
      return true;
    }
    this.logger.error('RolesGuard: forbidden', { userRole: req.user?.role });
    throw new ForbiddenException('権限がありません');
  }
}
