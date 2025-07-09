import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { StoreScopeGuard } from '../guards/store-scope.guard';
import { Roles, ROLES_KEY } from './roles.decorator';
import { RequireStore, STORE_KEY } from './require-store.decorator';

export function Auth(options: {
  roles?: string[];
  requireStore?: boolean;
}) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard, StoreScopeGuard),
  ];
  // ロール指定がある場合
  if (options.roles && options.roles.length) {
    decorators.push(SetMetadata(ROLES_KEY, options.roles));
  }
  // テナントスコープが必要なら
  if (options.requireStore) {
    decorators.push(SetMetadata(STORE_KEY, true));
  }
  return applyDecorators(...decorators);
}
